import express from "express";
import { getStats } from "../controllers/StatsController.js";

const router = express.Router();

// GET /stats → for dashboard stats
router.get("/", getStats);

export default router;
