import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const admin = useAuthStore((s) => s.admin);
  const isUserAuthed = useAuthStore((s) => s.isUserAuthenticated());
  const isAdminAuthed = useAuthStore((s) => s.isAdminAuthenticated());
  const logoutUser = useAuthStore((s) => s.logoutUser);
  const logoutAdmin = useAuthStore((s) => s.logoutAdmin);
  const isAuthed = isUserAuthed || isAdminAuthed;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg shadow-premium-lg border-b border-gray-200/50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-105 transition-all duration-300 drop-shadow-sm">
          Wireeo
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 relative group py-2 px-3 rounded-lg hover:bg-green-50">
            Home
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:w-3/4 transform -translate-x-1/2 rounded-full"></span>
          </Link>
          <Link to="/solutions" className="text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 relative group py-2 px-3 rounded-lg hover:bg-green-50">
            Solutions
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:w-3/4 transform -translate-x-1/2 rounded-full"></span>
          </Link>
          <Link to="/products" className="text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 relative group py-2 px-3 rounded-lg hover:bg-green-50">
            Products
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:w-3/4 transform -translate-x-1/2 rounded-full"></span>
          </Link>
          <Link to="/projects" className="text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 relative group py-2 px-3 rounded-lg hover:bg-green-50">
            Projects
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:w-3/4 transform -translate-x-1/2 rounded-full"></span>
          </Link>
          <Link to="/resources" className="text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 relative group py-2 px-3 rounded-lg hover:bg-green-50">
            Resources
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:w-3/4 transform -translate-x-1/2 rounded-full"></span>
          </Link>
          <Link to="/about" className="text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 relative group py-2 px-3 rounded-lg hover:bg-green-50">
            About
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:w-3/4 transform -translate-x-1/2 rounded-full"></span>
          </Link>
          <Link to="/contact" className="text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 relative group py-2 px-3 rounded-lg hover:bg-green-50">
            Contact
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300 group-hover:w-3/4 transform -translate-x-1/2 rounded-full"></span>
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {!isAuthed ? (
            <>
              <Link
                to="/signup"
                className="hidden md:block bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="hidden md:block bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-green-500/25"
              >
                Login
              </Link>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              {isUserAuthed && (
                <>
                  <div className="px-4 py-2 rounded-full bg-green-50 text-green-800 font-semibold">
                    {user?.name || user?.email || 'User'}
                  </div>
                  <button
                    onClick={() => logoutUser()}
                    className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2 rounded-full font-semibold transition-all duration-300"
                  >
                    Logout User
                  </button>
                </>
              )}
              {isAdminAuthed && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="px-4 py-2 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Admin
                  </Link>
                  <button
                    onClick={() => logoutAdmin()}
                    className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2 rounded-full font-semibold transition-all duration-300"
                  >
                    Logout Admin
                  </button>
                </>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-800 hover:text-green-600 transition-all duration-300 p-2 rounded-lg hover:bg-green-50 hover:scale-105"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200/50 shadow-lg animate-fade-in-down">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link to="/" className="block text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-2" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </span>
            </Link>
            <Link to="/solutions" className="block text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-2" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Solutions
              </span>
            </Link>
            <Link to="/products" className="block text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-2" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Products
              </span>
            </Link>
            <Link to="/projects" className="block text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-2" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Projects
              </span>
            </Link>
            <Link to="/resources" className="block text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-2" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Resources
              </span>
            </Link>
            <Link to="/about" className="block text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-2" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About
              </span>
            </Link>
            <Link to="/contact" className="block text-gray-800 hover:text-green-600 font-semibold transition-all duration-300 py-3 px-4 rounded-lg hover:bg-green-50 hover:translate-x-2" onClick={() => setIsMenuOpen(false)}>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </span>
            </Link>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {!isAuthed ? (
                <>
                  <Link to="/signup" className="block bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 px-4 py-3 rounded-lg font-semibold text-center hover:scale-105 transition-all duration-300" onClick={() => setIsMenuOpen(false)}>
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Sign Up
                    </span>
                  </Link>
                  <Link to="/login" className="block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg font-semibold text-center hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105" onClick={() => setIsMenuOpen(false)}>
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Login
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  {isUserAuthed && (
                    <button
                      onClick={() => {
                        logoutUser();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-lg font-semibold text-center transition-all duration-300"
                    >
                      Logout User
                    </button>
                  )}
                  {isAdminAuthed && (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className="block w-full bg-slate-900 text-white px-4 py-3 rounded-lg font-semibold text-center"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logoutAdmin();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-lg font-semibold text-center transition-all duration-300"
                      >
                        Logout Admin
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;