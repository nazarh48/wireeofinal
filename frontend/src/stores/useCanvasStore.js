import { create } from "zustand";
import { devtools } from "zustand/middleware";

const createId = () =>
  `el_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const useCanvasStore = create(
  devtools(
    (set, get) => ({
      elements: [],
      selectedElementId: null,
      capabilityType: "printing", // "printing" | "laser"
      allowedZone: null, // { x, y, width, height } derived from Layer 3 mask
      backgroundImage: null, // data URL for custom Layer 2 background

      setCapabilityType: (capabilityType) => set({ capabilityType }),
      setAllowedZone: (allowedZone) => set({ allowedZone }),
      setBackgroundImage: (backgroundImage) => set({ backgroundImage }),
      clearBackgroundImage: () => set({ backgroundImage: null }),

      selectElement: (id) => set({ selectedElementId: id || null }),
      clearSelection: () => set({ selectedElementId: null }),

      addIcon: (icon, { x = 200, y = 200 } = {}) => {
        const id = createId();
        set((state) => ({
          elements: [
            ...state.elements,
            {
              id,
              type: "icon",
              name: icon?.name || "",
              src: icon?.file_path || "",
              iconId: icon?.id || icon?._id || null,
              categoryId: icon?.category_id || null,
              x,
              y,
              rotation: 0,
              width: 96,
              height: 96,
              scaleX: 1,
              scaleY: 1,
            },
          ],
          selectedElementId: id,
        }));
      },

      addText: (text, { x = 220, y = 220 } = {}) => {
        const id = createId();
        set((state) => ({
          elements: [
            ...state.elements,
            {
              id,
              type: "text",
              text: String(text || "Text"),
              x,
              y,
              rotation: 0,
              width: 240,
              height: 40,
              scaleX: 1,
              scaleY: 1,
              fontSize: 22,
              fill: "#111827",
            },
          ],
          selectedElementId: id,
        }));
      },

      updateElement: (id, updates) =>
        set((state) => ({
          elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...(updates || {}) } : el
          ),
        })),

      removeElement: (id) =>
        set((state) => ({
          elements: state.elements.filter((el) => el.id !== id),
          selectedElementId:
            state.selectedElementId === id ? null : state.selectedElementId,
        })),

      clearAll: () => set({ elements: [], selectedElementId: null }),

      getSelected: () => {
        const { elements, selectedElementId } = get();
        return elements.find((e) => e.id === selectedElementId) || null;
      },

      getConfigurationJson: (device) => {
        const { elements, capabilityType, allowedZone, backgroundImage } = get();
        return {
          version: "2.0",
          exportedAt: new Date().toISOString(),
          device: device
            ? {
                id: device.id,
                name: device.name,
                supports_printing: device.supports_printing,
                supports_laser: device.supports_laser,
              }
            : null,
          capabilityType,
          allowedZone,
          backgroundImage,
          elements,
        };
      },
    }),
    { name: "canvas-store-v2" }
  )
);

