import { NavLink, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  IconLibrary,
} from "./AdminIcons";
import { useAuthStore } from "../../store/authStore";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: IconDashboard },
  { to: "/admin/categories", label: "Categories", icon: IconCategories },
  { to: "/admin/solutions", label: "Solutions", icon: IconSolutions },
  { to: "/admin/solution-details", label: "Solution details", icon: IconSolutions },
  { to: "/admin/solution-why-choose", label: "Solution – Why Choose", icon: IconSolutions },
  { to: "/admin/ranges", label: "Ranges Management", icon: IconRanges },
  { to: "/admin/products", label: "Products Management", icon: IconProducts },
  { to: "/admin/icon-library", label: "Icon Library", icon: IconLibrary },
  { to: "/admin/resources", label: "Resources / Docs", icon: IconPdf },
  { to: "/admin/newsletter", label: "Newsletter / Email List", icon: IconMail },
  { to: "/admin/users", label: "Users Management", icon: IconUsers },
  { to: "/admin/projects", label: "Graphic Configurator", icon: IconProjects },
  { to: "/admin/cookies", label: "Cookies Policy", icon: IconCookie },
  { to: "/admin/privacy", label: "Privacy Policy", icon: IconCookie },
  { to: "/admin/terms", label: "Terms of Service", icon: IconCookie },
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
      className={`${collapsed ? "w-[72px]" : "w-64"} flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out shrink-0 border-r border-slate-800/50 shadow-xl`}
    >
      <div className="flex items-center justify-between h-16 px-3 border-b border-slate-800/50 shrink-0">
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
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <IconChevronRight className="w-5 h-5" />
          ) : (
            <IconChevronLeft className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      <div className="px-2 pt-2 pb-1 border-b border-slate-800/50">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all duration-200 group"
        >
          <IconHome className="w-5 h-5 flex-shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="truncate font-medium text-sm">Go to home page</span>}
        </Link>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 mx-2 mb-1 rounded-xl transition-all duration-200 ${isActive
                ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/30"
                : "text-slate-300 hover:bg-slate-800/70 hover:text-white hover:translate-x-1"
              } ${collapsed ? "justify-center" : ""}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="truncate text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-800/50">
        {!collapsed && admin && (
          <div className="px-3 py-2 mb-2 text-xs text-slate-400 truncate bg-slate-800/30 rounded-lg">
            {admin.name || admin.email}
          </div>
        )}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
        >
          <IconLogout className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </motion.button>
      </div>
    </aside>
  );
}
