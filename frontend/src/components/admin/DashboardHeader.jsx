import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Notifications, Home, Add, KeyboardArrowDown, Person, Logout, Settings } from '@mui/icons-material';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

const DashboardHeader = ({ title, subtitle, showHomeButton = true }) => {
  const [searchFocus, setSearchFocus] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const admin = useAuthStore((s) => s.admin);
  const logoutAdmin = useAuthStore((s) => s.logoutAdmin);

  const adminName = admin?.name || admin?.email?.split('@')[0] || 'Admin';
  const adminEmail = admin?.email || '';
  const adminInitial = adminName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center justify-between gap-4 bg-white px-6 py-4 -mx-6 md:-mx-8 -mt-6 md:-mt-8 border-b border-slate-200"
      >
        <div className="flex items-center gap-3">
          {showHomeButton && (
            <Link
              to="/"
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Go to home page"
            >
              <Home className="w-5 h-5 text-slate-600" />
            </Link>
          )}
          <div className="flex items-center gap-2 text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className={`relative transition-all duration-200 ${searchFocus ? 'w-72' : 'w-64'}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Add className="w-5 h-5 text-slate-600" />
          </button>

          <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Notifications className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>

          <div className="relative flex items-center gap-2 pl-3 border-l border-slate-200" ref={dropdownRef}>
            <span className="text-sm text-slate-600 hidden md:inline">{adminName}</span>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 hover:bg-slate-100 rounded-lg p-1 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                {adminInitial}
              </div>
              <KeyboardArrowDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                        {adminInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{adminName}</p>
                        <p className="text-xs text-slate-500 truncate">{adminEmail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/admin/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <Person className="w-5 h-5 text-slate-600" />
                      <span className="text-sm text-slate-700">Profile</span>
                    </Link>
                    <Link
                      to="/admin/settings"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-5 h-5 text-slate-600" />
                      <span className="text-sm text-slate-700">Settings</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-left"
                    >
                      <Logout className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-slate-900">Welcome back!</h2>
        {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
      </motion.div>
    </>
  );
};

export default DashboardHeader;
