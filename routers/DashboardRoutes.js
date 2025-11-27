import express from "express";
import {
  getDashboardStats,
  getOrdersByHour,
  getRecentOrders,
  getSalesByDay,
} from "../controllers/DashboardController.js";

const router = express.Router();

// Dashboard stats
router.get("/stats", getDashboardStats);

// Recent orders
router.get("/recent-orders", getRecentOrders);

// Orders chart
router.get("/orders-by-hour", getOrdersByHour);

// Sales chart
router.get("/sales-weekly", getSalesByDay);

export default router;
