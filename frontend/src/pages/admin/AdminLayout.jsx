import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuthStore } from "../../store/authStore";

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminToken = useAuthStore((s) => s.adminToken);
  const logoutAdmin = useAuthStore((s) => s.logoutAdmin);
  const userToken = useAuthStore((s) => s.userToken);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const tokenExpired = isTokenExpired(adminToken);
  const isAdmin = !!adminToken && !tokenExpired;
  const isRegularUser = !!userToken && !adminToken;

  useEffect(() => {
    if (isRegularUser) {
      navigate("/", { replace: true });
      return;
    }
    if (adminToken && tokenExpired) {
      logoutAdmin();
      navigate("/admin/login", { replace: true, state: { sessionExpired: true } });
      return;
    }
    if (!isAdmin && !location.pathname.includes("/admin/login")) {
      navigate("/admin/login", { replace: true });
    }
  }, [isAdmin, isRegularUser, tokenExpired, adminToken, logoutAdmin, navigate, location.pathname]);

  if (!isAdmin || isRegularUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
