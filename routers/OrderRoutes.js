import express from "express";
import { placeOrderController } from "../controllers/OrderController.js";

const router = express.Router();

// POST /api/orders/place
router.post("/place", placeOrderController);

export default router;
