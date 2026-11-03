import api from "./axios.js";

export const list = () => api.get("/users");
export const updateMe = (data) => api.patch("/users/me", data);
export const deleteMe = () => api.delete("/users/me");
