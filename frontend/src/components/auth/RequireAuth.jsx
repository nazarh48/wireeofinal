import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/** Allows access for either logged-in user or admin (e.g. Manage Products). */
export default function RequireAuth({ children }) {
  const isUser = useAuthStore((s) => s.isUserAuthenticated());
  const isAdmin = useAuthStore((s) => s.isAdminAuthenticated());
  const isAuthenticated = isUser || isAdmin;
  const location = useLocation();

  if (isAuthenticated) return children;

  return (
    <Navigate
      to="/login"
      replace
      state={{
        from: location.pathname + location.search,
        reason: "configurable",
      }}
    />
  );
}

