import api from "./axios.js";

export const list = (params = {}) => api.get("/products", { params });
export const mine = () => api.get("/products/mine");
export const getById = (id) => api.get(`/products/${id}`);
export const getBySlugId = (slug, id) =>
  api.get(`/products/${encodeURIComponent(slug)}/${encodeURIComponent(id)}`);
export const create = (data) => api.post("/products", data);
export const update = (id, data) => api.patch(`/products/${id}`, data);
export const remove = (id) => api.delete(`/products/${id}`);
