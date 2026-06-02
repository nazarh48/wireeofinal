import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Notifications,
  Person,
  Logout,
  Settings,
  DarkMode,
  LightMode,
  KeyboardArrowDown,
  AccountCircle,
} from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

const DashboardHeader = ({ title, subtitle }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("wireeo_admin_theme") || "light";
  });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const admin = useAuthStore((s) => s.admin);
  const logoutAdmin = useAuthStore((s) => s.logoutAdmin);

  const adminName = admin?.name || admin?.email?.split("@")[0] || "Enative Studio";
  const adminEmail = admin?.email || "Batanghari";
  const adminInitial = adminName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.dispatchEvent(new Event("admin-theme-toggle"));
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="admin-topbar mb-9 flex items-center justify-between gap-6"
      >
        <nav className="hidden items-center gap-10 md:flex">
          <Link to="/admin/dashboard" className="admin-top-link is-active">Dashboard</Link>
          <Link to="/admin/products" className="admin-top-link">Products</Link>
          <Link to="/admin/projects" className="admin-top-link">Configurator</Link>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="admin-search hidden lg:block">
            <Search className="h-4 w-4" />
            <input type="text" placeholder="Search..." />
          </div>

          <button className="admin-icon-button" aria-label="Account">
            <AccountCircle className="h-5 w-5" />
          </button>
          <button className="admin-icon-button" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </button>
          <button className="admin-icon-button" aria-label="Notifications">
            <Notifications className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleThemeToggle}
            className="admin-icon-button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <LightMode className="h-5 w-5" /> : <DarkMode className="h-5 w-5" />}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="admin-avatar-button"
            >
              <span className="text-right">
                <strong>{adminName}</strong>
                <small>{adminEmail}</small>
              </span>
              <KeyboardArrowDown className={`h-4 w-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="admin-menu absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl py-2 shadow-2xl"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="admin-menu-avatar">{adminInitial}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{adminName}</p>
                        <p className="truncate text-xs opacity-70">{adminEmail}</p>
                      </div>
                    </div>
                  </div>

                  <Link to="/admin/users" onClick={() => setShowDropdown(false)} className="admin-menu-item">
                    <Person className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <Link to="/admin/settings" onClick={() => setShowDropdown(false)} className="admin-menu-item">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                  <button onClick={handleLogout} className="admin-menu-item w-full text-left text-red-500">
                    <Logout className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mb-9"
      >
        <h1 className="text-4xl font-black tracking-tight text-slate-950">{title}</h1>
        {subtitle && <p className="mt-2 text-sm font-medium text-slate-500">{subtitle}</p>}
      </motion.div>
    </>
  );
};

export default DashboardHeader;
