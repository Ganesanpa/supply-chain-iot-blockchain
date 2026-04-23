import { useState } from "react";
import { Outlet } from "react-router-dom";

import Topbar from "./Topbar";

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}



      {/* Main Section */}
      <div className="flex flex-col flex-1 min-h-screen">

        {/* Topbar */}
        <Topbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />

        {/* Page Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;