import { NavLink, useNavigate } from "react-router-dom";
import {
  IconDashboard,
  IconRanges,
  IconProducts,
  IconUsers,
  IconProjects,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconLogout,
  IconCategories,
  IconSolutions,
  IconPdf,
} from "./AdminIcons";
import { useAuthStore } from "../../store/authStore";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: IconDashboard },
  { to: "/admin/categories", label: "Categories", icon: IconCategories },
  { to: "/admin/solutions", label: "Solutions", icon: IconSolutions },
  { to: "/admin/ranges", label: "Ranges Management", icon: IconRanges },
  { to: "/admin/products", label: "Products Management", icon: IconProducts },
  { to: "/admin/pdf-materials", label: "PDF Materials", icon: IconPdf },
  { to: "/admin/users", label: "Users Management", icon: IconUsers },
  { to: "/admin/projects", label: "Graphic Configurator", icon: IconProjects },
  { to: "/admin/settings", label: "Settings", icon: IconSettings },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const logoutAdmin = useAuthStore((s) => s.logoutAdmin);
  const admin = useAuthStore((s) => s.admin);

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  return (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-64"
      } flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out shrink-0 border-r border-slate-700`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
        {!collapsed && (
          <span className="font-semibold text-lg truncate">Admin</span>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <IconChevronRight className="w-5 h-5" />
          ) : (
            <IconChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-700">
        {!collapsed && admin && (
          <div className="px-3 py-2 mb-2 text-xs text-slate-400 truncate">
            {admin.name || admin.email}
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <IconLogout className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
