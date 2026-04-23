import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [freshnessFilter, setFreshnessFilter] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data);
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);

      const res = await axios.get("http://localhost:5000/api/batches", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBatches(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoadingBatches(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBatches();
  }, []);

  const approveUser = async (id) => {
    try {
      setActionLoadingId(id);

      await axios.patch(
        `http://localhost:5000/api/admin/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers();
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setActionLoadingId("");
    }
  };

  const rejectUser = async (id) => {
    try {
      setActionLoadingId(id);

      await axios.delete(`http://localhost:5000/api/admin/reject/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchUsers();
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setActionLoadingId("");
    }
  };

  const pendingUsers = users.filter((u) => u.status === "pending");

  const farmers = users.filter((u) => u.role === "farmer").length;
  const distributors = users.filter((u) => u.role === "distributor").length;
  const warehouses = users.filter((u) => u.role === "warehouse").length;
  const retailers = users.filter((u) => u.role === "retailer").length;

  const deliveredCount = batches.filter(
    (b) => String(b.stage).toLowerCase() === "delivered"
  ).length;

  const filteredBatches = useMemo(() => {
    return batches
      .filter((b) =>
        (b.product || "").toLowerCase().includes(search.toLowerCase())
      )
      .filter((b) =>
        stageFilter ? String(b.stage).toLowerCase() === stageFilter.toLowerCase() : true
      )
      .filter((b) =>
        freshnessFilter ? b.freshness === freshnessFilter : true
      );
  }, [batches, search, stageFilter, freshnessFilter]);

  const getFreshnessBadge = (freshness) => {
    if (freshness === "Fresh") {
      return "bg-green-100 text-green-700";
    }
    if (freshness === "Moderate") {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-red-100 text-red-700";
  };

  const formatRole = (role) => {
    if (!role) return "-";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-green-600 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="text-green-100 text-sm md:text-base">
              Smart Farm Supply Chain
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-green-100 max-w-2xl">
              Manage user approvals, monitor batches, and track the full supply
              chain from farmer to delivery.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:w-[320px]">
            <MiniCard label="Pending Users" value={pendingUsers.length} />
            <MiniCard label="Delivered" value={deliveredCount} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Farmers" value={farmers} emoji="🌾" color="from-green-500 to-emerald-600" />
        <StatCard title="Distributors" value={distributors} emoji="🚚" color="from-blue-500 to-cyan-600" />
        <StatCard title="Warehouses" value={warehouses} emoji="🏭" color="from-orange-500 to-amber-600" />
        <StatCard title="Retailers" value={retailers} emoji="🏪" color="from-purple-500 to-fuchsia-600" />
      </div>

      {/* Pending Users */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Pending User Approvals
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Review and approve new registrations.
            </p>
          </div>

          <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
            {pendingUsers.length} Pending
          </div>
        </div>

        {loadingUsers ? (
          <div className="text-gray-500">Loading users...</div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
            No pending registrations
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((u) => (
              <div
                key={u._id}
                className="border border-gray-100 rounded-2xl p-4 md:p-5 bg-gray-50 hover:bg-white transition shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-800 text-lg">{u.name}</p>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {formatRole(u.role)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        {formatRole(u.status)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">{u.email}</p>
                    <p className="text-sm text-gray-500">{u.address || "No address"}</p>

                    {u.location?.lat && u.location?.lng && (
                      <p className="text-xs text-gray-400">
                        📍 {u.location.lat}, {u.location.lng}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => approveUser(u._id)}
                      disabled={actionLoadingId === u._id}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-70 text-white px-5 py-2.5 rounded-xl font-semibold transition"
                    >
                      {actionLoadingId === u._id ? "Processing..." : "Approve"}
                    </button>

                    <button
                      onClick={() => rejectUser(u._id)}
                      disabled={actionLoadingId === u._id}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white px-5 py-2.5 rounded-xl font-semibold transition"
                    >
                      {actionLoadingId === u._id ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Filters + Table */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Batch Monitoring
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Search and filter all supply chain batches.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 min-w-[220px]"
            />

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="">All Stages</option>
              <option value="farmer">Farmer</option>
              <option value="distributor">Distributor</option>
              <option value="warehouse">Warehouse</option>
              <option value="retailer">Retailer</option>
              <option value="delivered">Delivered</option>
            </select>

            <select
              value={freshnessFilter}
              onChange={(e) => setFreshnessFilter(e.target.value)}
              className="border border-gray-300 px-4 py-3 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="">All Freshness</option>
              <option value="Fresh">Fresh</option>
              <option value="Moderate">Moderate</option>
              <option value="Spoiled">Spoiled</option>
            </select>
          </div>
        </div>

        {loadingBatches ? (
          <div className="text-gray-500">Loading batches...</div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-gray-50 border border-dashed rounded-2xl p-8 text-center text-gray-500">
            No matching batches found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="p-4 text-left rounded-l-2xl">Batch ID</th>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Stage</th>
                  <th className="p-4 text-left">Freshness</th>
                  <th className="p-4 text-left rounded-r-2xl">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBatches.map((b) => (
                  <tr key={b._id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                    <td className="p-4 text-sm text-gray-600 max-w-[220px] break-all">
                      {b._id}
                    </td>

                    <td className="p-4 font-medium text-gray-800">
                      {b.product}
                    </td>

                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {formatRole(b.stage)}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getFreshnessBadge(
                          b.freshness
                        )}`}
                      >
                        {b.freshness}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/batch/${b._id}`)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition"
                      >
                        View Details
                      </button>
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

export default AdminDashboard;