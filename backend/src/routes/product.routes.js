import express from "express";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import {
  createProduct,
  getProductsByBakery,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// 🧁 Create Product (with image upload)
router.post(
  "/",
  requireAuth,
  allowRoles("owner"),
  upload.single("image"),
  createProduct
);

// 🍰 Get All Products from Bakery
router.get("/:bakeryId", getProductsByBakery);

// ✏️ Update Product (also supports replacing image)
router.put(
  "/:id",
  requireAuth,
  allowRoles("owner"),
  upload.single("image"),
  updateProduct
);

// ❌ Delete Product
router.delete("/:id", requireAuth, allowRoles("owner"), deleteProduct);

export default router;
