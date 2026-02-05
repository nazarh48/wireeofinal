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

          {/* Auth Section */}
          <div className="flex items-center space-x-2">
            {!isAuthed ? (
              <>
                <Link to="/login" className="hidden md:block px-4 py-2 text-sm text-gray-700 hover:text-blue-600 font-medium transition-all duration-300 hover:scale-105">
                  Login
                </Link>
                <Link to="/signup" className="hidden md:block px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                {isUserAuthed && (
                  <>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg transition-all duration-300 hover:shadow-md">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-110">
                        <span className="text-white text-xs font-semibold">{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {user?.name || user?.email || 'User'}
                      </span>
                    </div>
                    <button onClick={() => logoutUser()} className="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 font-medium transition-all duration-300 hover:scale-105">
                      Logout
                    </button>
                  </>
                )}
                {isAdminAuthed && (
                  <>
                    <Link to="/admin/dashboard" className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg text-sm font-medium hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105">
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Admin</span>
                    </Link>
                    <button onClick={() => logoutAdmin()} className="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 font-medium transition-all duration-300 hover:scale-105">
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50 rounded-lg hover:scale-110"
            >
              <svg className="w-6 h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
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

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                {!isAuthed ? (
                  <>
                    <Link to="/signup" className="block px-4 py-3 text-blue-600 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl font-medium text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                    <Link to="/login" className="block px-4 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-xl font-medium text-center transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </>
                ) : (
                  <>
                    {isUserAuthed && (
                      <>
                        <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow-sm">
                          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="font-semibold text-gray-700">{user?.name || user?.email || 'User'}</span>
                        </div>
                        <button
                          onClick={() => { logoutUser(); setIsMenuOpen(false); }}
                          className="block w-full px-4 py-3 text-gray-600 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium text-center transition-all duration-300 hover:shadow-md"
                        >
                          Logout User
                        </button>
                      </>
                    )}
                    {isAdminAuthed && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-3 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-xl font-medium text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                        <button
                          onClick={() => { logoutAdmin(); setIsMenuOpen(false); }}
                          className="block w-full px-4 py-3 text-gray-600 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium text-center transition-all duration-300 hover:shadow-md"
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
        </div>
      </div>
    </header>
  );
};

export default Header;