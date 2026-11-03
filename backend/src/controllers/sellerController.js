import mongoose from "mongoose";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getSeller = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new AppError("Vendedor no encontrado", 404));
  }

  const seller = await User.findOne({ _id: id, active: true }).select("nombre");

  if (!seller) {
    return next(new AppError("Vendedor no encontrado", 404));
  }

  res.status(200).json({
    status: "success",
    seller: { id: seller._id.toString(), nombre: seller.nombre },
  });
});
