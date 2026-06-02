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
  { to: "/admin/solution-why-choose", label: "Solution - Why Choose", icon: IconSolutions },
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

function SidebarLink({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `admin-nav-link flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${isActive ? "is-active" : ""} ${collapsed ? "justify-center" : ""}`
      }
    >
      <span className="admin-nav-icon">
        <Icon className="h-4 w-4" />
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

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
      className={`${collapsed ? "w-[88px]" : "w-[270px]"} admin-sidebar flex flex-col transition-all duration-300 ease-in-out shrink-0`}
    >
      <div className="flex items-center justify-between px-6 pt-8 pb-7">
        <Link to="/" className="flex min-w-0 items-center gap-3" title="Wireeo - Home">
          <span className="admin-logo-card">
            <img src="/assets/Logowireeo.png" alt="Wireeo" />
          </span>
          {!collapsed && (
            <span className="leading-tight">
              <span className="block text-base font-black">Wireeo</span>
              <span className="block text-xs font-bold text-slate-500">Admin Panel</span>
            </span>
          )}
        </Link>
        <motion.button
          onClick={onToggle}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="admin-collapse-button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <IconChevronRight className="h-4 w-4" /> : <IconChevronLeft className="h-4 w-4" />}
        </motion.button>
      </div>

      <div className="px-5 pb-4">
        <Link
          to="/"
          className={`admin-nav-link flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${collapsed ? "justify-center" : ""}`}
        >
          <span className="admin-nav-icon">
            <IconHome className="h-4 w-4" />
          </span>
          {!collapsed && <span>Go to home page</span>}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-5 pb-5">
        {!collapsed && <p className="admin-sidebar-label">Menu</p>}
        <div className="mt-3 space-y-2">
          {nav.map((item) => (
            <SidebarLink key={item.to} {...item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      <div className="px-5 pb-6">
        {!collapsed && admin && (
          <div className="mb-3 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold text-slate-600">
            {admin.name || admin.email}
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`admin-nav-link flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${collapsed ? "justify-center" : ""}`}
        >
          <span className="admin-nav-icon">
            <IconLogout className="h-4 w-4" />
          </span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
