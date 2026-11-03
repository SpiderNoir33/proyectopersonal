import api from "./axios.js";

// Devuelve solo {id, nombre} (el backend filtra el resto: sin email/rol).
export const getSeller = (id) =>
  api.get(`/sellers/${encodeURIComponent(id)}`);
