import { Navigate } from "react-router-dom";

const StaffRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return role === "STAFF"
    ? children
    : <Navigate to="/login" />;
};

export default StaffRoute;