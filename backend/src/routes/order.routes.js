import express from "express";
import { requireAuth, allowRoles } from "../middleware/auth.js";

import {
  placeOrder,
  getMyOrders,
  getOwnerOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderById,
} from "../controllers/order.controller.js";

const router = express.Router();

// --------------------------------------------
// CUSTOMER: PLACE ORDER
// --------------------------------------------
router.post("/", requireAuth, allowRoles("customer"), placeOrder);

// --------------------------------------------
// CUSTOMER: VIEW MY ORDERS
// --------------------------------------------
router.get("/my-orders", requireAuth, allowRoles("customer"), getMyOrders);

// --------------------------------------------
// OWNER: VIEW ORDERS OF THEIR BAKERY
// --------------------------------------------
router.get("/owner-orders", requireAuth, allowRoles("owner"), getOwnerOrders);

// --------------------------------------------
// OWNER: UPDATE ORDER STATUS
// --------------------------------------------
router.put("/status/:id", requireAuth, allowRoles("owner"), updateOrderStatus);

// --------------------------------------------
// OWNER: UPDATE PAYMENT STATUS
// --------------------------------------------
router.put(
  "/update-payment/:id",
  requireAuth,
  allowRoles("owner"),
  updatePaymentStatus
);

// --------------------------------------------
// TRACK ORDER (Customer + Owner allowed)
// --------------------------------------------
router.get(
  "/:id",
  requireAuth,
  allowRoles("customer", "owner"), // ⭐ FIXED LINE
  getOrderById
);

export default router;
