import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const user = useAuthStore((s) => s.user);
  const admin = useAuthStore((s) => s.admin);
  const isUserAuthed = useAuthStore((s) => s.isUserAuthenticated());
  const isAdminAuthed = useAuthStore((s) => s.isAdminAuthenticated());
  const logoutUser = useAuthStore((s) => s.logoutUser);
  const logoutAdmin = useAuthStore((s) => s.logoutAdmin);
  const isAuthed = isUserAuthed || isAdminAuthed;
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeDropdownAndMenu = () => {
    setUserDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    if (isAdminAuthed) logoutAdmin();
    else logoutUser();
    closeDropdownAndMenu();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 transition-all duration-300">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img src="/assets/name.png" alt="Wireeo" className="h-7 object-contain transition-transform duration-300 group-hover:scale-110" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link to="/" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-all duration-300 group">
              <span className="relative z-10">Home</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></span>
            </Link>
            <Link to="/solutions" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-all duration-300 group">
              <span className="relative z-10">Solutions</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></span>
            </Link>
            <Link to="/products" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-all duration-300 group">
              <span className="relative z-10">Products</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></span>
            </Link>
            <Link to="/projects" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-all duration-300 group">
              <span className="relative z-10">Graphic Configurator</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></span>
            </Link>
            <Link to="/resources" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-all duration-300 group">
              <span className="relative z-10">Resources</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></span>
            </Link>
            <Link to="/about" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-all duration-300 group">
              <span className="relative z-10">About</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></span>
            </Link>
            <Link to="/contact" className="relative px-3 py-2 text-gray-600 hover:text-blue-600 text-sm font-medium transition-all duration-300 group">
              <span className="relative z-10">Contact</span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></span>
            </Link>
          </nav>

          {/* Right side: Login/Sign up or User icon with dropdown */}
          <div className="flex items-center gap-2">
            {!isAuthed ? (
              <>
                <Link to="/login" className="hidden md:block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 font-medium transition-all duration-300">
                  Login
                </Link>
                <Link to="/signup" className="hidden md:block px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((o) => !o)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-colors border border-slate-200"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border border-slate-200 py-1 z-[60]">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {isAdminAuthed ? (admin?.email || 'Admin') : (user?.name || user?.email || 'Account')}
                      </p>
                      <p className="text-xs text-slate-500">{isAdminAuthed ? 'Administrator' : 'User'}</p>
                    </div>
                    {isAdminAuthed && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={closeDropdownAndMenu}
                      >
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/products/ranges"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={closeDropdownAndMenu}
                    >
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Manage Products
                    </Link>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50 rounded-lg"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2 pt-4">
              <Link to="/" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:translate-x-2 hover:shadow-md" onClick={() => setIsMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">Home</span>
              </Link>
              <Link to="/solutions" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:translate-x-2 hover:shadow-md" onClick={() => setIsMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium">Solutions</span>
              </Link>
              <Link to="/products" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:translate-x-2 hover:shadow-md" onClick={() => setIsMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <span className="font-medium">Products</span>
              </Link>
              <Link to="/projects" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:translate-x-2 hover:shadow-md" onClick={() => setIsMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="font-medium">Graphic Configurator</span>
              </Link>
              <Link to="/resources" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:translate-x-2 hover:shadow-md" onClick={() => setIsMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Resources</span>
              </Link>
              <Link to="/about" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:translate-x-2 hover:shadow-md" onClick={() => setIsMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">About</span>
              </Link>
              <Link to="/contact" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:translate-x-2 hover:shadow-md" onClick={() => setIsMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Contact</span>
              </Link>

              {/* Mobile: Login/Sign up when not logged in; when logged in use the user icon in header */}
              {!isAuthed && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <Link to="/signup" className="block px-4 py-3 text-blue-600 border-2 border-blue-200 hover:bg-blue-50 rounded-xl font-medium text-center" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                  <Link to="/login" className="block px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-center" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;