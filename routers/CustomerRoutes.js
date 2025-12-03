import express from "express";
import {
  getCustomerById,
  updateCustomerProfile,
  getCustomerOrders,
  getCustomerOrderHistory,
  getCustomerStats,
  getOrderFeedback,
  submitFeedback,
} from "../controllers/CustomerController.js";

const router = express.Router();

// Profile
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomerProfile);

// Orders
router.get("/orders/:id", getCustomerOrders);
router.get("/orders/:id/history", getCustomerOrderHistory);

// Stats
router.get("/stats/:id", getCustomerStats);

// Feedback
router.get("/feedback/:id", getOrderFeedback); // ?orderId=123
router.post("/feedback/:id", submitFeedback);

export default router;
