import { useEffect, useMemo, useState } from "react";
import {
  getBatches,
  createBatch,
  activateBatchTracking,
  getActiveBatch,
} from "../../services/api/batch";

function FarmerDashboard() {
  const [batches, setBatches] = useState([]);
  const [activeBatch, setActiveBatch] = useState(null);

  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [deviceId, setDeviceId] = useState("ESP32_1");

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [activatingId, setActivatingId] = useState("");

  useEffect(() => {
    fetchBatches();
    fetchActiveBatch();
  }, []);

  const fetchBatches = async () => {
    const data = await getBatches();
    setBatches(data);
  };

  const fetchActiveBatch = async () => {
    const data = await getActiveBatch();
    if (!data.message) {
      setActiveBatch(data);
    } else {
      setActiveBatch(null);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    const createWithLocation = async (lat = null, lng = null) => {
      try {
        setLoadingCreate(true);

        const result = await createBatch({
          product,
          quantity,
          harvestDate,
          deviceId,
          lat,
          lng,
        });

        console.log("Created batch:", result);
        alert("Batch created 🚛");

        setProduct("");
        setQuantity("");
        setHarvestDate("");

        fetchBatches();
      } catch (error) {
        console.error("Create batch error:", error);
        alert("Failed to create batch");
      } finally {
        setLoadingCreate(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await createWithLocation(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        async () => {
          await createWithLocation();
        }
      );
    } else {
      await createWithLocation();
    }
  };

  const handleActivate = async (id) => {
    try {
      setActivatingId(id);

      const res = await activateBatchTracking(id);
      alert(res.message);

      fetchBatches();
      fetchActiveBatch();
    } catch (error) {
      console.error("Activate error:", error);
      alert("Failed to activate batch");
    } finally {
      setActivatingId("");
    }
  };

  const farmerBatches = batches;

  const totalBatches = farmerBatches.length;
  const activeCount = farmerBatches.filter((b) => b.isActive).length;
  const deliveredCount = farmerBatches.filter(
    (b) => String(b.stage).toLowerCase() === "delivered"
  ).length;
  const totalQuantity = useMemo(
    () =>
      farmerBatches.reduce((sum, batch) => sum + Number(batch.quantity || 0), 0),
    [farmerBatches]
  );

  const formatStage = (stage) => {
    if (!stage) return "-";
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-green-100 text-sm md:text-base">
              Smart Farm Supply Chain
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Farmer Dashboard 🌾
            </h1>
            <p className="mt-2 text-green-100 max-w-2xl">
              Create new harvest batches, activate live tracking, and monitor
              batch movement from your farm to the supply chain.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <MiniCard label="Total Batches" value={totalBatches} />
            <MiniCard label="Active Tracking" value={activeCount} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Batches"
          value={totalBatches}
          emoji="📦"
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          title="Active"
          value={activeCount}
          emoji="🚀"
          color="from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Delivered"
          value={deliveredCount}
          emoji="✅"
          color="from-purple-500 to-fuchsia-600"
        />
        <StatCard
          title="Total Quantity"
          value={`${totalQuantity} kg`}
          emoji="⚖️"
          color="from-orange-500 to-amber-600"
        />
      </div>

      {/* Active Batch Card */}
      {activeBatch && (
        <section className="bg-white border border-green-100 rounded-3xl shadow-sm p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                Active Tracking
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                {activeBatch.product}
              </h2>

              <div className="mt-3 space-y-1 text-gray-600">
                <p>
                  <strong>Batch ID:</strong>{" "}
                  <span className="break-all">{activeBatch._id}</span>
                </p>
                <p>
                  <strong>Current Stage:</strong> {formatStage(activeBatch.stage)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[220px]">
              <InfoPill label="Temperature" value={`${activeBatch.temperature ?? 0} °C`} />
              <InfoPill label="Humidity" value={`${activeBatch.humidity ?? 0} %`} />
              <InfoPill
                label="Vibration"
                value={activeBatch.vibration === 1 ? "Detected" : "Normal"}
              />
              <InfoPill
                label="Route Points"
                value={activeBatch.locationHistory?.length ?? 0}
              />
            </div>
          </div>
        </section>
      )}

      {/* Create Batch + Quick Info */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Create Form */}
        <section className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-800">
              Add Harvest Product
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create a new batch and send it to the supply chain.
            </p>
          </div>

          <form onSubmit={handleCreateBatch} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                placeholder="Enter product name"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
                className="w-full border border-gray-300 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (kg)
              </label>
              <input
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full border border-gray-300 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harvest Date
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                required
                className="w-full border border-gray-300 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device ID
              </label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                required
                className="w-full border border-gray-300 p-3 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loadingCreate}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                {loadingCreate ? "Creating..." : "Create Batch"}
              </button>
            </div>
          </form>
        </section>

        {/* Tips / Side Card */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h2 className="text-xl font-bold text-gray-800">
            Farmer Quick Notes
          </h2>

          <div className="mt-5 space-y-4">
            <QuickNote
              title="Create Batch"
              desc="Add product, quantity, harvest date, and device ID to register a new harvest batch."
              color="bg-green-50 text-green-700"
            />
            <QuickNote
              title="Tracking"
              desc="Activate tracking for the batch that is currently connected to the ESP32 device."
              color="bg-blue-50 text-blue-700"
            />
            <QuickNote
              title="Location"
              desc="Your browser location is captured during batch creation to store the first farm checkpoint."
              color="bg-yellow-50 text-yellow-700"
            />
          </div>
        </section>
      </div>

      {/* Batch Table */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Batches</h2>
            <p className="text-sm text-gray-500 mt-1">
              View all created batches and activate tracking when needed.
            </p>
          </div>

          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            {farmerBatches.length} Total
          </div>
        </div>

        {farmerBatches.length === 0 ? (
          <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
            No batches created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-4 text-left rounded-l-2xl">Batch ID</th>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Quantity</th>
                  <th className="p-4 text-left">Stage</th>
                  <th className="p-4 text-left">Tracking</th>
                  <th className="p-4 text-left rounded-r-2xl">Action</th>
                </tr>
              </thead>

              <tbody>
                {farmerBatches.map((batch) => (
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

                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {formatStage(batch.stage)}
                      </span>
                    </td>

                    <td className="p-4">
                      {batch.isActive ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {batch.isActive ? (
                        <span className="text-green-600 font-semibold text-sm">
                          Already Active
                        </span>
                      ) : (
                        <button
                          onClick={() => handleActivate(batch._id)}
                          disabled={activatingId === batch._id}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-4 py-2 rounded-xl font-semibold transition"
                        >
                          {activatingId === batch._id ? "Activating..." : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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
      <p className="text-green-100 text-sm">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <h4 className="text-base font-semibold text-gray-800 mt-1">{value}</h4>
    </div>
  );
}

function QuickNote({ title, desc, color }) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm mt-1 opacity-90">{desc}</p>
    </div>
  );
}

export default FarmerDashboard;