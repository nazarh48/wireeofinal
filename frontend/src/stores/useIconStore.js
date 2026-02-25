import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  fetchAllIcons,
  fetchIconCategories,
  fetchIconsByCategoryId,
} from "../api/iconService";

export const useIconStore = create(
  devtools(
    (set, get) => ({
      categories: [],
      activeCategoryId: null,
      iconsByCategoryId: {}, // { [id]: Icon[] }
      allIcons: [],
      isLoadingCategories: false,
      isLoadingIcons: false,
      error: null,

      loadCategories: async () => {
        set({ isLoadingCategories: true, error: null });
        try {
          const categories = await fetchIconCategories({ activeOnly: true });
          const sorted = [...categories].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );
          set({
            categories: sorted,
            activeCategoryId: sorted.length ? "all" : null,
            isLoadingCategories: false,
          });
          if (sorted.length) {
            await get().loadAllIcons();
          }
          return sorted;
        } catch (error) {
          set({
            categories: [],
            activeCategoryId: null,
            isLoadingCategories: false,
            error,
          });
          return [];
        }
      },

      setActiveCategoryId: async (categoryId) => {
        set({ activeCategoryId: categoryId });
        if (!categoryId || categoryId === "all") {
          const existingAll = get().allIcons;
          if (!existingAll || existingAll.length === 0) {
            await get().loadAllIcons();
          }
          return;
        }
        const existing = get().iconsByCategoryId[categoryId];
        if (!existing) await get().loadIconsForCategory(categoryId);
      },

      loadIconsForCategory: async (categoryId) => {
        if (!categoryId || categoryId === "all") return [];
        set({ isLoadingIcons: true, error: null });
        try {
          const icons = await fetchIconsByCategoryId(categoryId, {
            activeOnly: true,
          });
          set((state) => ({
            iconsByCategoryId: {
              ...state.iconsByCategoryId,
              [categoryId]: icons,
            },
            isLoadingIcons: false,
          }));
          return icons;
        } catch (error) {
          set({ isLoadingIcons: false, error });
          return [];
        }
      },

      loadAllIcons: async () => {
        set({ isLoadingIcons: true, error: null });
        try {
          const icons = await fetchAllIcons({ activeOnly: true });
          set({
            allIcons: icons,
            isLoadingIcons: false,
          });
          return icons;
        } catch (error) {
          set({ isLoadingIcons: false, error });
          return [];
        }
      },

      getActiveIcons: () => {
        const { activeCategoryId, iconsByCategoryId, allIcons } = get();
        if (!activeCategoryId) return [];
        if (activeCategoryId === "all") return allIcons || [];
        return iconsByCategoryId[activeCategoryId] || [];
      },
    }),
    { name: "icon-store-v2" }
  )
);

