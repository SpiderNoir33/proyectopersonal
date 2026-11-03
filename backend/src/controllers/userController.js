import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sanitizeUser } from "../utils/sanitize.js";
import { clearCookie } from "../services/authService.js";

export const getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({
    status: "success",
    results: users.length,
    users: users.map(sanitizeUser),
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
  const { nombre, email, password, currentPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (email && email !== user.email) {
    const existing = await User.findOne({
      email,
      _id: { $ne: user._id },
    });
    if (existing) {
      return next(new AppError("Ya existe una cuenta con ese email", 409));
    }
    user.email = email;
  }

  if (nombre) user.nombre = nombre;

  if (password) {
    const ok = await user.comparePassword(currentPassword);
    if (!ok) {
      return next(
        new AppError("La contraseña actual es incorrecta", 400, {
          currentPassword: "La contraseña actual es incorrecta",
        })
      );
    }
    user.password = password;
    user.passwordChangedAt = new Date();
  }

  await user.save();

  res.status(200).json({
    status: "success",
    user: sanitizeUser(user),
  });
});

export const deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  clearCookie(res);
  res.status(204).send();
});
