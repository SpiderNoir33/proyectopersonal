import { Router } from "express";
import { register, login, logout, me } from "../controllers/authController.js";
import { registerSchema, loginSchema } from "../../../shared/schemas/auth.js";
import { validate } from "../middlewares/validate.js";
import { protect } from "../middlewares/auth.js";
import { loginLimiter, apiLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.post("/register", loginLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/logout", apiLimiter, logout);
router.get("/me", apiLimiter, protect, me);

export default router;
