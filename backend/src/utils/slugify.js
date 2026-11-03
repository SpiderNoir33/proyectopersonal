import crypto from "node:crypto";

export const slugify = (text) => {
  const base = String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return base || "producto";
};

export const randomSlugSuffix = () =>
  crypto.randomBytes(6).toString("base64url");
