import { Routes, Route } from "react-router-dom";
import FarmerDashboard from "./pages/dashboards/FarmerDashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import WarehouseDashboard from "./pages/dashboards/WarehouseDashboard";
import DashboardLayout from "./layout/DashboardLayout";
import DashboardHome from "./pages/dashboards/DashboardHome";
import Products from "./pages/Products";
import Shipments from "./pages/Shipments";
import Analytics from "./pages/Analytics";
import Blockchain from "./pages/Blockchain";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import "./index.css";
import RetailerDashboard from "./pages/dashboards/RetailerDashboard";
import  DistributorDashboard from "./pages/dashboards/DistributorDashboard";
import VerifyBatch from "./pages/VerifyBatch";
import Register from "./pages/Register";
import TrackBatch from "./pages/TrackBatch";
import BatchDetails from "./pages/BatchDetails";
import VerifyProduct from "./pages/VerifyProduct";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyProduct />} />
<Route path="/verify/:id" element={<VerifyBatch />} />

<Route path="/batch/:id" element={<BatchDetails />} />
      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
       <Route
 path="admin"
 element={
   <ProtectedRoute allowedRoles={["admin"]}>
     <AdminDashboard/>
   </ProtectedRoute>
 }
/>
        <Route path="track/:id" element={<TrackBatch />} />
<Route path="farmer" element={<FarmerDashboard />} />

<Route path="retailer" element={<RetailerDashboard />} />
        <Route path="warehouse" element={<WarehouseDashboard />} />
        <Route path="distributor" element={<DistributorDashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="shipments" element={<Shipments />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="blockchain" element={<Blockchain />} />
      </Route>
    </Routes>
  );
}

export default App;
