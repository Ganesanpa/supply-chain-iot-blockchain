import { useAuth } from "../context/AuthContext";
import { FaBell, FaBars } from "react-icons/fa";
import { useNotification } from "../context/NotificationContext";
import { useState, useRef, useEffect } from "react";

function Topbar({ setMobileOpen }) {
  const { logout, user } = useAuth();
  const { notifications } = useNotification();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="h-16 bg-white shadow-sm border-b flex justify-between items-center px-3 sm:px-4 md:px-6">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-gray-700 text-xl"
        >
          <FaBars />
        </button>

        <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 whitespace-nowrap">
          🌾 Dashboard
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 sm:gap-4">

        {/* Notification */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="text-lg sm:text-xl text-gray-700 relative"
          >
            <FaBell />

            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs px-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-[90vw] sm:w-64 max-w-xs bg-white shadow-lg rounded-lg p-4 z-50">
              <h4 className="font-semibold mb-2">Notifications</h4>

              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No notifications
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <p key={n.id} className="text-sm border-b py-1">
                      {n.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Role */}
        {user && (
          <span className="hidden sm:block text-xs sm:text-sm text-gray-600 capitalize">
            {user.role}
          </span>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;