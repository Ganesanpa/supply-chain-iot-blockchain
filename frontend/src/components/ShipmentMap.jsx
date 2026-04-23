import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";

// Truck Icon
const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995470.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Checkpoint Icon
const checkpointIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// Default marker fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const isValidPoint = (point) => {
  if (!point) return false;

  const lat = Number(point.lat);
  const lng = Number(point.lng);

  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    lat !== 0 &&
    lng !== 0
  );
};

const formatLabel = (value) => {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [points, map]);

  return null;
}

function RecenterMap({ position, enabled }) {
  const map = useMap();

  useEffect(() => {
    if (enabled && position) {
      map.setView(position, 13);
    }
  }, [position, enabled, map]);

  return null;
}

function ShipmentMap({
  location,
  locationHistory = [],
  batchId,
  stage,
  mode = "live", // "live" or "history"
}) {
  const validHistory = useMemo(() => {
    return (locationHistory || [])
      .filter(isValidPoint)
      .map((item) => ({
        ...item,
        lat: Number(item.lat),
        lng: Number(item.lng),
        stage: item.stage ? String(item.stage).toLowerCase() : "",
      }));
  }, [locationHistory]);

  const currentValidLocation = useMemo(() => {
    if (isValidPoint(location)) {
      return [Number(location.lat), Number(location.lng)];
    }
    return null;
  }, [location]);

  const fallbackLastHistoryPoint = useMemo(() => {
    if (validHistory.length === 0) return null;
    const last = validHistory[validHistory.length - 1];
    return [last.lat, last.lng];
  }, [validHistory]);

  const staticPosition = currentValidLocation || fallbackLastHistoryPoint || null;

  const [animatedPosition, setAnimatedPosition] = useState(staticPosition);

  useEffect(() => {
    if (mode !== "live") return;
    if (!currentValidLocation) return;

    if (!animatedPosition) {
      setAnimatedPosition(currentValidLocation);
      return;
    }

    const start = animatedPosition;
    const end = currentValidLocation;

    if (start[0] === end[0] && start[1] === end[1]) return;

    const steps = 30;
    let step = 0;

    const deltaLat = (end[0] - start[0]) / steps;
    const deltaLng = (end[1] - start[1]) / steps;

    const interval = setInterval(() => {
      step++;

      setAnimatedPosition([
        start[0] + deltaLat * step,
        start[1] + deltaLng * step,
      ]);

      if (step >= steps) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [currentValidLocation, mode, animatedPosition]);

  useEffect(() => {
    if (mode === "history") {
      setAnimatedPosition(staticPosition);
    }
  }, [staticPosition, mode]);

  const polylinePoints = useMemo(() => {
    return validHistory.map((item) => [item.lat, item.lng]);
  }, [validHistory]);

  const checkpointStages = [
    "farmer",
    "distributor",
    "warehouse",
    "retailer",
    "delivered",
  ];

  const checkpoints = useMemo(() => {
    const stageMap = new Map();

    for (const item of validHistory) {
      if (checkpointStages.includes(item.stage) && !stageMap.has(item.stage)) {
        stageMap.set(item.stage, item);
      }
    }

    return Array.from(stageMap.values());
  }, [validHistory]);

  const displayPosition =
    mode === "live"
      ? animatedPosition || currentValidLocation || fallbackLastHistoryPoint
      : staticPosition;

  const allMapPoints = useMemo(() => {
    const points = [...polylinePoints];
    if (displayPosition) points.push(displayPosition);
    return points;
  }, [polylinePoints, displayPosition]);

  if (!displayPosition && polylinePoints.length === 0) {
    return (
      <div className="mt-10 bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {mode === "live"
            ? "🌾 Live Batch Monitoring Map"
            : "🗺️ Batch Travel Route"}
        </h3>

        <div className="h-[300px] sm:h-[400px] w-full rounded-xl border flex items-center justify-center bg-gray-50 text-gray-500 text-center px-4">
          No valid location data available yet.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {mode === "live"
          ? "🌾 Live Batch Monitoring Map"
          : "🗺️ Batch Travel Route"}
      </h3>

      {mode === "live" && !currentValidLocation && displayPosition && (
        <p className="text-sm text-yellow-600 mb-3">
          Showing last valid location. Live GPS is currently unavailable.
        </p>
      )}

      <MapContainer
        center={displayPosition || polylinePoints[0]}
        zoom={13}
        className="h-[300px] sm:h-[400px] w-full rounded-xl"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={allMapPoints} />
        <RecenterMap position={displayPosition} enabled={mode === "live"} />

        {/* Route Polyline */}
        {polylinePoints.length > 1 && (
          <Polyline
            positions={polylinePoints}
            pathOptions={{ color: "blue", weight: 4 }}
          />
        )}

        {/* Checkpoint Markers */}
        {checkpoints.map((point, index) => (
          <Marker
            key={`${point.stage}-${index}`}
            position={[point.lat, point.lng]}
            icon={checkpointIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>Checkpoint:</strong> {formatLabel(point.stage)} <br />
                <strong>Source:</strong> {formatLabel(point.source)} <br />
                <strong>Time:</strong>{" "}
                {new Date(point.timestamp).toLocaleString()} <br />
                <strong>Lat:</strong> {point.lat.toFixed(6)} <br />
                <strong>Lng:</strong> {point.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Current Truck Marker only in live mode */}
        {mode === "live" && displayPosition && (
          <Marker position={displayPosition} icon={truckIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Batch ID:</strong> {batchId || "N/A"} <br />
                <strong>Current Stage:</strong> {formatLabel(stage)} <br />
                <strong>Lat:</strong> {displayPosition[0].toFixed(6)} <br />
                <strong>Lng:</strong> {displayPosition[1].toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Final/Current marker in history mode */}
        {mode === "history" && displayPosition && (
          <Marker position={displayPosition}>
            <Popup>
              <div className="text-sm">
                <strong>Batch ID:</strong> {batchId || "N/A"} <br />
                <strong>Final Stage:</strong> {formatLabel(stage)} <br />
                <strong>Lat:</strong> {displayPosition[0].toFixed(6)} <br />
                <strong>Lng:</strong> {displayPosition[1].toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Route Points:</strong> {polylinePoints.length}</p>
        <p><strong>Checkpoints:</strong> {checkpoints.length}</p>
      </div>
    </div>
  );
}

export default ShipmentMap;