import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return role === "ADMIN" ||
    role === "SUPER_ADMIN"
    ? children
    : <Navigate to="/login" />;
};

export default AdminRoute;