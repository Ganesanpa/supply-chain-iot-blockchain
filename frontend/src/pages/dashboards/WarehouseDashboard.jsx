import { useEffect, useMemo, useState } from "react";
import {
  getBatches,
  getActiveBatch,
  updateBatchStage,
} from "../../services/api/batch";
import ShipmentMap from "../../components/ShipmentMap";
import AlertCard from "../../components/AlertCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const TEMP_LIMIT = 35;
const HUMIDITY_LIMIT = 80;
const LIGHT_LIMIT = 50;

function WarehouseDashboard() {
  const [batches, setBatches] = useState([]);
  const [activeBatch, setActiveBatch] = useState(null);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [alertResolved, setAlertResolved] = useState(false);
  const [dispatchingId, setDispatchingId] = useState("");

  useEffect(() => {
    fetchAllData();

    const interval = setInterval(() => {
      fetchAllData();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const batchData = await getBatches();
      setBatches(batchData);

      const activeData = await getActiveBatch();

      if (!activeData.message) {
        setActiveBatch(activeData);

        setSensorHistory((prev) => [
          ...prev.slice(-9),
          {
            time: new Date().toLocaleTimeString(),
            temp: activeData.temperature || 0,
            humidity: activeData.humidity || 0,
          },
        ]);
      } else {
        setActiveBatch(null);
      }
    } catch (error) {
      console.error("Error fetching warehouse data:", error);
    }
  };

  const warehouseBatches = batches.filter(
    (batch) => String(batch.stage).toLowerCase() === "warehouse"
  );

  const totalBatches = warehouseBatches.length;
  const activeTrackingCount = activeBatch ? 1 : 0;
  const totalQuantity = useMemo(
    () =>
      warehouseBatches.reduce(
        (sum, batch) => sum + Number(batch.quantity || 0),
        0
      ),
    [warehouseBatches]
  );
  const moderateCount = warehouseBatches.filter(
    (batch) => batch.freshness === "Moderate"
  ).length;

  const alerts = [];

  if (activeBatch?.temperature > TEMP_LIMIT) {
    alerts.push({
      type: "Temperature",
      message: `Temperature exceeded safe limit (${TEMP_LIMIT}°C)`,
    });
  }

  if (activeBatch?.humidity > HUMIDITY_LIMIT) {
    alerts.push({
      type: "Humidity",
      message: `Humidity exceeded safe limit (${HUMIDITY_LIMIT}%)`,
    });
  }

  if (activeBatch?.vibration === 1) {
    alerts.push({
      type: "Vibration",
      message: "Shock or tampering detected in warehouse",
    });
  }

  if (activeBatch?.light > LIGHT_LIMIT) {
    alerts.push({
      type: "Light",
      message: "Possible package opened or unusual light exposure detected!",
    });
  }

  const visibleAlerts = alertResolved ? [] : alerts;

  const handleDispatch = async (batchId) => {
    const updateWithLocation = async (lat = null, lng = null) => {
      try {
        setDispatchingId(batchId);

        const res = await updateBatchStage(batchId, "Retailer", lat, lng);

        if (res.message) {
          alert(res.message);
        }

        alert("Batch dispatched to Retailer 🚚");
        fetchAllData();
      } catch (error) {
        console.error("Dispatch error:", error);
        alert("Failed to dispatch batch");
      } finally {
        setDispatchingId("");
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await updateWithLocation(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        async () => {
          await updateWithLocation();
        }
      );
    } else {
      await updateWithLocation();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-amber-100 text-sm md:text-base">
              Smart Farm Supply Chain
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Warehouse Dashboard 🏭
            </h1>
            <p className="mt-2 text-amber-100 max-w-2xl">
              Monitor storage conditions, watch live shipment activity, and
              dispatch batches safely from warehouse to retailer.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <MiniCard label="Warehouse Batches" value={totalBatches} />
            <MiniCard label="Live Tracking" value={activeTrackingCount} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Stored Batches"
          value={totalBatches}
          emoji="📦"
          color="from-orange-500 to-amber-600"
        />
        <StatCard
          title="Active Tracking"
          value={activeTrackingCount}
          emoji="📡"
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          title="Moderate Freshness"
          value={moderateCount}
          emoji="⚠️"
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Total Quantity"
          value={`${totalQuantity} kg`}
          emoji="⚖️"
          color="from-blue-500 to-cyan-600"
        />
      </div>

      {/* Alerts */}
      {visibleAlerts.length > 0 && (
        <section className="space-y-3">
          {visibleAlerts.map((alert, index) => (
            <AlertCard
              key={index}
              type={alert.type}
              message={alert.message}
              onResolve={() => setAlertResolved(true)}
            />
          ))}
        </section>
      )}

      {/* Live Sensor Monitoring */}
      {activeBatch && (
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Live Warehouse Sensor Monitoring
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Real-time monitoring for the active batch inside warehouse flow.
              </p>
            </div>

            {activeBatch?.isActive && (
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold w-fit">
                Live Tracking Active
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <SensorCard
              title="Temperature"
              value={`${activeBatch.temperature ?? 0} °C`}
              emoji="🌡️"
              bg="bg-red-50"
            />

            <SensorCard
              title="Humidity"
              value={`${activeBatch.humidity ?? 0} %`}
              emoji="💧"
              bg="bg-blue-50"
            />

            <SensorCard
              title="Vibration"
              value={activeBatch.vibration === 1 ? "Detected ⚠" : "Normal"}
              emoji="📳"
              bg="bg-yellow-50"
            />

            <SensorCard
              title="Light"
              value={`${activeBatch.light ?? 0} lux`}
              emoji="💡"
              bg="bg-amber-50"
            />

            <SensorCard
              title="Active Batch"
              value={activeBatch.product || activeBatch._id}
              subValue={activeBatch._id}
              emoji="📦"
              bg="bg-green-50"
              breakAll
            />
          </div>

          <div className="bg-white rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              📍 Live Batch Location
            </h3>

            <ShipmentMap
              mode="live"
              location={activeBatch.location}
              locationHistory={activeBatch.locationHistory}
              batchId={activeBatch._id}
              stage={activeBatch.stage}
            />
          </div>
        </section>
      )}

      {/* Warehouse Batches Table */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Batches in Warehouse
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Monitor stored batches and dispatch them to retailers.
            </p>
          </div>

          <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold w-fit">
            {warehouseBatches.length} Batches
          </div>
        </div>

        {warehouseBatches.length === 0 ? (
          <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
            No batches stored in warehouse.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-4 text-left rounded-l-2xl">Batch ID</th>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Quantity</th>
                  <th className="p-4 text-left">Harvest Date</th>
                  <th className="p-4 text-left">Freshness</th>
                  <th className="p-4 text-left rounded-r-2xl">Action</th>
                </tr>
              </thead>

              <tbody>
                {warehouseBatches.map((batch) => (
                  <tr
                    key={batch._id}
                    className="border-b last:border-b-0 hover:bg-gray-50 transition"
                  >
                    <td className="p-4 text-sm text-gray-600 break-all max-w-[220px]">
                      {batch._id}
                    </td>

                    <td className="p-4 font-medium text-gray-800">
                      {batch.product}
                    </td>

                    <td className="p-4 text-gray-700">
                      {batch.quantity} kg
                    </td>

                    <td className="p-4 text-gray-700">
                      {batch.harvestDate}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          batch.freshness === "Fresh"
                            ? "bg-green-100 text-green-700"
                            : batch.freshness === "Moderate"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {batch.freshness}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleDispatch(batch._id)}
                        disabled={dispatchingId === batch._id}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-4 py-2 rounded-xl font-semibold transition"
                      >
                        {dispatchingId === batch._id
                          ? "Dispatching..."
                          : "Dispatch to Retailer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Temperature Monitoring 🌡
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={sensorHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#ef4444"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Humidity Monitoring 💧
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={sensorHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
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
      <p className="text-amber-100 text-sm">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function SensorCard({ title, value, emoji, bg, subValue, breakAll = false }) {
  return (
    <div className={`${bg} p-4 rounded-2xl border`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="text-xl">{emoji}</span>
      </div>
      <p
        className={`text-2xl font-bold mt-3 text-gray-800 ${
          breakAll ? "break-all text-base" : ""
        }`}
      >
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-gray-500 mt-2 break-all">{subValue}</p>
      )}
    </div>
  );
}

export default WarehouseDashboard;