import { create } from "zustand";
import { apiService, USER_TOKEN_KEY, ADMIN_TOKEN_KEY, IMAGE_BASE_URL } from "../services/api";
import { normalizeElements } from "../utils/editorMigration";

const normalizeImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  // Use IMAGE_BASE_URL which already contains /api in production
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${IMAGE_BASE_URL}${path}`;
};

const isConfigurableProduct = (product) =>
  product?.configurable === true ||
  product?.isConfigurable === true ||
  product?.productType === "configurable";

const normalizeProduct = (product, edits = null) => {
  if (!product) return product;
  const baseImageUrlRaw =
    product.baseImageUrl || product.image || product?.images?.[0]?.url || "";
  const normalizedImages = Array.isArray(product.images)
    ? product.images.map((img) => ({
      ...img,
      url: normalizeImageUrl(img.url),
    }))
    : product.images;
  const normalized = {
    ...product,
    baseImageUrl: normalizeImageUrl(baseImageUrlRaw),
    configuratorImageUrl: normalizeImageUrl(
      product.configuratorImageUrl || baseImageUrlRaw,
    ),
    images: normalizedImages,
    configurable: isConfigurableProduct(product),
  };
  if (edits) {
    normalized.edits = edits;
  }
  return normalized;
};

const useStore = create((set, get) => ({
  products: [],
  collection: [],
  collectionLoading: false,
  collectionError: null,
  projects: [],
  projectsLoading: false,
  projectsError: null,
  pendingCollection: [],
  pendingDuplicates: [],
  pendingProjects: [],
  pendingPdfCollection: [],
  pendingPdfCollectionProjectName: null,
  pdfConfigurations: [],
  // Toast state
  toast: { open: false, message: "", actionLabel: null, onAction: null },
  showToast: (message, actionLabel = null, onAction = null) =>
    set({
      toast: { open: true, message, actionLabel, onAction },
    }),
  // Collection actions (configurable products only)
  addToPending: (product) => {
    if (!product || product.configurable !== true) {
      set({
        toast: {
          open: true,
          message: "Only configurable products can be added to the collection.",
          actionLabel: null,
          onAction: null,
        },
      });
      return;
    }
    const productId = product.id ?? product._id;
    const state = get();
    const alreadyInPending = (state.pendingCollection || []).some(
      (p) => (p.id ?? p._id) === productId
    );
    const alreadyInCollection = (state.collection || []).some(
      (p) => (p.id ?? p._id) === productId
    );
    if (alreadyInPending || alreadyInCollection) {
      set({
        toast: {
          open: true,
          message: "This product is already in your collection. Use Duplicate in the Collection tab if you need another copy.",
          actionLabel: null,
          onAction: null,
        },
      });
      return;
    }
    set((state) => {
      try {
        console.debug("addToPending called for", product && product.id);
      } catch (e) {
        // Ignore debug errors
      }
      // Each add creates a NEW instance; do NOT copy product-level edits so instances stay independent.
      const instanceId = `inst_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      const productWithInstance = {
        ...product,
        _instanceId: instanceId,
      };

      const updatedPending = [...state.pendingCollection, productWithInstance];
      try {
        console.debug(
          "pending collection updated length",
          updatedPending.length,
        );
      } catch (e) {
        // Ignore debug errors
      }
      set({
        pendingCollection: updatedPending,
        toast: {
          open: true,
          message:
            updatedPending.length === 1
              ? "1 product is added"
              : `${updatedPending.length} products are added`,
          actionLabel: "Save",
          onAction: () => get().savePending(),
        },
      });
      return {
        pendingCollection: updatedPending,
      };
    });
  },
  fetchPdfConfigurations: async () => {
    try {
      const res = await apiService.pdf.list();
      const configs = res?.configs ?? [];
      set({ pdfConfigurations: configs });
      return configs;
    } catch (e) {
      console.error("Failed to fetch PDF configurations:", e);
      set({ pdfConfigurations: [] });
      return [];
    }
  },
  deletePdfConfiguration: async (id) => {
    try {
      await apiService.pdf.remove(id);
      await get().fetchPdfConfigurations();
      get().showToast("PDF configuration deleted successfully.");
      return true;
    } catch (e) {
      console.error("Failed to delete PDF configuration:", e);
      get().showToast(e?.message || "Failed to delete PDF configuration.");
      return false;
    }
  },

  savePendingAsPdf: () => {
    const state = get();
    const entries = Array.isArray(state.pendingPdfCollection)
      ? state.pendingPdfCollection.filter((e) => e && e.product)
      : [];
    let products = entries.map((e) => e.product);
    if (products.length === 0) {
      get().showToast("No products available for PDF export.");
      return;
    }
    console.info("[PDF] savePendingAsPdf: selected count =", products.length, "instanceIds =", products.map((p) => p._instanceId || p.id).join(", "));

    // Enhance each product INSTANCE with its own edits and editedImage (from editsByInstanceId); fallback to product-level edits.
    products = products.map((product) => {
      const instanceId = product._instanceId;
      const instanceEdits = instanceId ? state.editsByInstanceId[instanceId] : null;
      const edits = instanceEdits
        ? { elements: instanceEdits.elements || [], configuration: instanceEdits.configuration || {} }
        : state.productEdits[product.id] || product.edits || null;
      const editedImage = instanceEdits?.editedImage || product.editedImage || null;
      const normalized = normalizeProduct(product, edits);
      return {
        ...normalized,
        _instanceId: instanceId || product._instanceId,
        edits: edits ? { elements: edits.elements || [], configuration: edits.configuration || {} } : null,
        editedImage: editedImage || null,
      };
    });

    const projectName = state.pendingPdfCollectionProjectName || "Ad-hoc export";
    const projectId = entries[0]?.projectId ?? null;

    try {
      window.dispatchEvent(
        new CustomEvent("generatePdf", { detail: { products, projectName } }),
      );
    } catch (e) {
      // ignore
    }

    // Safely resolve a MongoDB ObjectId string from any product shape
    const resolveProductId = (p) => {
      const raw = p?._id ?? p?.id ?? p?.product?._id ?? p?.product?.id ?? p?.product;
      if (!raw) return null;
      const str = typeof raw === 'object' ? (raw.toString?.() ?? null) : String(raw);
      return str && /^[a-f\d]{24}$/i.test(str) ? str : null;
    };

    // Build snapshot – only include products with a resolvable MongoDB ObjectId
    const snapshot = products
      .map((p) => ({ productId: resolveProductId(p), p }))
      .filter(({ productId }) => !!productId)
      .map(({ productId, p }) => ({
        product: productId,
        instanceId: p._instanceId,
        edits: p.edits || {},
      }));

    apiService.pdf
      .create({
        projectId,
        projectName,
        productCount: snapshot.length || products.length,
        products: snapshot,
      })
      .then(() => {
        get().fetchPdfConfigurations();
        set({
          toast: {
            open: true,
            message: `PDF exported. ${products.length} product${products.length !== 1 ? "s" : ""} added to PDF-Configurations.`,
            actionLabel: null,
            onAction: null,
          },
        });
      })
      .catch((err) => {
        console.error("Failed to persist PDF export:", err);
        set({
          toast: {
            open: true,
            message: "PDF generated but could not save to PDF-Configurations. Check login.",
            actionLabel: null,
            onAction: null,
          },
        });
      });

    get().clearPendingPdfCollection();
  },
  fetchCollection: async () => {
    set({ collectionLoading: true, collectionError: null });
    try {
      const res = await apiService.collections.getMine();
      const raw = res?.collection?.configurableProducts ?? [];
      const collection = raw.map((item) => {
        const p = item.product;
        const normalized = normalizeProduct(p);
        return {
          ...(typeof p === "object" ? normalized : {}),
          id: p?._id ?? p?.id ?? p,
          _instanceId: item.instanceId,
        };
      });

      // Fetch canvas edits for each product in collection (API is per-product; we overlay instance-level from editsByInstanceId)
      const state = get();
      const collectWithEdits = await Promise.all(
        collection.map(async (product) => {
          const instanceId = product._instanceId;
          const instanceEdits = instanceId ? state.editsByInstanceId[instanceId] : null;
          if (instanceEdits) {
            return {
              ...product,
              edits: {
                elements: instanceEdits.elements || [],
                configuration: instanceEdits.configuration || {},
              },
              editedImage: instanceEdits.editedImage || null,
            };
          }
          try {
            if (instanceId) {
              try {
                const instanceRes = await apiService.canvas.getByInstance(instanceId);
                const instanceEdit = instanceRes?.edit || instanceRes?.instanceEdit || null;
                if (instanceEdit?.canvasData || instanceEdit?.editedImage) {
                  return {
                    ...product,
                    edits: {
                      elements: instanceEdit.canvasData || [],
                      configuration: instanceEdit.layoutConfig || {},
                    },
                    editedImage: instanceEdit.editedImage || null,
                  };
                }
                return product;
              } catch {
                // Keep instance edits isolated from product-level edits.
                return product;
              }
            }
            const editRes = await apiService.canvas.getByProduct(product.id);
            if (editRes?.edit?.canvasData) {
              return {
                ...product,
                edits: {
                  elements: editRes.edit.canvasData || [],
                  configuration: editRes.edit.layoutConfig || {},
                },
                editedImage: editRes.edit.editedImage || null,
              };
            }
          } catch (e) {
            console.error(
              `Failed to fetch edits for product ${product.id}:`,
              e,
            );
          }
          return product;
        }),
      );

      // Build updates: only add/update entries for instances that have edits (never remove any key).
      const currentEdits = get().editsByInstanceId;
      const nextEditsByInstanceId = { ...currentEdits };
      collectWithEdits.forEach((item) => {
        const instanceId = item?._instanceId;
        if (!instanceId) return;
        const hasElements =
          Array.isArray(item?.edits?.elements) && item.edits.elements.length > 0;
        const hasEditedImage = !!item?.editedImage;
        const hasConfiguration =
          item?.edits?.configuration &&
          typeof item.edits.configuration === "object" &&
          Object.keys(item.edits.configuration).length > 0;
        const hasAnyEdits = hasElements || hasEditedImage || hasConfiguration;
        if (!hasAnyEdits) return;
        nextEditsByInstanceId[instanceId] = {
          elements: item?.edits?.elements || [],
          configuration: item?.edits?.configuration || {},
          editedImage: item?.editedImage || null,
          lastSaved: new Date().toISOString(),
        };
      });

      // Never replace editsByInstanceId: merge with latest so every product keeps its edits (never remove editing from other products).
      const latestEditsCollection = get().editsByInstanceId;
      const allInstanceIds = new Set([
        ...Object.keys(latestEditsCollection),
        ...Object.keys(nextEditsByInstanceId),
      ]);
      const mergedCollectionEdits = {};
      allInstanceIds.forEach((id) => {
        mergedCollectionEdits[id] =
          nextEditsByInstanceId[id] !== undefined
            ? nextEditsByInstanceId[id]
            : latestEditsCollection[id];
      });
      set({
        collection: collectWithEdits,
        editsByInstanceId: mergedCollectionEdits,
        collectionLoading: false,
        collectionError: null,
      });
      return collectWithEdits;
    } catch (e) {
      set({
        collection: [],
        collectionLoading: false,
        collectionError: e?.message || "Failed to load collection",
      });
      return [];
    }
  },
  fetchProjects: async () => {
    set({ projectsLoading: true, projectsError: null });
    try {
      const res = await apiService.projects.list();
      const raw = res?.projects ?? [];

      const state = get();
      // Fetch canvas edits for all products in all projects; overlay instance-level edits from editsByInstanceId
      const projects = await Promise.all(
        raw.map(async (proj) => ({
          id: proj._id,
          name: proj.name,
          configurationNumber: proj.configurationNumber,
          products: await Promise.all(
            (proj.products || []).map(async (item) => {
              const p = item.product;
              const instanceId = item.instanceId;
              const instanceEdits = instanceId ? state.editsByInstanceId[instanceId] : null;
              if (instanceEdits) {
                const normalized = normalizeProduct(p, instanceEdits);
                const el = instanceEdits.elements;
                const configuratorImageUrl = normalized?.configuratorImageUrl || normalized?.baseImageUrl || "";
                const baseImageUrl = normalized?.baseImageUrl || normalized?.configuratorImageUrl || "";
                return {
                  ...(typeof p === "object" ? normalized : {}),
                  id: p?._id ?? p?.id ?? p,
                  _instanceId: instanceId,
                  edits: {
                    elements: Array.isArray(el) ? el : (el?.elements || []),
                    configuration: instanceEdits.configuration || {},
                  },
                  editedImage: instanceEdits.editedImage || null,
                  configuratorImageUrl,
                  baseImageUrl,
                };
              }
              const normalized = normalizeProduct(p, item.edits || {});
              let canvasEdits = item.edits || {};
              let editedImage = null;
              if (!canvasEdits.elements) {
                try {
                  if (instanceId) {
                    try {
                      const instanceRes = await apiService.canvas.getByInstance(instanceId);
                      const instanceEdit = instanceRes?.edit || instanceRes?.instanceEdit || null;
                      if (instanceEdit?.canvasData || instanceEdit?.editedImage) {
                        const raw = instanceEdit.canvasData;
                        canvasEdits = {
                          elements: Array.isArray(raw) ? raw : (raw?.elements || []),
                          configuration: instanceEdit.layoutConfig || {},
                        };
                        editedImage = instanceEdit.editedImage || null;
                      }
                    } catch {
                      // Keep instance edits isolated from product-level edits.
                      canvasEdits = item.edits || {};
                    }
                  } else if (!canvasEdits.elements) {
                    const editRes = await apiService.canvas.getByProduct(
                      p?._id || p?.id,
                    );
                    if (editRes?.edit?.canvasData) {
                      const raw = editRes.edit.canvasData;
                      canvasEdits = {
                        elements: Array.isArray(raw) ? raw : (raw?.elements || []),
                        configuration: editRes.edit.layoutConfig || {},
                      };
                      editedImage = editRes.edit.editedImage || null;
                    }
                  }
                } catch (e) {
                  console.error(
                    `Failed to fetch canvas edits for product ${p?._id || p?.id}:`,
                    e,
                  );
                }
              }
              const safeEdits = {
                elements: Array.isArray(canvasEdits?.elements) ? canvasEdits.elements : [],
                configuration: canvasEdits?.configuration || {},
              };
              // Ensure configurator image is always set so project shows the same base as configurator/edited view
              const configuratorImageUrl = normalized?.configuratorImageUrl || normalized?.baseImageUrl || "";
              const baseImageUrl = normalized?.baseImageUrl || normalized?.configuratorImageUrl || "";
              return {
                ...(typeof p === "object" ? normalized : {}),
                id: p?._id ?? p?.id ?? p,
                _instanceId: instanceId,
                edits: safeEdits,
                editedImage: editedImage || null,
                configuratorImageUrl,
                baseImageUrl,
              };
            }),
          ),
          createdAt: proj.createdAt,
        })),
      );

      // Build updates: only add/update entries for instances that have edits (never remove any key).
      const currentEditsProjects = get().editsByInstanceId;
      const nextEditsByInstanceIdProjects = { ...currentEditsProjects };
      projects.forEach((project) => {
        (project?.products || []).forEach((product) => {
          const instanceId = product?._instanceId;
          if (!instanceId) return;
          const hasElements =
            Array.isArray(product?.edits?.elements) &&
            product.edits.elements.length > 0;
          const hasEditedImage = !!product?.editedImage;
          const hasConfiguration =
            product?.edits?.configuration &&
            typeof product.edits.configuration === "object" &&
            Object.keys(product.edits.configuration).length > 0;
          const hasAnyEdits = hasElements || hasEditedImage || hasConfiguration;
          if (!hasAnyEdits) return;
          nextEditsByInstanceIdProjects[instanceId] = {
            elements: product?.edits?.elements || [],
            configuration: product?.edits?.configuration || {},
            editedImage: product?.editedImage || null,
            lastSaved: new Date().toISOString(),
          };
        });
      });

      // Never replace editsByInstanceId: merge with latest so every product keeps its edits (never remove editing from other products).
      const latestEdits = get().editsByInstanceId;
      const allInstanceIdsProjects = new Set([
        ...Object.keys(latestEdits),
        ...Object.keys(nextEditsByInstanceIdProjects),
      ]);
      const mergedProjectsEdits = {};
      allInstanceIdsProjects.forEach((id) => {
        mergedProjectsEdits[id] =
          nextEditsByInstanceIdProjects[id] !== undefined
            ? nextEditsByInstanceIdProjects[id]
            : latestEdits[id];
      });
      set({
        projects,
        editsByInstanceId: mergedProjectsEdits,
        projectsLoading: false,
        projectsError: null,
      });
      return projects;
    } catch (e) {
      set({
        projects: [],
        projectsLoading: false,
        projectsError: e?.message || "Failed to load projects",
      });
      return [];
    }
  },
  savePending: async () => {
    const token =
      typeof localStorage !== "undefined"
        ? (localStorage.getItem(USER_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY))
        : null;
    if (!token) {
      set({
        toast: {
          open: true,
          message: "Please log in to save products to your collection.",
          actionLabel: null,
          onAction: null,
        },
      });
      return;
    }
    const state = get();
    const productIds = state.pendingCollection.map((p) => p.id).filter(Boolean);
    if (productIds.length === 0) {
      set({ pendingCollection: [] });
      return;
    }
    try {
      // Save all pending edits before adding to collection (from editsByInstanceId or pendingEdits)
      const pendingItemsWithEdits = state.pendingCollection.filter((item) => {
        const instId = item._instanceId;
        const edits = state.editsByInstanceId[instId] || state.pendingEdits[instId];
        return edits && edits.elements && edits.elements.length > 0;
      });

      for (const item of pendingItemsWithEdits) {
        const edits = state.editsByInstanceId[item._instanceId] || state.pendingEdits[item._instanceId];
        if (edits && edits.elements && edits.elements.length > 0) {
          await apiService.canvas.save({
            productId: item.id,
            canvasData: edits.elements,
            textOverlays: edits.elements.filter((el) => el.type === "text"),
            layoutConfig: edits.configuration,
          });
        }
      }

      // Now add to collection
      await apiService.collections.add(productIds);
      await get().fetchCollection();
      set({
        pendingCollection: [],
        pendingEdits: {},
        toast: {
          open: true,
          message: "All products added to collection successfully",
          actionLabel: "Go to Collections",
          onAction: () => {
            window.dispatchEvent(new CustomEvent("navigateToCollection"));
          },
        },
      });
    } catch (e) {
      set({
        toast: {
          open: true,
          message: e?.message || "Failed to save to collection",
          actionLabel: null,
          onAction: null,
        },
      });
    }
  },
  addToCollection: async (product) => {
    if (!product || product.configurable !== true) return false;
    const token =
      typeof localStorage !== "undefined"
        ? (localStorage.getItem(USER_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY))
        : null;
    if (!token) {
      set({
        toast: {
          open: true,
          message: "Please log in to add products to your collection.",
          actionLabel: null,
          onAction: null,
        },
      });
      return false;
    }
    try {
      await apiService.collections.add([product.id]);
      await get().fetchCollection();
      return true;
    } catch (e) {
      set({
        toast: {
          open: true,
          message: e?.message || "Failed to add to collection",
          actionLabel: null,
          onAction: null,
        },
      });
      return false;
    }
  },
  duplicateProductInCollection: async (product, instanceId) => {
    if (!product || !isConfigurableProduct(product)) {
      get().showToast("Only configurable products can be duplicated.");
      return false;
    }
    const token =
      typeof localStorage !== "undefined"
        ? (localStorage.getItem(USER_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY))
        : null;
    if (!token) {
      get().showToast("Please log in to duplicate products.");
      return false;
    }
    try {
      if (!instanceId) {
        get().showToast("Could not duplicate: missing product instance id.");
        return false;
      }
      const res = await apiService.collections.duplicateItem(instanceId);
      const duplicatedItem = res?.item || null;
      const newInstanceId = res?.newInstanceId || duplicatedItem?.instanceId || null;
      await get().fetchCollection();
      if (!newInstanceId) {
        get().showToast("Product duplicated, but new instance id was not returned.");
        return true;
      }
      get().showToast(
        "Product duplicated successfully as a separate item.",
      );
      return true;
    } catch (e) {
      console.error("Duplication error:", e);
      get().showToast(e?.message || "Failed to duplicate product.");
      return false;
    }
  },
  removeFromCollection: async (instanceId) => {
    try {
      await apiService.collections.removeItem(instanceId);
      await get().fetchCollection();
    } catch (e) {
      set({
        toast: {
          open: true,
          message: e?.message || "Failed to remove from collection",
          actionLabel: null,
          onAction: null,
        },
      });
    }
  },
  clearCollection: () => set({ collection: [] }),
  clearPendingCollection: () => {
    set({ pendingCollection: [], pendingEdits: {} });
  },
  addToPendingDuplicates: (product) => {
    if (!product || product.configurable !== true) return;
    set((state) => {
      const duplicatedProduct = {
        ...product,
        _instanceId: Date.now() + Math.random(),
        id: Date.now() + Math.random(),
        name: `${product.name} (Copy)`,
      };
      const updatedDuplicates = [...state.pendingDuplicates, duplicatedProduct];
      set({
        pendingDuplicates: updatedDuplicates,
        toast: {
          open: true,
          message:
            updatedDuplicates.length === 1
              ? "1 product added"
              : `${updatedDuplicates.length} products added`,
          actionLabel: "Save",
          onAction: () => get().savePendingDuplicates(),
        },
      });
      return { pendingDuplicates: updatedDuplicates };
    });
  },
  savePendingDuplicates: () => {
    set((state) => {
      const updatedCollection = [
        ...state.collection,
        ...state.pendingDuplicates,
      ];
      set({
        collection: updatedCollection,
        pendingDuplicates: [],
        toast: {
          open: true,
          message: "All duplicates added to collection successfully",
          actionLabel: null,
          onAction: null,
        },
      });
      return { collection: updatedCollection, pendingDuplicates: [] };
    });
  },
  clearPendingDuplicates: () => set({ pendingDuplicates: [] }),
  // Project actions (configurable products only)
  addToPendingProjects: (product) => {
    if (!product || product.configurable !== true) {
      set({
        toast: {
          open: true,
          message: "Only configurable products can be added to projects.",
          actionLabel: null,
          onAction: null,
        },
      });
      return;
    }
    set((state) => {
      const exists = state.pendingProjects.some(
        (p) => p._instanceId === product._instanceId,
      );
      if (exists) {
        set({
          toast: {
            open: true,
            message: "Product already in pending projects",
            actionLabel: null,
            onAction: null,
          },
        });
        return state;
      }
      const updatedPending = [...state.pendingProjects, product];
      set({
        pendingProjects: updatedPending,
        toast: {
          open: true,
          message: `${updatedPending.length} product${updatedPending.length !== 1 ? "s" : ""} added to project`,
          actionLabel: "Save Project",
          onAction: () => get().savePendingProjects(),
        },
      });
      return { pendingProjects: updatedPending };
    });
  },
  removeFromPendingProjects: (productInstanceId) => {
    set((state) => {
      const updatedPending = state.pendingProjects.filter(
        (p) => p._instanceId !== productInstanceId,
      );
      return { pendingProjects: updatedPending };
    });
  },
  clearPendingProjects: () => {
    set({ pendingProjects: [] });
  },
  savePendingProjects: (projectName = null) => {
    set((state) => {
      if (state.pendingProjects.length === 0) {
        set({
          toast: {
            open: true,
            message: "Please add products before saving the project",
            actionLabel: null,
            onAction: null,
          },
        });
        return state;
      }
      // Create a new project with the pending products
      const newProject = {
        id: `project_${Date.now()}`,
        name: projectName || `Project ${state.projects.length + 1}`,
        products: [...state.pendingProjects],
        createdAt: new Date().toISOString(),
      };
      const updatedProjects = [...state.projects, newProject];
      set({
        projects: updatedProjects,
        pendingProjects: [],
        toast: {
          open: true,
          message: `Project "${newProject.name}" created successfully`,
          actionLabel: "Go to Projects",
          onAction: () => {
            window.dispatchEvent(new CustomEvent("navigateToProjectsTab"));
          },
        },
      });
      return { projects: updatedProjects, pendingProjects: [] };
    });
  },
  updateProjectName: async (projectId, newName) => {
    try {
      await apiService.projects.updateName(projectId, newName);
      await get().fetchProjects();
    } catch (e) {
      set({
        toast: {
          open: true,
          message: e?.message || "Failed to update project name",
          actionLabel: null,
          onAction: null,
        },
      });
    }
  },
  removeProductFromProject: async (projectId, instanceId) => {
    if (!projectId || !instanceId) {
      get().showToast("Could not remove product: missing project/product reference.");
      return false;
    }
    try {
      await apiService.projects.removeProduct({ projectId, instanceId });
      await get().fetchProjects();
      set({
        toast: {
          open: true,
          message: "Product removed from project",
          actionLabel: null,
          onAction: null,
        },
      });
      return true;
    } catch (e) {
      set({
        toast: {
          open: true,
          message: e?.message || "Failed to remove product from project",
          actionLabel: null,
          onAction: null,
        },
      });
      return false;
    }
  },
  deleteProject: async (projectId) => {
    try {
      await apiService.projects.remove(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        pendingPdfCollection: (state.pendingPdfCollection || []).filter(
          (e) => e.projectId !== projectId,
        ),
      }));
      await get().fetchProjects();
      set({
        toast: {
          open: true,
          message: "Project deleted successfully",
          actionLabel: null,
          onAction: null,
        },
      });
    } catch (e) {
      set({
        toast: {
          open: true,
          message: e?.message || "Failed to delete project",
          actionLabel: null,
          onAction: null,
        },
      });
    }
  },
  productRanges: [
    {
      id: "activline",
      name: "ActivLine",
      description: "Professional access control solutions",
    },
    {
      id: "activtouch",
      name: "ActivTouch",
      description: "Touch-based access systems",
    },
    {
      id: "activentry",
      name: "ActivEntry",
      description: "Entry-level access control",
    },
  ],
  categories: [],
  currentProduct: null,
  loading: false,
  error: null,

  // Configurator state - isolated per product (Konva node schema: id, type, attrs, zIndex, locked, visible)
  configurator: {
    isOpen: false,
    product: null,
    editingInstanceId: null, // When set, edits are stored in editsByInstanceId[editingInstanceId], not productEdits
    elements: [],
    selectedElementId: null,
    selectedElementIds: [], // Multi-select; primary selection is first
    copyBuffer: [], // For ctrl+c / ctrl+v
    activeTool: "select",
    history: [[]],
    historyIndex: 0,
    configuration: {
      id: null,
      productId: null,
      isValid: false,
      lastModified: null,
      backgroundImage: null,
    },
    validationErrors: [],
    backgroundImage: null,
  },

  // Store edited product configurations per product ID (legacy: when editing from selection, no instanceId)
  productEdits: {}, // { [productId]: { elements: [], configuration: {}, lastSaved: timestamp } }

  // Store edits per product INSTANCE so same product added multiple times has independent edits.
  // Key = instanceId (e.g. _instanceId from collection/project/pending). Never key by productId for instances.
  editsByInstanceId: {}, // { [instanceId]: { elements: [], configuration: {}, lastSaved?, editedImage?: { type:'base64'|'url', value, updatedAt } } }

  // Store pending edits for products being added to collection
  pendingEdits: {}, // { [instanceId]: { elements: [], configuration: {} } }

  // Admin state
  admin: {
    isLoggedIn: false,
    user: null,
    role: null, // 'administrator' or 'content-manager'
  },

  // User state
  user: {
    isLoggedIn: false,
    user: null,
  },

  // UI state
  ui: {
    mobileMenuOpen: false,
    notifications: [],
    showPdfButton: false,
    selectedProductForPdf: null,
  },

  // Toast actions
  closeToast: () =>
    set({
      toast: { open: false, message: "", actionLabel: null, onAction: null },
    }),

  editedProductIds: new Set(),

  // Actions
  setProducts: (products) => set({ products }),
  setProductRanges: (ranges) => set({ productRanges: ranges }),
  setCategories: (categories) => set({ categories }),
  setCurrentProduct: (product) => set({ currentProduct: product }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Configurator actions. When instanceId is provided, edits are stored per instance (editsByInstanceId); otherwise per product (productEdits).
  setProduct: (product, instanceId = null) =>
    set((state) => {
      let existingEdits = null;
      if (instanceId) {
        existingEdits = state.editsByInstanceId[instanceId] || state.pendingEdits[instanceId] || null;
      }
      // For instance editing, never fall back to product-level edits.
      // This keeps duplicated instances fully isolated.
      if (!existingEdits && !instanceId) {
        existingEdits = state.productEdits[product?.id] || null;
      }
      const rawElements = existingEdits?.elements || [];
      const elements = normalizeElements(rawElements);
      const existingCfg = existingEdits?.configuration || {};
      const nextConfig = {
        id:
          existingCfg.id ||
          `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: product?.id,
        isValid: existingCfg.isValid || false,
        lastModified: existingCfg.lastModified || null,
        // Ensure editor form fields are reset per product/instance unless persisted.
        processingType: existingCfg.processingType || "Colour printing",
        individualLabeling: existingCfg.individualLabeling || "",
        room: existingCfg.room || "",
        floor: String(existingCfg.floor ?? "1"),
        backgroundImage: existingCfg.backgroundImage || null,
      };
      return {
        configurator: {
          ...state.configurator,
          product,
          editingInstanceId: instanceId || null,
          elements,
          selectedElementId: null,
          selectedElementIds: [],
          activeTool: "select",
          history: [JSON.parse(JSON.stringify(elements))],
          historyIndex: 0,
          // Do not carry previous product configuration into a newly opened product.
          configuration: nextConfig,
          validationErrors: [],
          backgroundImage: existingCfg.backgroundImage || null,
        },
      };
    }),

  // Save product edits. When instanceId is provided, save to editsByInstanceId (per-instance); otherwise to productEdits (per-product).
  // editedImageDataURL: optional base64 data URL from Konva stage export; stored so PDF uses exact edited image.
  saveProductEdits: async (productId, instanceId = null, editedImageDataURL = null) => {
    const state = get();
    if (!productId || !state.configurator.product) return false;
    const existingInstanceEdits = instanceId ? state.editsByInstanceId[instanceId] : null;
    const existingProductEdits = !instanceId ? state.productEdits[productId] : null;

    const buildExportConfig = () => {
      const cfg = state.configurator;
      const product = cfg.product || {};
      const elements = cfg.elements || [];
      const icons = elements
        .filter((el) => (el.type === "icon" || el.type === "image" || el.type === "mdiIcon") && el.iconId)
        .map((el) => {
          const baseSize = el.baseSize || el.width || el.height || 34;
          const scale =
            baseSize && el.width ? el.width / baseSize : 1;
          return {
            iconId: el.iconId,
            x: el.x ?? 0,
            y: el.y ?? 0,
            scale,
            rotation: el.rotation ?? 0,
            baseSize,
          };
        });
      const texts = elements
        .filter((el) => el.type === "text")
        .map((el) => ({
          content: el.text || "",
          font: el.fontFamily || "Arial",
          size: el.fontSize || 24,
          x: el.x ?? 0,
          y: el.y ?? 0,
          rotation: el.rotation ?? 0,
          color: el.color || "#000000",
          width: el.width ?? 200,
          height: el.height ?? 50,
        }));
      return {
        productId,
        printingEnabled:
          product.printingEnabled !== undefined
            ? !!product.printingEnabled
            : true,
        laserEnabled:
          product.laserEnabled !== undefined
            ? !!product.laserEnabled
            : true,
        backgroundCustomizable:
          product.backgroundCustomizable !== undefined
            ? !!product.backgroundCustomizable
            : true,
        backgroundImage: cfg.backgroundImage || cfg.configuration?.backgroundImage || null,
        icons,
        texts,
      };
    };

    const edits = {
      elements: [...state.configurator.elements],
      configuration: {
        ...state.configurator.configuration,
        backgroundImage: state.configurator.backgroundImage || state.configurator.configuration?.backgroundImage || null,
      },
      lastSaved: new Date().toISOString(),
      exportConfig: buildExportConfig(),
    };
    if (editedImageDataURL && editedImageDataURL.length <= 1_500_000) {
      edits.editedImage = {
        type: "base64",
        value: editedImageDataURL,
        updatedAt: edits.lastSaved,
      };
    } else if (instanceId && existingInstanceEdits?.editedImage) {
      edits.editedImage = existingInstanceEdits.editedImage;
    } else if (!instanceId && existingProductEdits?.editedImage) {
      edits.editedImage = existingProductEdits.editedImage;
    }

    // Always update local state first for responsive UI.
    if (instanceId) {
      set((s) => ({
        editsByInstanceId: {
          ...s.editsByInstanceId,
          [instanceId]: edits,
        },
      }));
    } else {
      set((s) => ({
        productEdits: {
          ...s.productEdits,
          [productId]: edits,
        },
      }));
    }

    try {
      if (instanceId) {
        let saveRes;
        try {
          saveRes = await apiService.canvas.saveInstance({
            instanceId,
            productId,
            canvasData: edits.elements,
            textOverlays: edits.elements.filter((el) => el.type === "text"),
            layoutConfig: edits.configuration,
            // Do not upload heavy editedImage snapshots to backend; it causes large payload failures.
            editedImage: null,
            exportConfig: edits.exportConfig || null,
          });
        } catch (err) {
          const status = err?.response?.status;
          const message = `${err?.response?.data?.message || err?.message || ""}`.toLowerCase();
          const isPayloadTooLarge =
            status === 413 ||
            message.includes("too large") ||
            message.includes("entity too large") ||
            message.includes("payload");
          if (!isPayloadTooLarge) throw err;
          saveRes = await apiService.canvas.saveInstance({
            instanceId,
            productId,
            canvasData: edits.elements,
            textOverlays: edits.elements.filter((el) => el.type === "text"),
            layoutConfig: edits.configuration,
            editedImage: null,
            exportConfig: edits.exportConfig || null,
          });
        }
        const persisted = saveRes?.edit || null;
        if (persisted) {
          const normalizedPersisted = {
            elements: persisted.canvasData || edits.elements || [],
            configuration: persisted.layoutConfig || edits.configuration || {},
            editedImage: persisted.editedImage || edits.editedImage || null,
            lastSaved: persisted.updatedAt || new Date().toISOString(),
          };
          set((s) => ({
            editsByInstanceId: {
              ...s.editsByInstanceId,
              [instanceId]: normalizedPersisted,
            },
          }));
        }
        return true;
      }

      const saveRes = await apiService.canvas.save({
        productId,
        canvasData: edits.elements,
        textOverlays: edits.elements.filter((el) => el.type === "text"),
        layoutConfig: edits.configuration,
        exportConfig: edits.exportConfig || null,
      });
      const persisted = saveRes?.edit || null;
      if (persisted) {
        set((s) => ({
          productEdits: {
            ...s.productEdits,
            [productId]: {
              elements: persisted.canvasData || edits.elements || [],
              configuration: persisted.layoutConfig || edits.configuration || {},
              editedImage: persisted.editedImage || edits.editedImage || null,
              lastSaved: persisted.updatedAt || new Date().toISOString(),
            },
          },
        }));
      }
      return true;
    } catch (err) {
      console.error("Failed to save product edits to backend:", err);
      return false;
    }
  },

  // Get product edits
  getProductEdits: (productId) => {
    const state = get();
    return state.productEdits[productId] || null;
  },

  // Clear product edits
  clearProductEdits: (productId) =>
    set((state) => {
      const newEdits = { ...state.productEdits };
      delete newEdits[productId];
      return { productEdits: newEdits };
    }),
  // Save state to history for undo/redo
  saveToHistory: () =>
    set((state) => {
      const history = state.configurator.history || [[]];
      const historyIndex = state.configurator.historyIndex ?? 0;
      const newHistory = history.slice(0, historyIndex + 1);
      const currentState = JSON.parse(
        JSON.stringify(state.configurator.elements),
      );
      // Only save if different from last state
      const lastState = newHistory[newHistory.length - 1];
      if (JSON.stringify(lastState) !== JSON.stringify(currentState)) {
        newHistory.push(currentState);
      }
      // Limit history to 50 states
      const limitedHistory = newHistory.slice(-50);
      return {
        configurator: {
          ...state.configurator,
          history: limitedHistory,
          historyIndex: limitedHistory.length - 1,
        },
      };
    }),
  undo: () =>
    set((state) => {
      const history = state.configurator.history || [[]];
      const historyIndex = state.configurator.historyIndex ?? 0;
      if (historyIndex > 0) {
        return {
          configurator: {
            ...state.configurator,
            elements: JSON.parse(JSON.stringify(history[historyIndex - 1])),
            historyIndex: historyIndex - 1,
            selectedElementId: null,
            selectedElementIds: [],
          },
        };
      }
      return state;
    }),
  redo: () =>
    set((state) => {
      const history = state.configurator.history || [[]];
      const historyIndex = state.configurator.historyIndex ?? 0;
      if (historyIndex < history.length - 1) {
        return {
          configurator: {
            ...state.configurator,
            elements: JSON.parse(JSON.stringify(history[historyIndex + 1])),
            historyIndex: historyIndex + 1,
            selectedElementId: null,
            selectedElementIds: [],
          },
        };
      }
      return state;
    }),
  setActiveTool: (tool) =>
    set((state) => ({
      configurator: {
        ...state.configurator,
        activeTool: tool,
        selectedElementId: null,
        selectedElementIds: [],
      },
    })),
  updateConfiguratorConfiguration: (updates) =>
    set((state) => ({
      configurator: {
        ...state.configurator,
        configuration: {
          ...state.configurator.configuration,
          ...(updates || {}),
          lastModified: new Date().toISOString(),
        },
      },
    })),
  setBackgroundImage: (backgroundImage) =>
    set((state) => ({
      configurator: {
        ...state.configurator,
        backgroundImage: backgroundImage || null,
        configuration: {
          ...state.configurator.configuration,
          backgroundImage: backgroundImage || null,
          lastModified: new Date().toISOString(),
        },
      },
    })),
  clearBackgroundImage: () =>
    set((state) => ({
      configurator: {
        ...state.configurator,
        backgroundImage: null,
        configuration: {
          ...state.configurator.configuration,
          backgroundImage: null,
          lastModified: new Date().toISOString(),
        },
      },
    })),
  // Layer management
  bringToFront: (id) =>
    set((state) => {
      const elements = [...state.configurator.elements];
      const index = elements.findIndex((e) => e.id === id);
      if (index >= 0) {
        const element = elements.splice(index, 1)[0];
        elements.push(element);
        return {
          configurator: {
            ...state.configurator,
            elements,
          },
        };
      }
      return state;
    }),
  sendToBack: (id) =>
    set((state) => {
      const elements = [...state.configurator.elements];
      const index = elements.findIndex((e) => e.id === id);
      if (index >= 0) {
        const element = elements.splice(index, 1)[0];
        elements.unshift(element);
        return {
          configurator: {
            ...state.configurator,
            elements,
          },
        };
      }
      return state;
    }),
  bringForward: (id) =>
    set((state) => {
      const elements = [...state.configurator.elements];
      const index = elements.findIndex((e) => e.id === id);
      if (index >= 0 && index < elements.length - 1) {
        [elements[index], elements[index + 1]] = [
          elements[index + 1],
          elements[index],
        ];
        return {
          configurator: {
            ...state.configurator,
            elements,
          },
        };
      }
      return state;
    }),
  sendBackward: (id) =>
    set((state) => {
      const elements = [...state.configurator.elements];
      const index = elements.findIndex((e) => e.id === id);
      if (index > 0) {
        [elements[index], elements[index - 1]] = [
          elements[index - 1],
          elements[index],
        ];
        return {
          configurator: {
            ...state.configurator,
            elements,
          },
        };
      }
      return state;
    }),
  addElement: (element) => {
    get().saveToHistory();
    return set((state) => ({
      configurator: {
        ...state.configurator,
        elements: [
          ...state.configurator.elements,
          {
            ...element,
            id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            strokeWidth: element.strokeWidth || 2,
            opacity: element.opacity !== undefined ? element.opacity : 1,
            fill: element.fill || element.color || "#000000",
            stroke: element.stroke || element.color || "#000000",
          },
        ],
      },
    }));
  },
  updateElement: (id, updates) => {
    get().saveToHistory();
    return set((state) => ({
      configurator: {
        ...state.configurator,
        elements: state.configurator.elements.map((elem) =>
          elem.id === id ? { ...elem, ...updates } : elem,
        ),
      },
    }));
  },
  deleteElement: (id) => {
    get().saveToHistory();
    return set((state) => {
      const nextIds = (state.configurator.selectedElementIds || []).filter((x) => x !== id);
      return {
        configurator: {
          ...state.configurator,
          elements: state.configurator.elements.filter((elem) => elem.id !== id),
          selectedElementId: state.configurator.selectedElementId === id ? (nextIds[0] || null) : state.configurator.selectedElementId,
          selectedElementIds: nextIds,
        },
      };
    });
  },
  selectElement: (id) =>
    set((state) => ({
      configurator: {
        ...state.configurator,
        selectedElementId: id,
        selectedElementIds: id ? [id] : [],
      },
    })),
  setSelectedElements: (ids) =>
    set((state) => ({
      configurator: {
        ...state.configurator,
        selectedElementIds: Array.isArray(ids) ? ids : [],
        selectedElementId: Array.isArray(ids) && ids.length > 0 ? ids[0] : null,
      },
    })),
  addToSelection: (id) =>
    set((state) => {
      const ids = state.configurator.selectedElementIds || [];
      if (!id || ids.includes(id)) return state;
      const next = [...ids, id];
      return {
        configurator: {
          ...state.configurator,
          selectedElementIds: next,
          selectedElementId: next[0],
        },
      };
    }),
  removeFromSelection: (id) =>
    set((state) => {
      const ids = (state.configurator.selectedElementIds || []).filter((x) => x !== id);
      return {
        configurator: {
          ...state.configurator,
          selectedElementIds: ids,
          selectedElementId: ids.length > 0 ? ids[0] : null,
        },
      };
    }),
  clearSelection: () =>
    set((state) => ({
      configurator: {
        ...state.configurator,
        selectedElementId: null,
        selectedElementIds: [],
      },
    })),
  copyElements: () =>
    set((state) => {
      const ids = state.configurator.selectedElementIds || [];
      if (ids.length === 0) return state;
      const elements = state.configurator.elements.filter((el) => ids.includes(el.id));
      return {
        configurator: {
          ...state.configurator,
          copyBuffer: JSON.parse(JSON.stringify(elements)),
        },
      };
    }),
  pasteElements: () =>
    get().pasteElementsAt(null, null),
  pasteElementsAt: (offsetX = 20, offsetY = 20) =>
    set((state) => {
      const buffer = state.configurator.copyBuffer || [];
      if (buffer.length === 0) return state;
      get().saveToHistory();
      const baseX = offsetX != null ? offsetX : 20;
      const baseY = offsetY != null ? offsetY : 20;
      const minX = Math.min(...buffer.map((e) => e.x ?? 0));
      const minY = Math.min(...buffer.map((e) => e.y ?? 0));
      const newElements = buffer.map((el, i) => {
        const { id: _id, ...rest } = el;
        return {
          ...rest,
          id: `elem_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
          x: (el.x ?? 0) - minX + baseX,
          y: (el.y ?? 0) - minY + baseY,
        };
      });
      const newIds = newElements.map((e) => e.id);
      return {
        configurator: {
          ...state.configurator,
          elements: [...state.configurator.elements, ...newElements],
          selectedElementIds: newIds,
          selectedElementId: newIds[0],
        },
      };
    }),
  deleteSelected: () =>
    set((state) => {
      const ids = state.configurator.selectedElementIds || [];
      if (ids.length === 0) return state;
      get().saveToHistory();
      return {
        configurator: {
          ...state.configurator,
          elements: state.configurator.elements.filter((el) => !ids.includes(el.id)),
          selectedElementId: null,
          selectedElementIds: [],
        },
      };
    }),
  validateConfiguration: () => {
    const state = get();
    const { configuration, compatibilityRules, textElements } =
      state.configurator;

    const errors = [];

    // Validate layer compatibility
    compatibilityRules.forEach((rule) => {
      if (!rule.validate(configuration.layers)) {
        errors.push(rule.message);
      }
    });

    // Validate text constraints
    textElements.forEach((text) => {
      if (text.value && text.value.length > text.maxLength) {
        errors.push(
          `Text "${text.label}" exceeds maximum length of ${text.maxLength} characters`,
        );
      }
    });

    const isValid = errors.length === 0;

    set((state) => ({
      configurator: {
        ...state.configurator,
        configuration: {
          ...state.configurator.configuration,
          isValid,
        },
        validationErrors: errors,
      },
    }));

    return isValid;
  },
  exportConfiguration: () => {
    const state = get();
    const { configuration } = state.configurator;

    // Generate PDF or export data
    return {
      ...configuration,
      exportDate: new Date().toISOString(),
      pdfUrl: `/api/configurations/${configuration.id}/pdf`,
    };
  },

  // Grouping actions
  groupElements: (elementIds) => {
    get().saveToHistory();
    return set((state) => {
      const elements = [...state.configurator.elements];
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const groupedElements = elements.filter((el) =>
        elementIds.includes(el.id),
      );
      const otherElements = elements.filter(
        (el) => !elementIds.includes(el.id),
      );

      // Create group element
      const groupElement = {
        id: groupId,
        type: "group",
        children: groupedElements.map((el) => el.id),
        x: Math.min(...groupedElements.map((el) => el.x || 0)),
        y: Math.min(...groupedElements.map((el) => el.y || 0)),
        width:
          Math.max(
            ...groupedElements.map((el) => (el.x || 0) + (el.width || 0)),
          ) - Math.min(...groupedElements.map((el) => el.x || 0)),
        height:
          Math.max(
            ...groupedElements.map((el) => (el.y || 0) + (el.height || 0)),
          ) - Math.min(...groupedElements.map((el) => el.y || 0)),
      };

      // Mark elements as grouped
      const updatedGroupedElements = groupedElements.map((el) => ({
        ...el,
        groupId,
      }));

      return {
        configurator: {
          ...state.configurator,
          elements: [...otherElements, ...updatedGroupedElements, groupElement],
        },
      };
    });
  },

  ungroupElements: (groupId) => {
    get().saveToHistory();
    return set((state) => {
      const elements = [...state.configurator.elements];
      const groupElement = elements.find(
        (el) => el.id === groupId && el.type === "group",
      );
      if (!groupElement) return state;

      // Remove group element and ungroup children
      const updatedElements = elements
        .filter((el) => el.id !== groupId)
        .map((el) => {
          if (el.groupId === groupId) {
            const { groupId: _, ...ungrouped } = el;
            return ungrouped;
          }
          return el;
        });

      return {
        configurator: {
          ...state.configurator,
          elements: updatedElements,
          selectedElementId: null,
        },
      };
    });
  },

  // Import/Export actions
  importTemplate: (template) => {
    get().saveToHistory();
    return set((state) => {
      const importedElements = (template.elements || []).map((el, idx) => ({
        ...el,
        id: `elem_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 9)}`,
      }));

      return {
        configurator: {
          ...state.configurator,
          elements: [...state.configurator.elements, ...importedElements],
          configuration:
            template.configuration || state.configurator.configuration,
        },
      };
    });
  },

  // Duplicate selected elements
  duplicateElements: (elementIds) => {
    get().saveToHistory();
    return set((state) => {
      const elementsToDuplicate = state.configurator.elements.filter((el) =>
        elementIds.includes(el.id),
      );
      const duplicated = elementsToDuplicate.map((el) => ({
        ...el,
        id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: (el.x || 0) + 20,
        y: (el.y || 0) + 20,
      }));

      return {
        configurator: {
          ...state.configurator,
          elements: [...state.configurator.elements, ...duplicated],
        },
      };
    });
  },

  // Select multiple elements
  selectMultiple: (elementIds) =>
    set((state) => ({
      configurator: {
        ...state.configurator,
        selectedElementIds: Array.isArray(elementIds) ? elementIds : [],
        selectedElementId: Array.isArray(elementIds) && elementIds.length > 0 ? elementIds[0] : null,
      },
    })),

  // Clear all elements
  clearAllElements: () => {
    get().saveToHistory();
    return set((state) => ({
      configurator: {
        ...state.configurator,
        elements: [],
        selectedElementId: null,
      },
    }));
  },

  // Admin actions
  loginAdmin: (user, role = "content-manager") =>
    set({ admin: { isLoggedIn: true, user, role } }),
  logoutAdmin: () =>
    set({ admin: { isLoggedIn: false, user: null, role: null } }),

  // User actions
  loginUser: (user) => set({ user: { isLoggedIn: true, user } }),
  logoutUser: () => set({ user: { isLoggedIn: false, user: null } }),
  registerUser: (user) => set({ user: { isLoggedIn: true, user } }),

  // UI actions
  toggleMobileMenu: () =>
    set((state) => ({
      ui: { ...state.ui, mobileMenuOpen: !state.ui.mobileMenuOpen },
    })),
  closeMobileMenu: () =>
    set((state) => ({
      ui: { ...state.ui, mobileMenuOpen: false },
    })),
  addNotification: (notification) =>
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: [
          ...state.ui.notifications,
          { ...notification, id: Date.now() },
        ],
      },
    })),
  removeNotification: (id) =>
    set((state) => ({
      ui: {
        ...state.ui,
        notifications: state.ui.notifications.filter((n) => n.id !== id),
      },
    })),
  // PDF collection: array of { entryId, projectId?, projectName?, product } so same product can appear multiple times and we can remove by entry.
  addProductsToPdf: (products, projectName = null, projectId = null) => {
    const state = get();
    const list = Array.isArray(products) ? products.filter(Boolean) : [];
    if (list.length === 0) {
      get().showToast("No products available to add to PDF.");
      return 0;
    }
    const eligible = list
      .filter((product) => isConfigurableProduct(product))
      .map((product) => {
        const edits = product.edits || state.productEdits[product.id] || null;
        return normalizeProduct(product, edits);
      });
    if (eligible.length === 0) {
      get().showToast("Only configurable products can be added to PDF.");
      return 0;
    }
    const entries = eligible.map((product) => ({
      entryId: `pdf_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      projectId: projectId || null,
      projectName: projectName || null,
      product,
    }));
    set({
      pendingPdfCollection: [...(state.pendingPdfCollection || []), ...entries],
      pendingPdfCollectionProjectName:
        projectName || state.pendingPdfCollectionProjectName,
    });
    return entries.length;
  },
  removeFromPdfCollection: (entryId) => {
    set((state) => ({
      pendingPdfCollection: (state.pendingPdfCollection || []).filter(
        (e) => e.entryId !== entryId,
      ),
    }));
  },
  showPdfButton: (product) => {
    get().addProductsToPdf([product]);
  },
  hidePdfButton: () =>
    set((state) => ({
      ui: { ...state.ui, showPdfButton: false, selectedProductForPdf: null },
    })),
  clearPendingPdfCollection: () =>
    set(() => ({
      pendingPdfCollection: [],
      pendingPdfCollectionProjectName: null,
    })),

  duplicateProject: async (project) => {
    if (!project || !project.products || project.products.length === 0) {
      get().showToast("Project has no products to duplicate.");
      return false;
    }
    const instanceIds = project.products
      .map((p) => p._instanceId || p.id)
      .filter(Boolean);
    if (instanceIds.length === 0) {
      get().showToast("Could not get product instances for duplicate.");
      return false;
    }
    try {
      await apiService.projects.addFromCollection({
        projectName: `${project.name || "Project"} (Copy)`,
        instanceIds,
      });
      await get().fetchProjects();
      get().showToast("Project duplicated successfully.");
      return true;
    } catch (e) {
      get().showToast(e?.message || "Failed to duplicate project.");
      return false;
    }
  },

  addProductsToProject: async (products, projectId, projectName = null) => {
    const instanceIds = (products || [])
      .map((p) => p._instanceId || p.id)
      .filter(Boolean);
    if (instanceIds.length === 0) return false;
    try {
      await apiService.projects.addFromCollection({
        projectId: projectId || undefined,
        projectName: projectName || undefined,
        instanceIds,
      });
      await get().fetchProjects();
      set({
        toast: {
          open: true,
          message: "Products added to project successfully",
          actionLabel: "Go to Projects",
          onAction: () => {
            window.dispatchEvent(new CustomEvent("navigateToProjectsTab"));
          },
        },
      });
      return true;
    } catch (e) {
      set({
        toast: {
          open: true,
          message: e?.message || "Failed to add to project",
          actionLabel: null,
          onAction: null,
        },
      });
      return false;
    }
  },

  // Legacy support - keep for backward compatibility
  addToProjects: (product, quantity = 1) =>
    set((state) => {
      const existingProject = state.projects.find(
        (p) => p.productId === product.id,
      );
      if (existingProject) {
        return {
          projects: state.projects.map((p) =>
            p.productId === product.id
              ? { ...p, quantity: p.quantity + quantity }
              : p,
          ),
        };
      } else {
        return {
          projects: [
            ...state.projects,
            {
              id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              productId: product.id,
              product,
              quantity,
              addedDate: new Date().toISOString(),
            },
          ],
        };
      }
    }),

  // Create a separate project instance even if same product already exists
  addProjectInstance: (product, quantity = 1, name = null) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId: product.id,
          product,
          quantity,
          name,
          addedDate: new Date().toISOString(),
        },
      ],
    })),
  removeFromProjects: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
    })),
  updateProjectQuantity: (projectId, quantity) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, quantity } : p,
      ),
    })),
  markProductAsEdited: (productId) =>
    set((state) => {
      // Save current edits when marking as edited
      const edits = {
        elements: [...state.configurator.elements],
        configuration: { ...state.configurator.configuration },
        lastSaved: new Date().toISOString(),
      };

      return {
        editedProductIds: new Set([...state.editedProductIds, productId]),
        productEdits: {
          ...state.productEdits,
          [productId]: edits,
        },
      };
    }),

  createProject: async (name) => {
    try {
      const res = await apiService.projects.create({
        name: name || "New Project",
        products: [],
      });
      await get().fetchProjects();
      return res?.project?._id || res?.project?.id || null;
    } catch (e) {
      set({
        toast: {
          open: true,
          message: e?.message || "Failed to create project",
          actionLabel: null,
          onAction: null,
        },
      });
      return null;
    }
  },

  // Instance configuration management
  saveInstanceConfiguration: (instanceId, edits) => {
    set((state) => ({
      editsByInstanceId: {
        ...state.editsByInstanceId,
        [instanceId]: {
          ...edits,
          lastSaved: new Date().toISOString(),
        },
      },
    }));
  },

  getInstanceConfiguration: (instanceId) => {
    const state = get();
    return state.editsByInstanceId[instanceId] || null;
  },

  clearInstanceConfiguration: (instanceId) => {
    set((state) => {
      const { [instanceId]: removed, ...rest } = state.editsByInstanceId;
      return { editsByInstanceId: rest };
    });
  },

  // PDF re-export functionality
  reExportPdf: async (configId) => {
    try {
      const res = await apiService.pdf.reExport(configId);
      await get().fetchPdfConfigurations();
      get().showToast("PDF re-exported successfully");
      return res?.config || null;
    } catch (e) {
      get().showToast(e?.message || "Failed to re-export PDF");
      return null;
    }
  },
}));

export default useStore;
