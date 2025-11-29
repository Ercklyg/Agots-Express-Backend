import express from "express";
import {
  getAllOrders,
  getDashboardStats,
  getOrderItems,
  getOrdersByHour,
  getRecentOrders,
  getSalesByDay,
  getAllCustomers,
  updateCustomer,
} from "../controllers/DashboardController.js";

const router = express.Router();

// ------------------------- DASHBOARD STATS -------------------------
router.get("/stats", getDashboardStats);

// ------------------------- ORDERS -------------------------
// Fetch all orders
router.get("/orders", getAllOrders); // NEW
// Recent orders (last 10)
router.get("/recent-orders", getRecentOrders);
// Orders by hour chart
router.get("/orders-by-hour", getOrdersByHour);
// Sales weekly chart
router.get("/sales-weekly", getSalesByDay);
// Fetch items for a specific order
router.get("/order-items/:orderId", getOrderItems);

// ------------------------- CUSTOMERS -------------------------
// Fetch all customers
router.get("/customers", getAllCustomers);
// Update a specific customer
router.put("/customers/:id", updateCustomer);

export default router;
