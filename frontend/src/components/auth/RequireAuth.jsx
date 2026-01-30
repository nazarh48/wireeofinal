import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function RequireAuth({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isUserAuthenticated());
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

