import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const isAdmin = useAuthStore((s) => s.isAdminAuthenticated());

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Column 1 — Wireeo */}
            <div>
              <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-90 transition-opacity inline-block mb-4">
                Wireeo
              </Link>
              <p className="text-gray-300 mb-6 leading-relaxed text-sm">
                Premium KNX devices engineered for luxury residential and hospitality environments. Architectural design supported by disciplined engineering.
              </p>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/WireeoPro/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-amber-500/80 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/wireeo/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-amber-500/80 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/wireeo/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-amber-500/80 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2 — Navigation */}
            <div>
              <h4 className="text-lg font-bold mb-5 text-white">Navigation</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-amber-400/90 text-xs font-semibold uppercase tracking-wider mb-2">Products</p>
                  <ul className="space-y-1.5">
                    <li><Link to="/products" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">ActivLine</Link></li>
                    <li><Link to="/products" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">ActivTouch</Link></li>
                    <li><Link to="/products" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">ActivEntry</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="text-amber-400/90 text-xs font-semibold uppercase tracking-wider mb-2">Solutions</p>
                  <ul className="space-y-1.5">
                    <li><Link to="/solutions" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">Hospitality</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="text-amber-400/90 text-xs font-semibold uppercase tracking-wider mb-2">Company</p>
                  <ul className="space-y-1.5">
                    <li><Link to="/about" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">About Wireeo</Link></li>
                    <li><Link to="/contact" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">Contact</Link></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 3 — Resources */}
            <div>
              <h4 className="text-lg font-bold mb-5 text-white">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/resources" className="text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-2 text-sm">
                    <span className="w-1 h-1 rounded-full bg-amber-400/80" /> Downloads
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-2 text-sm">
                    <span className="w-1 h-1 rounded-full bg-amber-400/80" /> Technical Documentation
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-2 text-sm">
                    <span className="w-1 h-1 rounded-full bg-amber-400/80" /> Certificates
                  </a>
                </li>
                <li>
                  <Link to="/products/ranges?tab=selection" className="text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-2 text-sm">
                    <span className="w-1 h-1 rounded-full bg-amber-400/80" /> Graphic Product Configurator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Get in Touch */}
            <div>
              <h4 className="text-lg font-bold mb-5 text-white">Get in Touch</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-300 text-sm">
                    Vasile Lascar 178,<br />Bucharest 020512
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+40746133833" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">+40 746 133 833</a>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:contact@wireeo.com" className="text-gray-300 hover:text-amber-400 transition-colors text-sm">contact@wireeo.com</a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm text-center md:text-left">
                © {currentYear} Wireeo. All rights reserved.
                <span className="mx-2">|</span>
                <Link to="/legal/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
                <span className="mx-2">|</span>
                <Link to="/legal/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
                <span className="mx-2">|</span>
                <Link to="/cookies" className="hover:text-amber-400 transition-colors">Cookies Policy</Link>
                {!isAdmin && (
                  <>
                    <span className="mx-2">|</span>
                    <Link to="/admin/login" className="hover:text-amber-400 transition-colors">Admin login</Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <span className="mx-2">|</span>
                    <Link to="/admin/dashboard" className="hover:text-amber-400 transition-colors">Admin Dashboard</Link>
                  </>
                )}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span>Premium KNX devices</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
