import { Router } from "express";
import {
  getProducts,
  getMyProducts,
  getProductByName,
  getProductBySlugId,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from "../../../shared/schemas/product.js";
import { protect } from "../middlewares/auth.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import { apiLimiter } from "../middlewares/rateLimiter.js";
import { uploadProductImages } from "../middlewares/upload.js";
import { validateImages } from "../middlewares/validateImages.js";

const router = Router();

router.use(apiLimiter);

router.get("/", validateQuery(listProductsQuerySchema), getProducts);
router.get("/mine", protect, getMyProducts);
router.get("/name/:nombre", getProductByName);
router.get("/:slug/:id", getProductBySlugId);
router.get("/:id", getProductById);

router.post(
  "/",
  protect,
  uploadProductImages,
  validateImages,
  validate(createProductSchema),
  createProduct
);
router.patch(
  "/:id",
  protect,
  uploadProductImages,
  validateImages,
  validate(updateProductSchema),
  updateProduct
);
router.delete("/:id", protect, deleteProduct);

export default router;
