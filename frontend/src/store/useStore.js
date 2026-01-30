import { create } from "zustand";
import { apiService, USER_TOKEN_KEY, API_ORIGIN } from "../services/api";

const normalizeImageUrl = (url) => {
  if (!url) return "";
  return url.startsWith("/") ? `${API_ORIGIN}${url}` : url;
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
    set((state) => {
      try {
        console.debug("addToPending called for", product && product.id);
      } catch (e) {
        // Ignore debug errors
      }
      const instanceId = Date.now() + Math.random();
      const productWithInstance = {
        ...product,
        _instanceId: instanceId,
      };

      // Capture any existing edits for this product
      const productEdits = state.productEdits[product.id];
      if (productEdits) {
        state.pendingEdits[instanceId] = {
          elements: productEdits.elements || [],
          configuration: productEdits.configuration || {},
        };
      }

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
        pendingEdits: state.pendingEdits,
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
        pendingEdits: state.pendingEdits,
      };
    });
  },
  savePendingAsPdf: () => {
    const state = get();
    let products = Array.isArray(state.pendingPdfCollection)
      ? state.pendingPdfCollection.filter(Boolean)
      : [];
    if (products.length === 0) {
      get().showToast("No products available for PDF export.");
      return;
    }
    try {
      console.debug(
        "savePendingAsPdf called, products:",
        products && products.length,
      );
    } catch (e) {
      // Ignore debug errors
    }

    // Enhance products with their edits from productEdits store
    products = products.map((product) => {
      const edits = state.productEdits[product.id] || product.edits || null;
      const normalized = normalizeProduct(product, edits);
      return {
        ...normalized,
        edits: edits
          ? {
              elements: edits.elements || [],
              configuration: edits.configuration || {},
            }
          : null,
      };
    });

    // Get project name if available (from the first product or pending collection metadata)
    const projectName = state.pendingPdfCollectionProjectName || null;

    // Create PDF configuration entry
    const pdfConfig = {
      id: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description:
        products.length === 1
          ? `${products[0].name} Configuration`
          : `${products.length} Products Configuration`,
      date: new Date().toLocaleDateString("en-GB"), // DD.MM.YYYY format
      amount: products.length.toString(),
      actions: "Configuration PDF",
      products: products,
      projectName: projectName,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      pdfConfigurations: [...state.pdfConfigurations, pdfConfig],
      toast: {
        open: true,
        message: `PDF configuration saved successfully! ${products.length} product${products.length !== 1 ? "s" : ""} configured.`,
        actionLabel: null,
        onAction: null,
      },
    }));

    try {
      window.dispatchEvent(
        new CustomEvent("generatePdf", { detail: { products, projectName } }),
      );
      try {
        console.debug("generatePdf event dispatched");
      } catch (e) {
        // Ignore debug errors
      }
    } catch (e) {
      // ignore
    }
    // Clear the pending PDF collection after dispatching
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

      // Fetch canvas edits for each product in collection
      const collectWithEdits = await Promise.all(
        collection.map(async (product) => {
          try {
            const editRes = await apiService.canvas.getByProduct(product.id);
            if (editRes?.edit?.canvasData) {
              return {
                ...product,
                edits: {
                  elements: editRes.edit.canvasData || [],
                  configuration: editRes.edit.layoutConfig || {},
                },
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

      set({
        collection: collectWithEdits,
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

      // Fetch canvas edits for all products in all projects
      const projects = await Promise.all(
        raw.map(async (proj) => ({
          id: proj._id,
          name: proj.name,
          products: await Promise.all(
            (proj.products || []).map(async (item) => {
              const p = item.product;
              const normalized = normalizeProduct(p, item.edits || {});

              // Fetch canvas edits if not already present
              let canvasEdits = item.edits || {};
              if (!canvasEdits.elements) {
                try {
                  const editRes = await apiService.canvas.getByProduct(
                    p?._id || p?.id,
                  );
                  if (editRes?.edit?.canvasData) {
                    canvasEdits = {
                      elements: editRes.edit.canvasData || [],
                      configuration: editRes.edit.layoutConfig || {},
                    };
                  }
                } catch (e) {
                  console.error(
                    `Failed to fetch canvas edits for product ${p?._id || p?.id}:`,
                    e,
                  );
                }
              }

              return {
                ...(typeof p === "object" ? normalized : {}),
                id: p?._id ?? p?.id ?? p,
                _instanceId: item.instanceId,
                edits: canvasEdits,
              };
            }),
          ),
          createdAt: proj.createdAt,
        })),
      );

      set({ projects, projectsLoading: false, projectsError: null });
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
        ? localStorage.getItem(USER_TOKEN_KEY)
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
      // Save all pending edits before adding to collection
      const pendingItemsWithEdits = state.pendingCollection.filter(
        (item) => state.pendingEdits[item._instanceId],
      );

      for (const item of pendingItemsWithEdits) {
        const edits = state.pendingEdits[item._instanceId];
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
        ? localStorage.getItem(USER_TOKEN_KEY)
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
        ? localStorage.getItem(USER_TOKEN_KEY)
        : null;
    if (!token) {
      get().showToast("Please log in to duplicate products.");
      return false;
    }
    try {
      const state = get();
      // Get original edits before adding to collection
      const originalEdits = instanceId
        ? state.productEdits[instanceId] || product.edits || null
        : product.edits || null;

      // Add product to collection (creates new instance via API)
      await apiService.collections.add([product.id]);

      // Wait a bit for the API to process
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Fetch updated collection
      const updatedCollection = await get().fetchCollection();

      // Find the newly created instance - get all instances of this product and find the newest
      const productInstances = updatedCollection.filter(
        (item) => item.id === product.id,
      );
      if (productInstances.length === 0) {
        get().showToast("Failed to find duplicated product.");
        return false;
      }

      // Sort by instanceId (newest should have highest timestamp)
      const sortedInstances = productInstances.sort((a, b) => {
        const aId = a._instanceId || "";
        const bId = b._instanceId || "";
        return bId.localeCompare(aId);
      });
      const newInstance = sortedInstances[0];

      // Copy edits to new instance if original had edits
      if (newInstance && originalEdits && originalEdits.elements) {
        const deepCopiedEdits = {
          elements: JSON.parse(JSON.stringify(originalEdits.elements || [])),
          configuration: JSON.parse(
            JSON.stringify(originalEdits.configuration || {}),
          ),
          lastSaved: new Date().toISOString(),
        };

        set((s) => ({
          productEdits: {
            ...s.productEdits,
            [newInstance._instanceId]: deepCopiedEdits,
          },
        }));
      }

      get().showToast(
        "Product duplicated successfully with all edits preserved.",
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
  deleteProject: async (projectId) => {
    try {
      await apiService.projects.remove(projectId);
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

  // Configurator state - isolated per product
  configurator: {
    isOpen: false,
    product: null,
    elements: [], // Canvas elements: {id, type, x, y, width, height, rotation, text, fontSize, color, src, strokeWidth, opacity, fill, stroke, points, ...}
    selectedElementId: null,
    activeTool: "select", // 'select', 'text', 'rectangle', 'circle', 'line', 'pen', 'image', 'icon'
    history: [[]], // For undo/redo - start with empty state
    historyIndex: 0,
    configuration: {
      id: null,
      productId: null,
      isValid: false,
      lastModified: null,
    },
    validationErrors: [],
  },

  // Store edited product configurations per product ID
  productEdits: {}, // { [productId]: { elements: [], configuration: {}, lastSaved: timestamp } }

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

  // Configurator actions
  setProduct: (product) =>
    set((state) => {
      // Load existing edits for this product if available
      const existingEdits = state.productEdits[product?.id];
      const elements = existingEdits?.elements || [];
      return {
        configurator: {
          ...state.configurator,
          product,
          // Reset or load product-specific state
          elements,
          selectedElementId: null,
          activeTool: "select",
          // Initialize history with current state
          history: [JSON.parse(JSON.stringify(elements))],
          historyIndex: 0,
          configuration: {
            ...state.configurator.configuration,
            productId: product?.id,
            id:
              existingEdits?.configuration?.id ||
              `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isValid: existingEdits?.configuration?.isValid || false,
            lastModified: existingEdits?.configuration?.lastModified || null,
          },
          validationErrors: [],
        },
      };
    }),

  // Save product edits (isolated per product)
  saveProductEdits: (productId) =>
    set((state) => {
      if (!productId || !state.configurator.product) return state;

      const edits = {
        elements: [...state.configurator.elements],
        configuration: { ...state.configurator.configuration },
        lastSaved: new Date().toISOString(),
      };

      // Save to backend via API
      apiService.canvas
        .save({
          productId,
          canvasData: edits.elements,
          textOverlays: edits.elements.filter((el) => el.type === "text"),
          layoutConfig: edits.configuration,
        })
        .catch((err) => {
          console.error("Failed to save product edits to backend:", err);
        });

      return {
        productEdits: {
          ...state.productEdits,
          [productId]: edits,
        },
      };
    }),

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
        selectedElementId: null, // Clear selection when switching tools
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
    return set((state) => ({
      configurator: {
        ...state.configurator,
        elements: state.configurator.elements.filter((elem) => elem.id !== id),
        selectedElementId:
          state.configurator.selectedElementId === id
            ? null
            : state.configurator.selectedElementId,
      },
    }));
  },
  selectElement: (id) =>
    set((state) => ({
      configurator: {
        ...state.configurator,
        selectedElementId: id,
      },
    })),
  clearSelection: () =>
    set((state) => ({
      configurator: {
        ...state.configurator,
        selectedElementId: null,
      },
    })),
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
        selectedElementIds: elementIds,
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
  // UI helpers for PDF button visibility
  addProductsToPdf: (products, projectName = null) => {
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
    const existingIds = new Set(
      (state.pendingPdfCollection || []).map((p) => p.id),
    );
    const toAdd = eligible.filter((p) => p.id && !existingIds.has(p.id));
    if (toAdd.length === 0) {
      get().showToast("Selected products are already in PDF configuration.");
      return 0;
    }
    set({
      pendingPdfCollection: [...state.pendingPdfCollection, ...toAdd],
      pendingPdfCollectionProjectName:
        projectName || state.pendingPdfCollectionProjectName,
    });
    return toAdd.length;
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
}));

export default useStore;
