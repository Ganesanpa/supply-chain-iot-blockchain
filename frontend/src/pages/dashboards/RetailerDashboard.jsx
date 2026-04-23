import { useEffect, useMemo, useState } from "react";
import { getBatches, updateBatchStage } from "../../services/api/batch";
import BatchTimeline from "../../components/BatchTimeline";
import { QRCodeCanvas } from "qrcode.react";
import { Link } from "react-router-dom";

function RetailerDashboard() {
  const [batches, setBatches] = useState([]);
  const [deliveringId, setDeliveringId] = useState("");

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    const data = await getBatches();
    setBatches(data);
  };

  const retailerBatches = batches.filter(
    (batch) =>
      String(batch.stage).toLowerCase() === "retailer" ||
      String(batch.stage).toLowerCase() === "delivered"
  );

  const deliveredCount = retailerBatches.filter(
    (batch) => String(batch.stage).toLowerCase() === "delivered"
  ).length;

  const pendingDeliveryCount = retailerBatches.filter(
    (batch) => String(batch.stage).toLowerCase() === "retailer"
  ).length;

  const totalQuantity = useMemo(
    () =>
      retailerBatches.reduce(
        (sum, batch) => sum + Number(batch.quantity || 0),
        0
      ),
    [retailerBatches]
  );

  const getFreshnessBadge = (freshness) => {
    if (freshness === "Fresh") {
      return "bg-green-100 text-green-700";
    }
    if (freshness === "Moderate") {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-red-100 text-red-700";
  };

  const formatLabel = (value) => {
    if (!value) return "-";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const handleDeliver = async (id) => {
    const updateWithLocation = async (lat = null, lng = null) => {
      try {
        setDeliveringId(id);

        const res = await updateBatchStage(id, "Delivered", lat, lng);

        if (res.message) {
          alert(res.message);
        }

        alert("Marked Delivered");
        fetchBatches();
      } catch (error) {
        console.error("Deliver error:", error);
        alert("Failed to mark batch as delivered");
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
      <div className="bg-gradient-to-r from-purple-700 to-fuchsia-600 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-fuchsia-100 text-sm md:text-base">
              Smart Farm Supply Chain
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Retailer Dashboard 🏪
            </h1>
            <p className="mt-2 text-fuchsia-100 max-w-2xl">
              Review received batches, verify freshness, mark final delivery,
              and generate customer QR verification for traceability.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <MiniCard label="Retailer Batches" value={retailerBatches.length} />
            <MiniCard label="Delivered" value={deliveredCount} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Received Batches"
          value={retailerBatches.length}
          emoji="📦"
          color="from-purple-500 to-fuchsia-600"
        />
        <StatCard
          title="Pending Delivery"
          value={pendingDeliveryCount}
          emoji="🕒"
          color="from-orange-500 to-amber-600"
        />
        <StatCard
          title="Delivered"
          value={deliveredCount}
          emoji="✅"
          color="from-green-500 to-emerald-600"
        />
        <StatCard
          title="Total Quantity"
          value={`${totalQuantity} kg`}
          emoji="⚖️"
          color="from-blue-500 to-cyan-600"
        />
      </div>

      {/* Empty State */}
      {retailerBatches.length === 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
          No batches received yet.
        </div>
      )}

      {/* Batch Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {retailerBatches.map((batch) => (
          <div
            key={batch._id}
            className="bg-white shadow-sm rounded-3xl p-6 border border-gray-100"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Product</p>
                <h2 className="text-2xl font-bold text-gray-800 mt-1">
                  {batch.product}
                </h2>
                <p className="text-sm text-gray-500 mt-2 break-all">
                  Batch ID: {batch._id}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getFreshnessBadge(
                    batch.freshness
                  )}`}
                >
                  {batch.freshness}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    String(batch.stage).toLowerCase() === "delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {formatLabel(batch.stage)}
                </span>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <InfoPill label="Quantity" value={`${batch.quantity} kg`} />
              <InfoPill label="Harvest Date" value={batch.harvestDate || "-"} />
            </div>

            {/* Timeline */}
            <div className="mt-6">
              <h3 className="font-bold text-gray-800 mb-3">
                Supply Chain Journey
              </h3>
              <BatchTimeline history={batch.history || []} />
            </div>

            {/* Journey Text */}
            <div className="mt-6">
              <h3 className="font-bold text-gray-800 mb-2">Journey</h3>
              <p className="text-sm text-gray-600">
                {(batch.history || []).map(formatLabel).join(" → ")}
              </p>
            </div>

            {/* Timeline List */}
            <div className="mt-6">
              <h3 className="font-bold text-gray-800 mb-2">Timeline</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {batch.timestamps &&
                  Object.entries(batch.timestamps).map(([stage, time]) => (
                    <li
                      key={stage}
                      className="border-b border-gray-100 pb-2 last:border-b-0"
                    >
                      <strong>{formatLabel(stage)}</strong> - {time}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Event History */}
            {batch.eventHistory?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-gray-800 mb-3">
                  Event History
                </h3>

                <div className="space-y-3">
                  {batch.eventHistory.slice(-3).map((event, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-purple-500 bg-gray-50 rounded-r-xl p-3"
                    >
                      <p className="font-semibold text-gray-800">
                        {formatLabel(event.action)} → {formatLabel(event.stage)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.note || "-"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.timestamp
                          ? new Date(event.timestamp).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deliver / Delivered Block */}
            {String(batch.stage).toLowerCase() !== "delivered" ? (
              <button
                onClick={() => handleDeliver(batch._id)}
                disabled={deliveringId === batch._id}
                className="mt-6 w-full bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white py-3 rounded-2xl font-semibold transition"
              >
                {deliveringId === batch._id
                  ? "Marking as Delivered..."
                  : "Confirm & Mark as Delivered"}
              </button>
            ) : (
              <div className="mt-6 bg-gray-50 border rounded-2xl p-5">
                <p className="text-green-600 font-bold text-lg">
                  ✅ Delivered & Locked
                </p>

                {/* Blockchain Info */}
                {batch.blockchain && (
                  <div className="text-sm mt-4 text-gray-600 space-y-2">
                    <p>
                      <strong>Tx Hash:</strong> {batch.blockchain.txHash}
                    </p>
                    <p>
                      <strong>Block:</strong> {batch.blockchain.blockNumber}
                    </p>
                    <p className="text-green-600 font-semibold">
                      Status: Blockchain Verified ✅
                    </p>
                    <p className="text-xs text-gray-500 break-all">
                      <strong>Digital Signature:</strong>{" "}
                      {batch.blockchain.digitalSignature}
                    </p>
                  </div>
                )}

                {/* QR Code */}
                <div className="mt-5">
                  <p className="font-semibold mb-3 text-gray-800">
                    Customer QR Verification
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Link
                      to={`/verify/${batch._id}`}
                      className="w-fit bg-white p-3 rounded-2xl border shadow-sm"
                    >
                      <QRCodeCanvas
                        value={`${window.location.origin}/verify/${batch._id}`}
                        size={120}
                      />
                    </Link>

                    <div>
                      <p className="text-sm text-gray-600">
                        Scan or click the QR code to verify product traceability.
                      </p>
                      <Link
                        to={`/verify/${batch._id}`}
                        className="inline-block mt-3 text-purple-700 font-semibold hover:underline"
                      >
                        Open Verification Page
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
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
      <p className="text-fuchsia-100 text-sm">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <h4 className="text-base font-semibold text-gray-800 mt-1">{value}</h4>
    </div>
  );
}

export default RetailerDashboard;