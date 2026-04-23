import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBox, FaTruck, FaChartLine, FaCubes } from "react-icons/fa";

function Sidebar({ collapsed, mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
  const role = user?.role;

  const menuConfig = {
   admin: [
  { name: "Admin Panel", icon: <FaChartLine />, path: "admin" },
  { name: "Products", icon: <FaBox />, path: "products" },
  { name: "Shipments", icon: <FaTruck />, path: "shipments" },
  { name: "Analytics", icon: <FaChartLine />, path: "analytics" },
  { name: "Blockchain", icon: <FaCubes />, path: "blockchain" },
],
    farmer: [
      { name: "Products", icon: <FaBox />, path: "products" },
      { name: "Shipments", icon: <FaTruck />, path: "shipments" },
    ],
    distributor: [
      { name: "Shipments", icon: <FaTruck />, path: "shipments" },
      { name: "Analytics", icon: <FaChartLine />, path: "analytics" },
    ],
    warehouse: [
      { name: "Shipments", icon: <FaTruck />, path: "shipments" },
    ],
    retailer: [
      { name: "Blockchain", icon: <FaCubes />, path: "blockchain" },
    ],
  };

  const menuItems = menuConfig[role] || [];

  return (
    <aside
      className={`
        fixed md:static top-0 left-0
        h-screen
        z-50
        bg-gradient-to-b from-gray-900 to-gray-800
        text-white
        shadow-2xl
        flex flex-col
        transition-all duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        ${collapsed ? "md:w-20" : "md:w-64"}
        w-64
      `}
    >
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-gray-700">
        <h2 className="text-xl font-bold tracking-wide text-green-400 transition-all duration-300">
          {collapsed ? "🌾" : "🌾 Farm SCM"}
        </h2>

        {!collapsed && (
          <p className="text-xs text-gray-400 mt-2 capitalize">
            Role: {role}
          </p>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-3">
          {menuItems.map((item, index) => (
            <li key={index} className="relative group">
              <NavLink
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gray-700 border-l-4 border-green-500"
                      : "hover:bg-gray-700"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>

                <span
                  className={`
                    whitespace-nowrap
                    transition-all duration-200
                    ${
                      collapsed
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100"
                    }
                  `}
                >
                  {item.name}
                </span>
              </NavLink>

              {/* Tooltip (only when collapsed) */}
              {collapsed && (
                <span className="absolute left-20 top-1/2 -translate-y-1/2 bg-black text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap shadow-lg">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;