import { Navigate } from "react-router-dom";

const WarehouseRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return role === "WAREHOUSE"
    ? children
    : <Navigate to="/login" />;
};

export default WarehouseRoute;