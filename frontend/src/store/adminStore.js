import { create } from "zustand";
import { persist } from "zustand/middleware";

const ADMIN_STORAGE = "wireeo_admin";

export const useAdminStore = create(
  persist(
    (set, get) => ({
      activityLog: [],

      logActivity: (action) => {
        const entry = {
          id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          action: action.type,
          label: action.label || action.type,
          meta: action.meta || null,
          timestamp: new Date().toISOString(),
        };
        set((s) => ({
          activityLog: [entry, ...s.activityLog].slice(0, 50),
        }));
        return entry;
      },

      getRecentActivity: (limit = 10) => get().activityLog.slice(0, limit),
    }),
    { name: ADMIN_STORAGE }
  )
);

export default useAdminStore;
