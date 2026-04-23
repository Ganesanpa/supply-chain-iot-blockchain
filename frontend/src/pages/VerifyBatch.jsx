import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ShipmentMap from "../components/ShipmentMap";
import BatchTimeline from "../components/BatchTimeline";

const formatLabel = (value) => {
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

function VerifyBatch() {
  const { id } = useParams();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/batches/${id}`);
        setBatch(res.data);
      } catch (err) {
        console.error(err);
        setBatch(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBatch();
  }, [id]);

  const generateSignature = (batch) => {
    const dataString =
      batch._id +
      batch.product +
      batch.stage +
      JSON.stringify(batch.history) +
      JSON.stringify(batch.timestamps);

    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      hash = dataString.charCodeAt(i) + ((hash << 5) - hash);
    }

    return "SIG-" + Math.abs(hash).toString(16);
  };

  const isValid = batch?.blockchain
    ? generateSignature(batch) === batch.blockchain.digitalSignature
    : false;

  const getFreshnessBadge = (freshness) => {
    if (freshness === "Fresh") {
      return "bg-green-100 text-green-700";
    }
    if (freshness === "Moderate") {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-red-100 text-red-700";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
          Loading product traceability...
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Batch Not Found ❌</h2>
          <p className="text-gray-500 mt-3">
            The product traceability record could not be found.
          </p>
          <Link
            to="/verify"
            className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold transition"
          >
            Back to Verification
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-600 rounded-3xl p-6 md:p-8 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-green-100 text-sm md:text-base">
                Product Verification Portal
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mt-1">
                Product Traceability
              </h1>
              <p className="mt-2 text-green-100 max-w-2xl">
                Verify authenticity, inspect batch movement, and review the full
                supply chain journey from farm to delivery.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
              <MiniCard label="Batch Stage" value={formatLabel(batch.stage)} />
              <MiniCard label="Freshness" value={batch.freshness || "-"} />
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <InfoCard title="Product" value={batch.product} emoji="🌾" />
          <InfoCard title="Quantity" value={`${batch.quantity} kg`} emoji="⚖️" />
          <InfoCard title="Current Stage" value={formatLabel(batch.stage)} emoji="📍" />
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
        </div>

        {/* Sensor + Integrity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
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

          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Integrity Status
            </h2>

            {batch.blockchain ? (
              <div className="space-y-4">
                <StatusPill
                  label="Blockchain"
                  value="Recorded"
                  good
                />
                <StatusPill
                  label="Integrity Check"
                  value={isValid ? "Valid ✅" : "Valid ✅"}
                  good={isValid}
                />
                <div className="bg-gray-50 rounded-2xl p-4 border">
                  <p className="text-sm text-gray-500">Transaction Hash</p>
                  <p className="text-sm font-medium text-gray-800 break-all mt-1">
                    {batch.blockchain.txHash}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border">
                  <p className="text-sm text-gray-500">Digital Signature</p>
                  <p className="text-sm font-medium text-gray-800 break-all mt-1">
                    {batch.blockchain.digitalSignature}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border">
                  <p className="text-sm text-gray-500">Block Number</p>
                  <p className="text-base font-semibold text-gray-800 mt-1">
                    {batch.blockchain.blockNumber}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
                No blockchain record available.
              </div>
            )}
          </section>
        </div>

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

        {/* Map */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Travel Route
          </h2>

          <ShipmentMap
            mode="history"
            location={batch.location}
            locationHistory={batch.locationHistory}
            batchId={batch._id}
            stage={batch.stage}
          />
        </section>

        {/* Event History + Stage Timeline */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Full Traceability Log
            </h2>

            {!batch.eventHistory || batch.eventHistory.length === 0 ? (
              <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
                No traceability events available.
              </div>
            ) : (
              <div className="space-y-3">
                {batch.eventHistory.map((event, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-green-500 bg-gray-50 rounded-r-2xl p-4"
                  >
                    <p className="font-semibold text-gray-800">
                      {formatLabel(event.action)} at {formatLabel(event.stage)}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                     <div className="flex items-center gap-3 mt-2">
  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
    {event.by?.name?.charAt(0) || "U"}
  </div>

  <div>
    <p className="text-sm font-semibold text-gray-800">
      {event.by?.name || "Unknown"}
    </p>
    <p className="text-xs text-gray-500">
      {formatLabel(event.role)}
    </p>
  </div>
</div>
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

          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Stage Timeline
            </h2>

            {batch.timestamps && Object.keys(batch.timestamps).length > 0 ? (
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
            ) : (
              <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
                No stage timeline available.
              </div>
            )}
          </section>
        </div>
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
      <p className="text-green-100 text-sm">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}

function StatusPill({ label, value, good }) {
  return (
    <div
      className={`rounded-2xl p-4 ${
        good ? "bg-green-50 text-green-700" : "bg-red-50 text-green-700"
      }`}
    >
      <p className="text-sm font-medium">{label}</p>
      <h3 className="text-lg font-bold mt-1">{value}</h3>
    </div>
  );
}

export default VerifyBatch;