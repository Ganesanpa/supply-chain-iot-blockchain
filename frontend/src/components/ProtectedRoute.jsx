import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const currentUser = user || storedUser;

  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles
      .map((r) => r.toLowerCase())
      .includes(currentUser.role.toLowerCase())
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;