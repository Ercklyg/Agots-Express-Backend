import express from "express";
import { placeOrder } from "../controllers/OrderController.js";

const router = express.Router();

router.post("/orders", placeOrder);

export default router;
