import axios from "axios";

export const USER_TOKEN_KEY = "wireeo_user_token";
export const ADMIN_TOKEN_KEY = "wireeo_admin_token";


export const API_BASE_URL =
  import.meta.env.PROD
    ? (import.meta.env.VITE_API_URL || "https://wireeo.com/api")
    : (import.meta.env.VITE_API_URL || "http://localhost:5000/api");

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
  if (!imagePath || typeof imagePath !== 'string') return '';

  // Already absolute URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // In production, images are served under /api/uploads
  // In development, images are served under /uploads
  if (path.startsWith('/uploads/')) {
    return import.meta.env.PROD
      ? `${IMAGE_BASE_URL}${path}`
      : `${API_ORIGIN}${path}`;
  }

  return `${API_ORIGIN}${path}`;
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
  withBearerToken(() => localStorage.getItem(USER_TOKEN_KEY))
);

const adminApi = axios.create({ baseURL: API_BASE_URL, timeout: 20000 });
adminApi.interceptors.request.use(
  withBearerToken(() => localStorage.getItem(ADMIN_TOKEN_KEY))
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
    list: async (params) => unwrap(await publicApi.get("/products", { params })),
    listConfigurable: async (params) =>
      unwrap(await publicApi.get("/products/configurable", { params })),
    listNormal: async (params) =>
      unwrap(await publicApi.get("/products/normal", { params })),
    getById: async (id) => unwrap(await publicApi.get(`/products/${id}`)),
    create: async (payload, config) =>
      unwrap(await adminApi.post("/products", payload, config)),
    update: async (id, payload, config) =>
      unwrap(await adminApi.patch(`/products/${id}`, payload, config)),
    remove: async (id) => unwrap(await adminApi.delete(`/products/${id}`)),
  },

  collections: {
    getMine: async () => unwrap(await userApi.get("/collections")),
    add: async (productIds) =>
      unwrap(await userApi.post("/collections/add", { productIds })),
    removeItem: async (instanceId) =>
      unwrap(await userApi.delete(`/collections/${instanceId}`)),
  },

  projects: {
    list: async () => unwrap(await userApi.get("/projects")),
    getById: async (id) => unwrap(await userApi.get(`/projects/${id}`)),
    create: async ({ name, products }) =>
      unwrap(await userApi.post("/projects", { name, products })),
    addProducts: async ({ projectId, products }) =>
      unwrap(await userApi.post("/projects/add-products", { projectId, products })),
    addFromCollection: async ({ projectId, projectName, instanceIds }) =>
      unwrap(
        await userApi.post("/projects/add-from-collection", {
          projectId,
          projectName,
          instanceIds,
        })
      ),
    updateName: async (id, name) =>
      unwrap(await userApi.patch(`/projects/${id}/name`, { name })),
    remove: async (id) => unwrap(await userApi.delete(`/projects/${id}`)),
  },

  canvas: {
    save: async ({ productId, canvasData, textOverlays, layoutConfig }) =>
      unwrap(
        await userApi.post("/canvas/save", {
          productId,
          canvasData,
          textOverlays,
          layoutConfig,
        })
      ),
    getByProduct: async (productId) =>
      unwrap(await userApi.get(`/canvas/product/${productId}`)),
    saveInstance: async ({ instanceId, productId, canvasData, textOverlays, layoutConfig, editedImage }) =>
      unwrap(
        await userApi.post("/canvas/instance/save", {
          instanceId,
          productId,
          canvasData,
          textOverlays,
          layoutConfig,
          editedImage,
        })
      ),
    getByInstance: async (instanceId) =>
      unwrap(await userApi.get(`/canvas/instance/${instanceId}`)),
  },

  pdf: {
    create: async ({ projectId, projectName, productCount, products, pdfSettings }) =>
      unwrap(await userApi.post("/pdf", { projectId, projectName, productCount, products, pdfSettings })),
    list: async () => unwrap(await userApi.get("/pdf")),
    getById: async (id) => unwrap(await userApi.get(`/pdf/${id}`)),
    updateLastExported: async (id) =>
      unwrap(await userApi.patch(`/pdf/${id}/last-exported`)),
    reExport: async (id) =>
      unwrap(await userApi.put(`/pdf/${id}/re-export`)),
  },

  adminDashboard: {
    stats: async () => unwrap(await adminApi.get("/admin/dashboard/stats")),
  },
};

export default publicApi;
