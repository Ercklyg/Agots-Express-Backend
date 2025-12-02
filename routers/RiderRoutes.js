import express from "express";
import {
  acceptDelivery,
  completeDelivery,
  getOrdersByRiderId,
  getRiderById,
  getRiderStats,
} from "../controllers/RiderController.js";

const router = express.Router();

// Rider Info
router.get("/:id", getRiderById);

// Rider Deliveries
router.get("/:id/orders", getOrdersByRiderId);
//gdgd
// Rider Stats
router.get("/:id/stats", getRiderStats);

// Delivery Actions
router.patch("/:id/orders/:orderId/accept", acceptDelivery);
router.patch("/:id/orders/:orderId/complete", completeDelivery);

export default router;
