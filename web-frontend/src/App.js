import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import BookingsReport from "./pages/reports/BookingsReport";
import PaymentsReport from "./pages/reports/PaymentsReport";
import VehicleFleetReport from "./pages/reports/VehicleFleetReport";
import FeedbackReport from "./pages/reports/FeedbackReport";
import AuditLogReport from "./pages/reports/AuditLogReport";

function HomeRedirect() {
  const userString = localStorage.getItem("user");
  if (!userString) return <Navigate to="/login" />;
  try {
    const user = JSON.parse(userString);
    if (user.role === "admin") return <Navigate to="/admin" />;
    if (user.role === "staff") return <Navigate to="/staff" />;
    return <Navigate to="/customer" />;
  } catch (e) {
    localStorage.clear();
    return <Navigate to="/login" />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/customer" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute role="staff"><StaffDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        <Route path="/admin/reports/bookings" element={<ProtectedRoute role="admin"><BookingsReport /></ProtectedRoute>} />
        <Route path="/admin/reports/payments" element={<ProtectedRoute role="admin"><PaymentsReport /></ProtectedRoute>} />
        <Route path="/admin/reports/vehicle-fleet" element={<ProtectedRoute role="admin"><VehicleFleetReport /></ProtectedRoute>} />
        <Route path="/admin/reports/feedback" element={<ProtectedRoute role="admin"><FeedbackReport /></ProtectedRoute>} />
        <Route path="/admin/reports/audit-log" element={<ProtectedRoute role="admin"><AuditLogReport /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;