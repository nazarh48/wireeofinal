import axios from "axios";

export const USER_TOKEN_KEY = "wireeo_user_token";
export const ADMIN_TOKEN_KEY = "wireeo_admin_token";


export const API_BASE_URL =
  import.meta.env.PROD
    ? (import.meta.env.VITE_API_URL || "/api")
    : (import.meta.env.VITE_API_URL || "http://localhost:5000/api");


export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

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
