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
  const [adminTheme, setAdminTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("wireeo_admin_theme") || "light";
  });

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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    localStorage.setItem("wireeo_admin_theme", adminTheme);
    const handleThemeToggle = () => {
      setAdminTheme((theme) => (theme === "dark" ? "light" : "dark"));
    };
    window.addEventListener("admin-theme-toggle", handleThemeToggle);
    return () => window.removeEventListener("admin-theme-toggle", handleThemeToggle);
  }, [adminTheme]);

  if (!isAdmin || isRegularUser) {
    return null;
  }

  return (
    <div className={`admin-artboard admin-theme-${adminTheme} min-h-screen`}>
      <div className="admin-frame">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
        />
        <main className="admin-content flex-1 min-w-0 overflow-auto">
          <Outlet context={{ adminTheme }} />
        </main>
      </div>
    </div>
  );
}
