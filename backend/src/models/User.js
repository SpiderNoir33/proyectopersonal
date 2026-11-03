import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { EMAIL_REGEX, EMAIL_MSG } from "../../../shared/schemas/auth.js";

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [80, "Máximo 80 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, EMAIL_MSG],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [8, "Mínimo 8 caracteres"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (!this.passwordChangedAt) return false;
  const changedAt = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return changedAt > jwtTimestamp;
};

export const User = mongoose.model("User", userSchema);