import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

const isTest = env.NODE_ENV === "test";

const jsonHandler = (message) => (req, res) => {
  res.status(429).json({
    status: "fail",
    message,
  });
};

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler(
    "Demasiados intentos de inicio de sesión, intenta en 15 minutos"
  ),
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 10000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Demasiadas peticiones, intenta en 15 minutos"),
});
