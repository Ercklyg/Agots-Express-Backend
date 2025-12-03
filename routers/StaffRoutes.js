import express from "express";
import {
  assignRider,
  changeOrderStatus,
  getActiveOrders,
  getDashboardStats,
} from "../controllers/StaffController.js";

const router = express.Router();

// Dashboard
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/orders", getActiveOrders);

// Update order status
router.patch("/orders/:id/status", changeOrderStatus);

// Assign rider
router.patch("/orders/:id/assign", assignRider);

export default router;
