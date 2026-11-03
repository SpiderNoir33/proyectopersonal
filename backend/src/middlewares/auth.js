import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { isTokenDenied } from "../services/authService.js";

export const protect = catchAsync(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return next(new AppError("No autenticado", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch {
    return next(new AppError("Token inválido o expirado, vuelve a iniciar sesión", 401));
  }

  if (isTokenDenied(decoded)) {
    return next(new AppError("Sesión cerrada, vuelve a iniciar sesión", 401));
  }

  const user = await User.findById(decoded.id).select("+password");

  if (!user || !user.active) {
    return next(new AppError("El usuario de este token ya no existe", 401));
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("Cambiaste tu contraseña, inicia sesión de nuevo", 401));
  }

  req.user = user;
  next();
});

export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("No tienes permisos para esta acción", 403));
  }
  next();
};
