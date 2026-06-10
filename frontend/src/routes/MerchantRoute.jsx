import { Navigate } from "react-router-dom";

const MerchantRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return role === "MERCHANT"
    ? children
    : <Navigate to="/login" />;
};

export default MerchantRoute;