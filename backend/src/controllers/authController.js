import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sanitizeUser } from "../utils/sanitize.js";
import {
  signToken,
  sendCookie,
  clearCookie,
  denyToken,
} from "../services/authService.js";

const DUMMY_HASH = bcrypt.hashSync("timing-equalizer-not-a-real-password", 10);

export const register = catchAsync(async (req, res, next) => {
  const { nombre, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError("Ya existe una cuenta con ese email", 409));
  }

  const user = await User.create({ nombre, email, password });

  const token = signToken(user._id);
  sendCookie(res, token);

  res.status(201).json({
    status: "success",
    user: sanitizeUser(user),
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  const match = user
    ? await user.comparePassword(password)
    : await bcrypt.compare(password, DUMMY_HASH);

  if (!user || !match) {
    return next(new AppError("Email o contraseña incorrectos", 401));
  }

  if (!user.active) {
    return next(new AppError("Tu cuenta está desactivada", 401));
  }

  const token = signToken(user._id);
  sendCookie(res, token);

  res.status(200).json({
    status: "success",
    user: sanitizeUser(user),
  });
});

export const logout = (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    try {
      denyToken(jwt.verify(token, env.JWT_SECRET));
    } catch {
      // token ilegible o expirado: aun asi se limpia la cookie
    }
  }

  clearCookie(res);
  res.status(200).json({ status: "success", message: "Sesión cerrada" });
};

export const me = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    user: sanitizeUser(req.user),
  });
});
