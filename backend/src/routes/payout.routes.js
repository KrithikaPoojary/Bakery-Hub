import express from "express";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import {
  getPendingPayouts,
  getAllPayouts,
  createPayout,
  processPayout,
  getMyPayouts,
  getCompletedOrdersForPayout,
} from "../controllers/payout.controller.js";

const router = express.Router();

// ADMIN: Get completed orders ready for payout
router.get(
  "/completed-orders",
  requireAuth,
  allowRoles("admin"),
  getCompletedOrdersForPayout
);

// ADMIN: Get all payouts
router.get("/", requireAuth, allowRoles("admin"), getAllPayouts);

// ADMIN: Get pending payouts
router.get(
  "/pending",
  requireAuth,
  allowRoles("admin"),
  getPendingPayouts
);

// ADMIN: Create payout
router.post("/", requireAuth, allowRoles("admin"), createPayout);

// ADMIN: Process payout
router.put("/:id/process", requireAuth, allowRoles("admin"), processPayout);

// OWNER: Get my payouts
router.get("/mine", requireAuth, allowRoles("owner"), getMyPayouts);

export default router;

