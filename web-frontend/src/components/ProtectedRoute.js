import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // ❌ No user → go login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // ❌ Role mismatch → block access
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  // ✅ Allowed
  return children;
}
