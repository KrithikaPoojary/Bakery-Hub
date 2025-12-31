import express from "express";
import { getMenuByBakery } from "../controllers/menu.controller.js";

const router = express.Router();

// customer: get menu for bakery
router.get("/bakery/:id", getMenuByBakery);

export default router;
