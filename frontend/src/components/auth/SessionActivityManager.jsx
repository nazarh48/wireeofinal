import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { apiService, SESSION_INACTIVITY_MINUTES } from "../../services/api";

const ACTIVITY_DEBOUNCE_MS = 1000;
const REFRESH_CHECK_INTERVAL_MS = 60 * 1000;
const ACTIVITY_WINDOW_MS = (SESSION_INACTIVITY_MINUTES - 1) * 60 * 1000;

/**
 * Tracks user activity and refreshes session (sliding expiration).
 * On session-expired event, redirects to login with message.
 * Renders nothing.
 */
export default function SessionActivityManager() {
  const navigate = useNavigate();
  const lastActivityAt = useRef(Date.now());
  const userToken = useAuthStore((s) => s.userToken);
  const adminToken = useAuthStore((s) => s.adminToken);
  const setUserAuth = useAuthStore((s) => s.setUserAuth);
  const setAdminAuth = useAuthStore((s) => s.setAdminAuth);

  const handleSessionExpired = useCallback(
    (e) => {
      const type = e?.detail?.type;
      if (type === "admin") {
        navigate("/admin/login", { replace: true, state: { sessionExpired: true } });
      } else {
        navigate("/login", { replace: true, state: { sessionExpired: true } });
      }
    },
    [navigate]
  );

  useEffect(() => {
    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, [handleSessionExpired]);

  useEffect(() => {
    let debounceTimer;
    const updateActivity = () => {
      lastActivityAt.current = Date.now();
    };
    const onActivity = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateActivity, ACTIVITY_DEBOUNCE_MS);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((ev) => window.addEventListener(ev, onActivity));
    return () => {
      clearTimeout(debounceTimer);
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
    };
  }, []);

  useEffect(() => {
    if (!userToken && !adminToken) return;

    const tick = async () => {
      const now = Date.now();
      const elapsed = now - lastActivityAt.current;
      if (elapsed > ACTIVITY_WINDOW_MS) return;

      try {
        if (userToken) {
          const res = await apiService.auth.refreshSession();
          if (res?.token) setUserAuth({ token: res.token, user: res.user });
        } else if (adminToken) {
          const res = await apiService.auth.refreshAdminSession();
          if (res?.token) setAdminAuth({ token: res.token, user: res.user });
        }
      } catch {
        // Ignore; next request will get 401 and trigger session-expired
      }
    };

    const intervalId = setInterval(tick, REFRESH_CHECK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [userToken, adminToken, setUserAuth, setAdminAuth]);

  return null;
}
