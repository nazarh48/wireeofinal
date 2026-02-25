import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchDeviceById } from "../api/deviceService";

export const useDeviceStore = create(
  devtools(
    (set, get) => ({
      device: null,
      isLoading: false,
      error: null,

      fetchDevice: async (deviceId) => {
        set({ isLoading: true, error: null });
        try {
          const device = await fetchDeviceById(deviceId);
          set({ device, isLoading: false, error: null });
          return device;
        } catch (error) {
          set({ device: null, isLoading: false, error });
          return null;
        }
      },

      clearDevice: () => set({ device: null, error: null, isLoading: false }),

      supportsPrinting: () => Boolean(get().device?.supports_printing),
      supportsLaser: () => Boolean(get().device?.supports_laser),
      isCustomizationDisabled: () => {
        const d = get().device;
        if (!d) return true;
        return !d.supports_printing && !d.supports_laser;
      },
    }),
    { name: "device-store-v2" }
  )
);

