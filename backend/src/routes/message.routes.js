import express from "express";
import {
  sendMessage,
  getMessages,
  markAsRead,
  replyToMessage,
  resolveMessage,
} from "../controllers/message.controller.js";
import { requireAuth, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// Public user can send message
router.post("/", sendMessage);

// Admin endpoints
router.get("/", requireAuth, allowRoles("admin"), getMessages);
router.put("/:id/read", requireAuth, allowRoles("admin"), markAsRead);
router.put("/:id/reply", requireAuth, allowRoles("admin"), replyToMessage);
router.put("/:id/resolve", requireAuth, allowRoles("admin"), resolveMessage);

export default router;
