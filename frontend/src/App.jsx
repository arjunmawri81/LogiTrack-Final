import { BrowserRouter, Routes, Route } from "react-router-dom";

// ======================
// PUBLIC PAGES
// ======================
import Home from "./pages/public/Home";
import NotFound from "./pages/public/NotFound";
import PublicTracking from "./pages/public/Tracking";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import Contact from "./pages/public/Contact";

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
import OrderDetails from "./pages/merchant/OrderDetails";
import EditOrder from "./pages/merchant/EditOrder";
import CreateOrder from "./pages/merchant/CreateOrder";
import CreateShipment from "./pages/merchant/CreateShipment";
import BulkShipment from "./pages/merchant/BulkShipment";
import Shipments from "./pages/merchant/Shipments";
import ShipmentDetails from "./pages/merchant/ShipmentDetails";
import Tracking from "./pages/merchant/Tracking";
import Wallet from "./pages/merchant/Wallet";
import Invoices from "./pages/merchant/Invoices";
import Billing from "./pages/merchant/Billing";
import MerchantReports from "./pages/merchant/Reports";
import Profile from "./pages/merchant/Profile";
import Settings from "./pages/merchant/Settings";
import Serviceability from "./pages/merchant/Serviceability";
import RateCalculator from "./pages/merchant/RateCalculator";
import Tickets from "./pages/merchant/Tickets";
import MerchantNDR from "./pages/merchant/MerchantNDR";
import MerchantRTO from "./pages/merchant/MerchantRTO";

// ======================
// ADMIN PAGES
// ======================
import AdminDashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Merchants from "./pages/admin/Merchants";
import Pricing from "./pages/admin/Pricing";
import AdminRevenue from "./pages/admin/Revenue";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminOrders from "./pages/admin/Orders";
import AdminOrderDetails from "./pages/admin/OrderDetails";
import AdminEditOrder from "./pages/admin/EditOrder";
import AdminShipmentDetails from "./pages/admin/ShipmentDetails";
import AdminShipments from "./pages/admin/Shipments";
import AdminNDR from "./pages/admin/NDR";
import AdminRTO from "./pages/admin/RTO";
import COD from "./pages/admin/COD";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminRateCardManagement from "./pages/admin/RateCardManagement";

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

import SuperAdminRateCardManagement from "./pages/superadmin/RateCardManagement";

import Couriers from "./pages/superadmin/Couriers";

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
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/tracking" element={<PublicTracking />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= MERCHANT ================= */}
        <Route path="/merchant/dashboard" element={<MerchantRoute><Dashboard /></MerchantRoute>} />
        
        {/* Orders Routes */}
        <Route path="/merchant/orders" element={<MerchantRoute><Orders /></MerchantRoute>} />
        <Route path="/merchant/orders/:id" element={<MerchantRoute><OrderDetails /></MerchantRoute>} />
        <Route path="/merchant/orders/edit/:id" element={<MerchantRoute><EditOrder /></MerchantRoute>} /> 
        <Route path="/merchant/create-order" element={<MerchantRoute><CreateOrder /></MerchantRoute>} />
        
        {/* Shipment Routes */}
        <Route path="/merchant/create-shipment" element={<MerchantRoute><CreateShipment /></MerchantRoute>} />
        <Route path="/merchant/bulk-shipment" element={<MerchantRoute><BulkShipment /></MerchantRoute>} /> 
        <Route path="/merchant/shipments" element={<MerchantRoute><Shipments /></MerchantRoute>} />
        <Route path="/merchant/shipments/:id" element={<MerchantRoute><ShipmentDetails /></MerchantRoute>} />
        
        {/* Tracking & NDR Routes */}
        <Route path="/merchant/tracking" element={<MerchantRoute><Tracking /></MerchantRoute>} />
        <Route path="/merchant/ndr" element={<MerchantRoute><MerchantNDR /></MerchantRoute>} />
        <Route path="/merchant/rto" element={<MerchantRoute><MerchantRTO /></MerchantRoute>} />
        
        {/* Other Merchant Routes */}
        <Route path="/merchant/wallet" element={<MerchantRoute><Wallet /></MerchantRoute>} />
        <Route path="/merchant/invoices" element={<MerchantRoute><Invoices /></MerchantRoute>} />
        <Route path="/merchant/billing" element={<MerchantRoute><Billing /></MerchantRoute>} />
        <Route path="/merchant/reports" element={<MerchantRoute><MerchantReports /></MerchantRoute>} />
        <Route path="/merchant/profile" element={<MerchantRoute><Profile /></MerchantRoute>} />
        <Route path="/merchant/settings" element={<MerchantRoute><Settings /></MerchantRoute>} />
        <Route path="/merchant/serviceability" element={<MerchantRoute><Serviceability /></MerchantRoute>} />
        <Route path="/merchant/rate-calculator" element={<MerchantRoute><RateCalculator /></MerchantRoute>} />
        <Route path="/merchant/tickets" element={<MerchantRoute><Tickets /></MerchantRoute>} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/admin/merchants" element={<AdminRoute><Merchants /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetails /></AdminRoute>} />
        <Route path="/admin/orders/edit/:id" element={<AdminRoute><AdminEditOrder /></AdminRoute>} />
        <Route path="/admin/shipments" element={<AdminRoute><AdminShipments /></AdminRoute>} />
        <Route path="/admin/shipments/:id" element={<AdminRoute><AdminShipmentDetails /></AdminRoute>} />
      
        <Route path="/admin/pricing" element={<AdminRoute><Pricing /></AdminRoute>} />
        <Route path="/admin/revenue" element={<AdminRoute><AdminRevenue /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        <Route path="/admin/ndr" element={<AdminRoute><AdminNDR /></AdminRoute>} />
        <Route path="/admin/rto" element={<AdminRoute><AdminRTO /></AdminRoute>} />
        <Route path="/admin/cod" element={<AdminRoute><COD /></AdminRoute>} />
        <Route path="/admin/tickets" element={<AdminRoute><AdminTickets /></AdminRoute>} />
       
        <Route
          path="/admin/ratecard/:merchantId"
          element={
            <AdminRoute>
              <AdminRateCardManagement />
            </AdminRoute>
          }
        />

        {/* ================= SUPER ADMIN ================= */}
        <Route path="/superadmin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
        <Route path="/superadmin/admins" element={<SuperAdminRoute><AdminManagement /></SuperAdminRoute>} />
        <Route path="/superadmin/users" element={<SuperAdminRoute><UserManagement /></SuperAdminRoute>} />
        <Route path="/superadmin/orders" element={<SuperAdminRoute><OrderManagement /></SuperAdminRoute>} />
        <Route path="/superadmin/merchants" element={<SuperAdminRoute><MerchantManagement /></SuperAdminRoute>} />
        <Route path="/superadmin/couriers" element={<SuperAdminRoute><Couriers /></SuperAdminRoute>} />
        <Route path="/superadmin/ratecard/:merchantId" element={<SuperAdminRoute><SuperAdminRateCardManagement /></SuperAdminRoute>} />
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