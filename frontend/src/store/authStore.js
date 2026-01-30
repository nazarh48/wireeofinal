import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ADMIN_TOKEN_KEY, USER_TOKEN_KEY } from "../services/api";

const AUTH_STORE_KEY = "wireeo_auth";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      userToken: localStorage.getItem(USER_TOKEN_KEY) || null,

      admin: null,
      adminToken: localStorage.getItem(ADMIN_TOKEN_KEY) || null,

      isUserAuthenticated: () => !!get().userToken,
      isAdminAuthenticated: () => !!get().adminToken,

      setUserAuth: ({ token, user }) => {
        if (token) localStorage.setItem(USER_TOKEN_KEY, token);
        set({ userToken: token || null, user: user || null });
      },

      setAdminAuth: ({ token, user }) => {
        if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
        set({ adminToken: token || null, admin: user || null });
      },

      logoutUser: () => {
        localStorage.removeItem(USER_TOKEN_KEY);
        set({ userToken: null, user: null });
      },

      logoutAdmin: () => {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        set({ adminToken: null, admin: null });
      },
    }),
    {
      name: AUTH_STORE_KEY,
      partialize: (s) => ({
        user: s.user,
        userToken: s.userToken,
        admin: s.admin,
        adminToken: s.adminToken,
      }),
    }
  )
);

export default useAuthStore;

