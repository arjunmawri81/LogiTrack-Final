import { Navigate } from "react-router-dom";

const SuperAdminRoute = ({ children }) => {
  const role = localStorage.getItem("role");

  return role === "SUPER_ADMIN"
    ? children
    : <Navigate to="/login" />;
};

export default SuperAdminRoute;