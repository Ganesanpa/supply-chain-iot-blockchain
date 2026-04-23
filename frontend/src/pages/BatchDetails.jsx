import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import ShipmentMap from "../components/ShipmentMap";
import BatchTimeline from "../components/BatchTimeline";
import BatchQRCode from "../components/BatchQRCode";
import { getBatchById } from "../services/api/batch";

const formatLabel = (value) => {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

function BatchDetails() {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const foundBatch = await getBatchById(id);
        setBatch(foundBatch?._id ? foundBatch : null);
      } catch (error) {
        console.error(error);
        setBatch(null);
      }
    };

    fetchBatch();

    const interval = setInterval(fetchBatch, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const stats = useMemo(() => {
    if (!batch) {
      return {
        routePoints: 0,
        eventCount: 0,
        stageCount: 0,
      };
    }

    return {
      routePoints: batch.locationHistory?.length || 0,
      eventCount: batch.eventHistory?.length || 0,
      stageCount: batch.history?.length || 0,
    };
  }, [batch]);

  const getFreshnessBadge = (freshness) => {
    if (freshness === "Fresh") {
      return "bg-green-100 text-green-700";
    }
    if (freshness === "Moderate") {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-red-100 text-red-700";
  };

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Batch not found</h2>
          <p className="text-gray-500 mt-3">
            The requested batch details could not be loaded.
          </p>
          <Link
            to="/dashboard"
            className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-800 to-emerald-700 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-emerald-100 text-sm md:text-base">
              Smart Farm Supply Chain
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Batch Details
            </h1>
            <p className="mt-2 text-emerald-100 max-w-2xl break-all">
              Batch ID: {batch._id}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <MiniCard label="Route Points" value={stats.routePoints} />
            <MiniCard label="Events" value={stats.eventCount} />
          </div>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        <InfoCard title="Product" value={batch.product} emoji="🌾" />
        <InfoCard title="Stage" value={formatLabel(batch.stage)} emoji="📍" />
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Freshness</p>
            <span className="text-xl">🥬</span>
          </div>
          <div className="mt-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getFreshnessBadge(
                batch.freshness
              )}`}
            >
              {batch.freshness}
            </span>
          </div>
        </div>
        <InfoCard title="Device ID" value={batch.deviceId || "-"} emoji="📟" />
        <InfoCard
          title="Tracking Status"
          value={batch.isActive ? "Active" : "Inactive"}
          emoji={batch.isActive ? "🟢" : "⚪"}
        />
      </div>

      {/* Sensor Summary */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          Sensor Summary
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <SensorCard
            title="Temperature"
            value={`${batch.temperature ?? 0} °C`}
            emoji="🌡️"
            bg="bg-red-50"
          />
          <SensorCard
            title="Humidity"
            value={`${batch.humidity ?? 0} %`}
            emoji="💧"
            bg="bg-blue-50"
          />
          <SensorCard
            title="Vibration"
            value={batch.vibration === 1 ? "Detected ⚠" : "Normal"}
            emoji="📳"
            bg="bg-yellow-50"
          />
          <SensorCard
            title="Light"
            value={`${batch.light ?? 0} lux`}
            emoji="💡"
            bg="bg-amber-50"
          />
        </div>
      </section>

      {/* Journey */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          Supply Chain Journey
        </h2>
        <BatchTimeline history={batch.history || []} />

        <div className="mt-6 bg-gray-50 border rounded-2xl p-4">
          <p className="text-sm text-gray-500">Journey Path</p>
          <p className="text-sm md:text-base text-gray-700 mt-2">
            {(batch.history || []).map(formatLabel).join(" → ")}
          </p>
        </div>
      </section>

      {/* Event History + Stage Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Event History
          </h2>

          {!batch.eventHistory || batch.eventHistory.length === 0 ? (
            <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
              No event history available.
            </div>
          ) : (
            <div className="space-y-3">
              {batch.eventHistory.map((event, index) => (
                <div
                  key={index}
                  className="border-l-4 border-green-500 bg-gray-50 rounded-r-2xl p-4"
                >
                  <p className="font-semibold text-gray-800">
                    {formatLabel(event.action)} → {formatLabel(event.stage)}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    👤 Role: {formatLabel(event.role)}
                  </p>

                  <p className="text-sm text-gray-700 mt-1 break-words">
                    📝 {event.note || "-"}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    🕒 {formatDateTime(event.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Stage Timeline
          </h2>

          {!batch.timestamps || Object.keys(batch.timestamps).length === 0 ? (
            <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
              No timeline data available.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(batch.timestamps).map(([stage, time]) => (
                <div
                  key={stage}
                  className="bg-gray-50 border rounded-2xl p-4"
                >
                  <p className="font-semibold text-gray-800">
                    {formatLabel(stage)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{time}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Route Map */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          Shipment Location
        </h2>

        <ShipmentMap
          mode="history"
          location={batch.location}
          locationHistory={batch.locationHistory}
          batchId={batch._id}
          stage={batch.stage}
        />
      </section>

      {/* Location History */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Location History
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Checkpoint and route data captured across the batch lifecycle.
            </p>
          </div>

          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold w-fit">
            {batch.locationHistory?.length || 0} Points
          </div>
        </div>

        {!batch.locationHistory || batch.locationHistory.length === 0 ? (
          <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
            No location history available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-4 text-left rounded-l-2xl">Stage</th>
                  <th className="p-4 text-left">Latitude</th>
                  <th className="p-4 text-left">Longitude</th>
                  <th className="p-4 text-left">Source</th>
                  <th className="p-4 text-left rounded-r-2xl">Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {batch.locationHistory.map((loc, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {formatLabel(loc.stage)}
                    </td>
                    <td className="p-4 text-gray-700">{loc.lat}</td>
                    <td className="p-4 text-gray-700">{loc.lng}</td>
                    <td className="p-4 text-gray-700">
                      {formatLabel(loc.source)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {formatDateTime(loc.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Blockchain + QR */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {batch.blockchain ? (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Blockchain Record
            </h2>

            <div className="space-y-4">
              <StatusCard label="Verification" value="Verified ✅" good />
              <DetailBox label="Transaction Hash" value={batch.blockchain.txHash} />
              <DetailBox label="Block Number" value={batch.blockchain.blockNumber} />
              <DetailBox
                label="Digital Signature"
                value={batch.blockchain.digitalSignature}
                breakAll
              />
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Blockchain Record
            </h2>
            <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
              No blockchain record available.
            </div>
          </section>
        )}

        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Product QR Code
          </h2>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="bg-gray-50 border rounded-3xl p-5 w-fit">
              <BatchQRCode batchId={batch._id} />
            </div>

            <div>
              <p className="text-gray-700">
                Scan this QR code to open the product verification page and
                review the full traceability history.
              </p>

              <Link
                to={`/verify/${batch._id}`}
                className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold transition"
              >
                Open Verification Page
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoCard({ title, value, emoji }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{title}</p>
        <span className="text-xl">{emoji}</span>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mt-4">{value}</h3>
    </div>
  );
}

function SensorCard({ title, value, emoji, bg }) {
  return (
    <div className={`${bg} rounded-2xl border p-4`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <span className="text-xl">{emoji}</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mt-3">{value}</h3>
    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
      <p className="text-emerald-100 text-sm">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function StatusCard({ label, value, good }) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        good ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
      }`}
    >
      <p className="text-sm font-medium">{label}</p>
      <h3 className="text-lg font-bold mt-1">{value}</h3>
    </div>
  );
}

function DetailBox({ label, value, breakAll = false }) {
  return (
    <div className="bg-gray-50 rounded-2xl border p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-sm font-medium text-gray-800 mt-1 ${breakAll ? "break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export default BatchDetails;