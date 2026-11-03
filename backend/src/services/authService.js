import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";

const cookieMs = () => {
  const days = parseFloat(env.COOKIE_EXPIRES_IN.replace("d", ""));
  return Math.floor(days * 24 * 60 * 60 * 1000);
};

const deniedTokens = new Map();

const cleanDenied = () => {
  const now = Date.now();
  for (const [jti, expiresAt] of deniedTokens) {
    if (expiresAt <= now) deniedTokens.delete(jti);
  }
};

export const signToken = (userId) =>
  jwt.sign({ id: userId, jti: crypto.randomUUID() }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

export const denyToken = (decoded) => {
  if (!decoded?.jti) return;
  deniedTokens.set(decoded.jti, (decoded.exp ?? 0) * 1000);
  cleanDenied();
};

export const isTokenDenied = (decoded) => {
  if (!decoded?.jti) return false;
  cleanDenied();
  return deniedTokens.has(decoded.jti);
};

export const sendCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: cookieMs(),
  });
};

export const clearCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
};
