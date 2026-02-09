import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "wireeo_cookie_consent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== "accepted") {
        setVisible(true);
      }
    } catch {
      // If localStorage is not available, still show banner
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm">
      <div className="bg-white shadow-2xl rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
              🍪
            </span>
            <p className="font-semibold text-slate-900 text-sm">Cookie</p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            We use cookies to ensure you get the best experience on our website.
          </p>
          <Link
            to="/cookies"
            className="mt-1 inline-block text-[11px] text-blue-600 hover:text-blue-700 font-medium"
          >
            Learn more
          </Link>
        </div>
        <button
          type="button"
          onClick={handleAccept}
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"
        >
          Ok
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;

