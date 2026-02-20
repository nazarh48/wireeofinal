import axios from "axios";

export const USER_TOKEN_KEY = "wireeo_user_token";
export const ADMIN_TOKEN_KEY = "wireeo_admin_token";

// Dev: "/api" uses Vite proxy to backend (localhost:5000). Prod: VITE_API_URL or production URL.
export const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? "https://wireeo.com/api" : "/api");

/** Origin (no /api) – for same-origin requests. */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

/** Base URL for image paths. When deployed, proxy often forwards only /api, so images must be under /api/uploads. */
export const IMAGE_BASE_URL = API_BASE_URL.replace(/\/?$/, "");

/**
 * Converts a relative image path to an absolute URL.
 * Handles both /uploads paths and other relative paths.
 * This ensures images work correctly in both development and production.
 *
 * @param {string} imagePath - Relative image path (e.g., /uploads/products/image.jpg)
 * @returns {string} - Absolute image URL
 *
 * @example
 * // Development: http://localhost:5000/uploads/products/image.jpg
 * // Production: https://wireeo.com/api/uploads/products/image.jpg
 * getImageUrl('/uploads/products/image.jpg')
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== "string") return "";

  // Already absolute URL
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  // In production, images are served under /api/uploads
  // In development, images are also served under /api/uploads (backend serves both /uploads and /api/uploads)
  if (path.startsWith("/uploads/")) {
    // Always use /api/uploads in both dev and prod for consistency
    return `${IMAGE_BASE_URL}${path}`;
  }

  return `${API_ORIGIN}${path}`;
};

/**
 * Resolve the main image URL for a solution (list or detail).
 * Matches admin logic: prefer first image in images[], then solution.image.
 * Ensures relative paths are in /uploads/ form so getImageUrl works.
 */
export const getSolutionImageUrl = (solution) => {
  if (!solution) return "";
  const raw =
    (Array.isArray(solution.images) && solution.images[0]
      ? (solution.images[0].url ?? solution.images[0])
      : null) || (solution.image && String(solution.image).trim()) || "";
  if (!raw || typeof raw !== "string") return "";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:"))
    return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  const uploadsPath = path.startsWith("/uploads/")
    ? path
    : path.startsWith("/solutions/")
      ? `/uploads${path}`
      : `/uploads/solutions/${path.replace(/^\/+/, "")}`;
  return getImageUrl(uploadsPath);
};

function withBearerToken(getToken) {
  return (cfg) => {
    const token = getToken();
    if (token) {
      cfg.headers = cfg.headers || {};
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  };
}

const publicApi = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });

const userApi = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });
userApi.interceptors.request.use(
  withBearerToken(() => localStorage.getItem(USER_TOKEN_KEY)),
);

const adminApi = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });
adminApi.interceptors.request.use(
  withBearerToken(() => localStorage.getItem(ADMIN_TOKEN_KEY)),
);

function unwrap(res) {
  return res?.data;
}

export const apiService = {
  auth: {
    register: async ({ name, email, password }) =>
      unwrap(await publicApi.post("/auth/register", { name, email, password })),
    login: async ({ email, password }) =>
      unwrap(await publicApi.post("/auth/login", { email, password })),
    adminLogin: async ({ email, password }) =>
      unwrap(await publicApi.post("/auth/admin/login", { email, password })),
    verifyEmail: async (token) =>
      unwrap(await publicApi.post("/auth/verify-email", { token })),
    resendVerification: async (email) =>
      unwrap(await publicApi.post("/auth/resend-verification", { email })),
    verify2FA: async ({ email, code }) =>
      unwrap(await publicApi.post("/auth/verify-2fa", { email, code })),
    resend2FA: async (email) =>
      unwrap(await publicApi.post("/auth/resend-2fa", { email })),
    forgotPassword: async (email) =>
      unwrap(await publicApi.post("/auth/forgot-password", { email })),
    resetPassword: async ({ token, password }) =>
      unwrap(await publicApi.post("/auth/reset-password", { token, password })),
  },

  users: {
    list: async () => unwrap(await adminApi.get("/users")),
    count: async () => unwrap(await adminApi.get("/users/count")),
  },

  ranges: {
    list: async (params) => unwrap(await publicApi.get("/ranges", { params })),
    getById: async (id) => unwrap(await publicApi.get(`/ranges/${id}`)),
    create: async (payload) => unwrap(await adminApi.post("/ranges", payload)),
    update: async (id, payload) =>
      unwrap(await adminApi.patch(`/ranges/${id}`, payload)),
    remove: async (id) => unwrap(await adminApi.delete(`/ranges/${id}`)),
  },

  products: {
    list: async (params) =>
      unwrap(await publicApi.get("/products", { params })),
    listConfigurable: async (params) =>
      unwrap(await publicApi.get("/products/configurable", { params })),
    listNormal: async (params) =>
      unwrap(await publicApi.get("/products/normal", { params })),
    listFeatured: async () => unwrap(await publicApi.get("/products/featured")),
    getById: async (id) => unwrap(await publicApi.get(`/products/${id}`)),
    create: async (payload, config) =>
      unwrap(await adminApi.post("/products", payload, config)),
    update: async (id, payload, config) =>
      unwrap(await adminApi.patch(`/products/${id}`, payload, config)),
    remove: async (id) => unwrap(await adminApi.delete(`/products/${id}`)),
  },

  categories: {
    list: async (params) =>
      unwrap(await publicApi.get("/categories", { params })),
    getById: async (id) => unwrap(await publicApi.get(`/categories/${id}`)),
    create: async (payload, config) =>
      unwrap(await adminApi.post("/categories", payload, config)),
    update: async (id, payload, config) =>
      unwrap(await adminApi.patch(`/categories/${id}`, payload, config)),
    remove: async (id) => unwrap(await adminApi.delete(`/categories/${id}`)),
  },

  solutions: {
    list: async (params) =>
      unwrap(await publicApi.get("/solutions", { params })),
    getById: async (id) => unwrap(await publicApi.get(`/solutions/${id}`)),
    getBySlug: async (slug) =>
      unwrap(await publicApi.get(`/solutions/slug/${slug}`)),
    create: async (payload, config) =>
      unwrap(await adminApi.post("/solutions", payload, config)),
    update: async (id, payload, config) =>
      unwrap(await adminApi.patch(`/solutions/${id}`, payload, config)),
    remove: async (id) => unwrap(await adminApi.delete(`/solutions/${id}`)),
  },

  pdfMaterials: {
    list: async (params) =>
      unwrap(await publicApi.get("/pdf-materials", { params })),
    getById: async (id) => unwrap(await publicApi.get(`/pdf-materials/${id}`)),
    create: async (payload, config) =>
      unwrap(await adminApi.post("/pdf-materials", payload, config)),
    update: async (id, payload, config) =>
      unwrap(await adminApi.patch(`/pdf-materials/${id}`, payload, config)),
    remove: async (id) => unwrap(await adminApi.delete(`/pdf-materials/${id}`)),
  },

  collections: {
    getMine: async () => unwrap(await userApi.get("/collections")),
    add: async (productIds) =>
      unwrap(await userApi.post("/collections/add", { productIds })),
    duplicateItem: async (instanceId) =>
      unwrap(await userApi.post(`/collections/${encodeURIComponent(instanceId)}/duplicate`)),
    removeItem: async (instanceId) =>
      unwrap(await userApi.delete(`/collections/${instanceId}`)),
  },

  projects: {
    list: async () => unwrap(await userApi.get("/projects")),
    getById: async (id) => unwrap(await userApi.get(`/projects/${id}`)),
    create: async ({ name, products }) =>
      unwrap(await userApi.post("/projects", { name, products })),
    addProducts: async ({ projectId, products }) =>
      unwrap(
        await userApi.post("/projects/add-products", { projectId, products }),
      ),
    addFromCollection: async ({ projectId, projectName, instanceIds }) =>
      unwrap(
        await userApi.post("/projects/add-from-collection", {
          projectId,
          projectName,
          instanceIds,
        }),
      ),
    removeProduct: async ({ projectId, instanceId }) =>
      unwrap(await userApi.delete(`/projects/${projectId}/products/${encodeURIComponent(instanceId)}`)),
    updateName: async (id, name) =>
      unwrap(await userApi.patch(`/projects/${id}/name`, { name })),
    remove: async (id) => unwrap(await userApi.delete(`/projects/${id}`)),
  },

  canvas: {
    save: async ({ productId, canvasData, textOverlays, layoutConfig }) =>
      unwrap(
        await userApi.put("/canvas/save", {
          productId,
          canvasData,
          textOverlays,
          layoutConfig,
        }),
      ),
    getByProduct: async (productId) =>
      unwrap(await userApi.get(`/canvas/product/${productId}`)),
    saveInstance: async ({
      instanceId,
      productId,
      canvasData,
      textOverlays,
      layoutConfig,
      editedImage,
    }) =>
      unwrap(
        await userApi.put("/canvas/instance/save", {
          instanceId,
          productId,
          canvasData,
          textOverlays,
          layoutConfig,
          editedImage,
        }),
      ),
    getByInstance: async (instanceId) =>
      unwrap(await userApi.get(`/canvas/instance/${instanceId}`)),
  },

  pdf: {
    create: async ({
      projectId,
      projectName,
      productCount,
      products,
      pdfSettings,
    }) =>
      unwrap(
        await userApi.post("/pdf", {
          projectId,
          projectName,
          productCount,
          products,
          pdfSettings,
        }),
      ),
    list: async () => unwrap(await userApi.get("/pdf")),
    getById: async (id) => unwrap(await userApi.get(`/pdf/${id}`)),
    updateLastExported: async (id) =>
      unwrap(await userApi.patch(`/pdf/${id}/last-exported`)),
    reExport: async (id) => unwrap(await userApi.put(`/pdf/${id}/re-export`)),
  },

  adminDashboard: {
    stats: async () => unwrap(await adminApi.get("/admin/dashboard/stats")),
  },

  newsletter: {
    subscribe: async (email, source) =>
      unwrap(await publicApi.post("/newsletter/subscribe", { email, source: source || "resources" })),
    listSubscribers: async () => unwrap(await adminApi.get("/newsletter/subscribers")),
  },
};

export default publicApi;
