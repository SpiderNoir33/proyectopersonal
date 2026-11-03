import { Router } from "express";
import {
  getAllUsers,
  updateMe,
  deleteMe,
} from "../controllers/userController.js";
import { protect, restrictTo } from "../middlewares/auth.js";
import { updateMeSchema } from "../../../shared/schemas/user.js";
import { validate } from "../middlewares/validate.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.use(apiLimiter, protect);

router.get("/", restrictTo("admin"), getAllUsers);
router.patch("/me", validate(updateMeSchema), updateMe);
router.delete("/me", deleteMe);

export default router;
