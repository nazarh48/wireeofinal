import { NavLink, useNavigate, Link } from "react-router-dom";
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
  IconCookie,
  IconMail,
  IconHome,
} from "./AdminIcons";
import { useAuthStore } from "../../store/authStore";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: IconDashboard },
  { to: "/admin/categories", label: "Categories", icon: IconCategories },
  { to: "/admin/solutions", label: "Solutions", icon: IconSolutions },
  { to: "/admin/ranges", label: "Ranges Management", icon: IconRanges },
  { to: "/admin/products", label: "Products Management", icon: IconProducts },
  { to: "/admin/pdf-materials", label: "PDF Materials", icon: IconPdf },
  { to: "/admin/newsletter", label: "Newsletter / Email List", icon: IconMail },
  { to: "/admin/users", label: "Users Management", icon: IconUsers },
  { to: "/admin/projects", label: "Graphic Configurator", icon: IconProjects },
  { to: "/admin/cookies", label: "Cookies Policy", icon: IconCookie },
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
      className={`${collapsed ? "w-[72px]" : "w-64"
        } flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out shrink-0 border-r border-slate-700`}
    >
      <div className="flex items-center justify-between h-16 px-3 border-b border-slate-700 shrink-0">
        {!collapsed ? (
          <Link
            to="/"
            className="flex items-center gap-2 min-w-0 flex-1 rounded-lg hover:opacity-90 transition-opacity duration-200"
            title="Wireeo – Home"
          >
            <img
              src="/assets/Logowireeo.png"
              alt="Wireeo"
              className="h-9 w-auto object-contain flex-shrink-0"
            />
          </Link>
        ) : (
          <Link
            to="/"
            className="flex items-center justify-center w-full rounded-lg hover:opacity-90 transition-opacity"
            title="Go to home page"
          >
            <img
              src="/assets/Logowireeo.png"
              alt="Wireeo"
              className="h-8 w-8 object-contain"
            />
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <IconChevronRight className="w-5 h-5" />
          ) : (
            <IconChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="px-2 pt-2 pb-1 border-b border-slate-700/80">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-200 hover:translate-x-0.5 group"
        >
          <IconHome className="w-5 h-5 flex-shrink-0 text-emerald-400 group-hover:text-emerald-300" />
          {!collapsed && <span className="truncate font-medium">Go to home page</span>}
        </Link>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${isActive
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
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors ${collapsed ? "justify-center" : ""
            }`}
        >
          <IconLogout className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
