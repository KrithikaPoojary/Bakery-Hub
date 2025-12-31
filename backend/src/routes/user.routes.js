import express from "express";
import {
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", requireAuth, getMe);
router.put("/update-profile", requireAuth, updateProfile);
router.put("/change-password", requireAuth, changePassword);

export default router;
