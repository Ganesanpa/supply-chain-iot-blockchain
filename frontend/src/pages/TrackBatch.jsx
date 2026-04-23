import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ShipmentMap from "../components/ShipmentMap";
import AlertCard from "../components/AlertCard";
import { getBatchById, getAlerts } from "../services/api";

function TrackBatch() {
  const { id } = useParams();
  const [batch, setBatch] = useState(null);

  const [alertsRealtime, setAlertsRealtime] = useState([]);
  const [alertsHistory, setAlertsHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBatchById(id);
        setBatch(data);
      } catch (error) {
        console.error("Error fetching batch:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!batch) return;

    const newAlerts = [];

    if (batch.temperature > 35) {
      newAlerts.push({
        type: "Temperature",
        message: "High temperature detected!",
      });
    }

    if (batch.humidity > 80) {
      newAlerts.push({
        type: "Humidity",
        message: "Humidity too high!",
      });
    }

    if (batch.vibration === 1 || batch.vibration === "1") {
      newAlerts.push({
        type: "Vibration",
        message: "Shock or damage detected!",
      });
    }

    if (batch.light > 50) {
      newAlerts.push({
        type: "Light",
        message: "Possible package opened or unusual light exposure detected!",
      });
    }

    setAlertsRealtime((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(newAlerts)) {
        return newAlerts;
      }
      return prev;
    });

    if (newAlerts.length > 0 && alertsRealtime.length === 0) {
      new Audio("/alert.mp3").play().catch(() => {});
    }
  }, [batch, alertsRealtime]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAlerts(id);
        setAlertsHistory(data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const stats = useMemo(() => {
    if (!batch) {
      return {
        routePoints: 0,
        events: 0,
        alerts: 0,
      };
    }

    return {
      routePoints: batch.locationHistory?.length || 0,
      events: batch.eventHistory?.length || 0,
      alerts: alertsHistory.length || 0,
    };
  }, [batch, alertsHistory]);

  const formatLabel = (value) => {
    if (!value) return "-";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
          Loading live batch monitoring...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-800 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-blue-100 text-sm md:text-base">
              Smart Farm Supply Chain
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Live Batch Monitoring 🚛
            </h1>
            <p className="mt-2 text-blue-100 max-w-2xl">
              Monitor real-time batch conditions, track movement, view route
              progress, and inspect alert and event history.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <MiniCard label="Route Points" value={stats.routePoints} />
            <MiniCard label="Event Logs" value={stats.events} />
          </div>
        </div>
      </div>

      {/* Live Alerts */}
      {alertsRealtime.length > 0 && (
        <section className="space-y-3">
          {alertsRealtime.map((alert, index) => (
            <AlertCard
              key={index}
              type={alert.type}
              message={alert.message}
              onResolve={() =>
                setAlertsRealtime((prev) => prev.filter((_, i) => i !== index))
              }
            />
          ))}
        </section>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Temperature"
          value={`${batch.temperature?.toFixed(1) || 0} °C`}
          emoji="🌡️"
          color="from-red-500 to-rose-600"
        />
        <StatCard
          title="Humidity"
          value={`${batch.humidity?.toFixed(1) || 0} %`}
          emoji="💧"
          color="from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Vibration"
          value={
            batch.vibration === 1 || batch.vibration === "1"
              ? "Detected"
              : "Normal"
          }
          emoji="📳"
          color="from-yellow-500 to-amber-600"
        />
        <StatCard
          title="Light"
          value={`${batch.light ?? 0} lux`}
          emoji="💡"
          color="from-purple-500 to-fuchsia-600"
        />
      </div>

      {/* Quick Info */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Batch Overview
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Live status and current route position.
              </p>
            </div>

            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold w-fit">
              {formatLabel(batch.stage)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <InfoPill label="Batch ID" value={batch._id} breakAll />
            <InfoPill label="Product" value={batch.product || "-"} />
            <InfoPill
              label="Current Location"
              value={`${batch.location?.lat?.toFixed(4) || 0}, ${
                batch.location?.lng?.toFixed(4) || 0
              }`}
            />
            <InfoPill label="Total Alerts" value={stats.alerts} />
          </div>

          <div className="mt-6">
            <ShipmentMap
              mode="live"
              location={batch.location}
              locationHistory={batch.locationHistory}
              batchId={batch._id}
              stage={batch.stage}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h2 className="text-xl font-bold text-gray-800">
            Monitoring Summary
          </h2>

          <div className="mt-5 space-y-4">
            <SummaryCard
              title="Stage"
              value={formatLabel(batch.stage)}
              color="bg-blue-50 text-blue-700"
            />
            <SummaryCard
              title="Route History"
              value={`${batch.locationHistory?.length || 0} points`}
              color="bg-green-50 text-green-700"
            />
            <SummaryCard
              title="Event History"
              value={`${batch.eventHistory?.length || 0} events`}
              color="bg-purple-50 text-purple-700"
            />
            <SummaryCard
              title="Alert Records"
              value={`${alertsHistory.length} alerts`}
              color="bg-red-50 text-red-700"
            />
          </div>
        </div>
      </section>

      {/* Alert History + Event History */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Alert History */}
        <section className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            🚨 Alert History
          </h2>

          {alertsHistory.length === 0 ? (
            <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
              No alerts found for this batch.
            </div>
          ) : (
            <div className="space-y-3">
              {alertsHistory.map((a) => (
                <div
                  key={a._id}
                  className="border-l-4 border-red-500 bg-gray-50 rounded-r-2xl p-4"
                >
                  <p className="font-semibold text-red-600">{a.type} Alert</p>
                  <p className="text-sm text-gray-700 mt-1">{a.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(a.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Supply Chain Events */}
        <section className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Supply Chain Events
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
                  className="border-l-4 border-blue-500 bg-gray-50 rounded-r-2xl p-4"
                >
                  <p className="font-semibold text-gray-800">
                    {formatLabel(event.action)} → {formatLabel(event.stage)}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {event.note || "-"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, emoji, color }) {
  return (
    <div className={`bg-gradient-to-r ${color} text-white p-5 rounded-3xl shadow-md`}>
      <div className="flex items-center justify-between">
        <p className="text-white/90 font-medium">{title}</p>
        <span className="text-2xl">{emoji}</span>
      </div>
      <h2 className="text-3xl font-bold mt-4">{value}</h2>
    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
      <p className="text-blue-100 text-sm">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function InfoPill({ label, value, breakAll = false }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <h4
        className={`text-base font-semibold text-gray-800 mt-1 ${
          breakAll ? "break-all" : ""
        }`}
      >
        {value}
      </h4>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <p className="text-sm font-medium">{title}</p>
      <h3 className="text-lg font-bold mt-1">{value}</h3>
    </div>
  );
}

export default TrackBatch;