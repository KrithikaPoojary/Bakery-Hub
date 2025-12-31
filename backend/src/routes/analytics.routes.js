import express from "express";
import { requireAuth, allowRoles } from "../middleware/auth.js";
import { getOwnerAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/owner", requireAuth, allowRoles("owner"), getOwnerAnalytics);

export default router;
