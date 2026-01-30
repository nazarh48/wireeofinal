import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAuthStore } from "../../store/authStore";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.adminToken);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isAdmin = !!token;

  useEffect(() => {
    if (!isAdmin && !location.pathname.includes("/admin/login")) {
      navigate("/admin/login", { replace: true });
    }
  }, [isAdmin, navigate, location.pathname]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
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
