import { BrowserRouter, Routes, Route } from "react-router-dom";

// ======================
// PUBLIC PAGES
// ======================
import Home from "./pages/public/Home";
import NotFound from "./pages/public/NotFound";

// ======================
// AUTH PAGES
// ======================
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// ======================
// MERCHANT PAGES
// ======================
import Dashboard from "./pages/merchant/Dashboard";
import Orders from "./pages/merchant/Orders";
import CreateShipment from "./pages/merchant/CreateShipment";
import Shipments from "./pages/merchant/Shipments";
import Tracking from "./pages/merchant/Tracking";
import Wallet from "./pages/merchant/Wallet";
import Billing from "./pages/merchant/Billing";
import MerchantReports from "./pages/merchant/Reports";
import Profile from "./pages/merchant/Profile";
import Settings from "./pages/merchant/Settings";
import CreateOrder from "./pages/merchant/CreateOrder";
import Serviceability from "./pages/merchant/Serviceability";
import RateCalculator from "./pages/merchant/RateCalculator";

// ======================
// ADMIN PAGES
// ======================
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Merchants from "./pages/admin/Merchants";
import Couriers from "./pages/admin/Couriers";
import Pricing from "./pages/admin/Pricing";
import AdminRevenue from "./pages/admin/Revenue";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminOrders from "./pages/admin/Orders";
import AdminShipments from "./pages/admin/Shipments";

// ======================
// SUPER ADMIN PAGES
// ======================
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import AdminManagement from "./pages/superadmin/AdminManagement";
import UserManagement from "./pages/superadmin/UserManagement";
import OrderManagement from "./pages/superadmin/OrderManagement";
import MerchantManagement from "./pages/superadmin/MerchantManagement";
import Commission from "./pages/superadmin/Commission";
import ApiMonitoring from "./pages/superadmin/ApiMonitoring";
import Revenue from "./pages/superadmin/Revenue";
import AuditLogs from "./pages/superadmin/AuditLogs";
import SuperAdminSettings from "./pages/superadmin/Settings";

// ======================
// ROUTE PROTECTION
// ======================
import MerchantRoute from "./routes/MerchantRoute";
import AdminRoute from "./routes/AdminRoute";
import SuperAdminRoute from "./routes/SuperAdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= MERCHANT ================= */}
        <Route path="/merchant/dashboard" element={<MerchantRoute><Dashboard /></MerchantRoute>} />
        <Route path="/merchant/orders" element={<MerchantRoute><Orders /></MerchantRoute>} />
        <Route path="/merchant/create-shipment" element={<MerchantRoute><CreateShipment /></MerchantRoute>} />
        <Route path="/merchant/shipments" element={<MerchantRoute><Shipments /></MerchantRoute>} />
        <Route path="/merchant/tracking" element={<MerchantRoute><Tracking /></MerchantRoute>} />
        <Route path="/merchant/wallet" element={<MerchantRoute><Wallet /></MerchantRoute>} />
        <Route path="/merchant/billing" element={<MerchantRoute><Billing /></MerchantRoute>} />
        <Route path="/merchant/reports" element={<MerchantRoute><MerchantReports /></MerchantRoute>} />
        <Route path="/merchant/profile" element={<MerchantRoute><Profile /></MerchantRoute>} />
        <Route path="/merchant/settings" element={<MerchantRoute><Settings /></MerchantRoute>} />
        <Route path="/merchant/create-order" element={<MerchantRoute><CreateOrder /></MerchantRoute>} />
        <Route path="/merchant/serviceability" element={<MerchantRoute><Serviceability /></MerchantRoute>} />
        <Route path="/merchant/rate-calculator" element={<MerchantRoute><RateCalculator /></MerchantRoute>} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/admin/merchants" element={<AdminRoute><Merchants /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/shipments" element={<AdminRoute><AdminShipments /></AdminRoute>} />
        <Route path="/admin/couriers" element={<AdminRoute><Couriers /></AdminRoute>} />
        <Route path="/admin/pricing" element={<AdminRoute><Pricing /></AdminRoute>} />
        <Route path="/admin/revenue" element={<AdminRoute><AdminRevenue /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

        {/* ================= SUPER ADMIN ================= */}
        <Route path="/superadmin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
        <Route path="/superadmin/admins" element={<SuperAdminRoute><AdminManagement /></SuperAdminRoute>} />
        <Route path="/superadmin/users" element={<SuperAdminRoute><UserManagement /></SuperAdminRoute>} />
        <Route path="/superadmin/orders" element={<SuperAdminRoute><OrderManagement /></SuperAdminRoute>} />
        <Route path="/superadmin/merchants" element={<SuperAdminRoute><MerchantManagement /></SuperAdminRoute>} />
        <Route path="/superadmin/commission" element={<SuperAdminRoute><Commission /></SuperAdminRoute>} />
        <Route path="/superadmin/revenue" element={<SuperAdminRoute><Revenue /></SuperAdminRoute>} />
        <Route path="/superadmin/api-monitoring" element={<SuperAdminRoute><ApiMonitoring /></SuperAdminRoute>} />
        <Route path="/superadmin/audit-logs" element={<SuperAdminRoute><AuditLogs /></SuperAdminRoute>} />
        <Route path="/superadmin/settings" element={<SuperAdminRoute><SuperAdminSettings /></SuperAdminRoute>} />

        {/* ================= 404 ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;