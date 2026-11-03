import { Router } from "express";
import { getSeller } from "../controllers/sellerController.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

router.use(apiLimiter);

router.get("/:id", getSeller);

export default router;
