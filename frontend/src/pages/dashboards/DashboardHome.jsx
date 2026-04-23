import {
  FaBox,
  FaTruck,
  FaExclamationTriangle,
  FaCubes,
} from "react-icons/fa";

function DashboardHome() {
  const stats = [
    {
      title: "Total Products",
      value: 128,
      icon: <FaBox />,
      color: "from-blue-500 to-blue-700",
    },
    {
      title: "Active Shipments",
      value: 32,
      icon: <FaTruck />,
      color: "from-green-500 to-green-700",
    },
    {
      title: "Temperature Alerts",
      value: 3,
      icon: <FaExclamationTriangle />,
      color: "from-red-500 to-red-700",
    },
    {
      title: "Blockchain Verified",
      value: 115,
      icon: <FaCubes />,
      color: "from-purple-500 to-purple-700",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome Back 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Monitor your supply chain in real time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`bg-gradient-to-r ${item.color} text-white rounded-xl p-6 shadow-lg hover:scale-105 transition transform`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">{item.title}</p>
                <h2 className="text-3xl font-bold mt-2">{item.value}</h2>
              </div>

              <div className="text-3xl opacity-80">
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Shipment Status Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-6">
          Shipment Status
        </h2>

        <div className="space-y-6">
          <StatusBar label="In Transit" value={60} color="bg-green-500" />
          <StatusBar label="Delayed" value={15} color="bg-yellow-500" />
          <StatusBar label="Delivered" value={80} color="bg-blue-500" />
        </div>
      </div>
    </div>
  );
}

function StatusBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 h-3 rounded">
        <div
          className={`${color} h-3 rounded`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

export default DashboardHome;
