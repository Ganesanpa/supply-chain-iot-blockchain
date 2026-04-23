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

function DistributorDashboard() {
  const [batches, setBatches] = useState([]);
  const [activeBatch, setActiveBatch] = useState(null);
  const [status, setStatus] = useState({});
  const [sensorHistory, setSensorHistory] = useState([]);
  const [received, setReceived] = useState({});
  const [deliveringId, setDeliveringId] = useState("");

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
      console.log("Active batch data:", activeData);

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
      console.error("Error fetching distributor data:", error);
    }
  };

  const distributorBatches = batches.filter(
    (batch) => String(batch.stage).toLowerCase() === "distributor"
  );

  const totalBatches = distributorBatches.length;
  const inTransitCount = Object.values(status).filter(
    (value) => value === "In Transit"
  ).length;
  const activeTrackingCount = activeBatch ? 1 : 0;
  const totalQuantity = useMemo(
    () =>
      distributorBatches.reduce(
        (sum, batch) => sum + Number(batch.quantity || 0),
        0
      ),
    [distributorBatches]
  );

  const alerts = [];

  if (activeBatch?.temperature > 35) {
    alerts.push({
      type: "Temperature",
      message: "High temperature detected during transport!",
    });
  }

  if (activeBatch?.humidity > 80) {
    alerts.push({
      type: "Humidity",
      message: "Humidity too high during transport!",
    });
  }

  if (activeBatch?.vibration === 1) {
    alerts.push({
      type: "Vibration",
      message: "Shock detected during transport!",
    });
  }

  if (activeBatch?.light > 50) {
    alerts.push({
      type: "Light",
      message: "Possible package opened or unusual light exposure detected!",
    });
  }

  const handleStartTransport = (batchId) => {
    setStatus((prev) => ({
      ...prev,
      [batchId]: "In Transit",
    }));
  };

  const handleConfirmDelivery = async (batchId) => {
    const updateWithLocation = async (lat = null, lng = null) => {
      try {
        setDeliveringId(batchId);

        const res = await updateBatchStage(batchId, "Warehouse", lat, lng);

        if (res.message) {
          alert(res.message);
        }

        alert("Batch delivered to Warehouse ✔");
        fetchAllData();
      } catch (error) {
        console.error("Delivery update error:", error);
        alert("Failed to update delivery");
      } finally {
        setDeliveringId("");
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
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-cyan-100 text-sm md:text-base">
              Smart Farm Supply Chain
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Distributor Dashboard 🚚
            </h1>
            <p className="mt-2 text-cyan-100 max-w-2xl">
              Monitor live sensor data, track active shipments, and move batches
              from distributor to warehouse safely.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <MiniCard label="Distributor Batches" value={totalBatches} />
            <MiniCard label="Live Tracking" value={activeTrackingCount} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Received Batches"
          value={totalBatches}
          emoji="📦"
          color="from-blue-500 to-cyan-600"
        />
        <StatCard
          title="In Transit"
          value={inTransitCount}
          emoji="🚛"
          color="from-indigo-500 to-blue-600"
        />
        <StatCard
          title="Active Tracking"
          value={activeTrackingCount}
          emoji="📡"
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          title="Total Quantity"
          value={`${totalQuantity} kg`}
          emoji="⚖️"
          color="from-orange-500 to-amber-600"
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="space-y-3">
          {alerts.map((alert, index) => (
            <AlertCard
              key={index}
              type={alert.type}
              message={alert.message}
              onResolve={() => {}}
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
                Live Sensor Monitoring
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Real-time monitoring for the currently active batch.
              </p>
            </div>

            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold w-fit">
              Live Tracking Active
            </div>
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

          <ShipmentMap
            mode="live"
            location={activeBatch.location}
            locationHistory={activeBatch.locationHistory}
            batchId={activeBatch._id}
            stage={activeBatch.stage}
          />
        </section>
      )}

      {/* Batch Table */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Products Received from Farmers
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Receive, start transport, and deliver batches to warehouse.
            </p>
          </div>

          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold w-fit">
            {distributorBatches.length} Batches
          </div>
        </div>

        {distributorBatches.length === 0 ? (
          <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
            No products received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-4 text-left rounded-l-2xl">Batch ID</th>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Quantity</th>
                  <th className="p-4 text-left">Harvest Date</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left rounded-r-2xl">Actions</th>
                </tr>
              </thead>

              <tbody>
                {distributorBatches.map((batch) => (
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
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {status[batch._id] || (received[batch._id] ? "Received" : "Pending")}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            setReceived((prev) => ({
                              ...prev,
                              [batch._id]: true,
                            }))
                          }
                          className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-semibold transition"
                        >
                          Receive
                        </button>

                        <button
                          onClick={() => handleStartTransport(batch._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition"
                        >
                          Start Transport
                        </button>

                        <button
                          onClick={() => handleConfirmDelivery(batch._id)}
                          disabled={deliveringId === batch._id}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white px-4 py-2 rounded-xl font-semibold transition"
                        >
                          {deliveringId === batch._id ? "Delivering..." : "Deliver"}
                        </button>
                      </div>
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
                type="natural"
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
                type="natural"
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
      <p className="text-cyan-100 text-sm">{label}</p>
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
      <p className={`text-2xl font-bold mt-3 text-gray-800 ${breakAll ? "break-all text-base" : ""}`}>
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-gray-500 mt-2 break-all">{subValue}</p>
      )}
    </div>
  );
}

export default DistributorDashboard;