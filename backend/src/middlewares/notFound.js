import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const notFound = (req, res, next) => {
  
  if (req.originalUrl === "/favicon.ico") {
    return res.status(204).end();
  }

  if (env.NODE_ENV === "development") {
    console.log(`404 -> ${req.method} ${req.originalUrl}`);
  }

  next(new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404));
};
