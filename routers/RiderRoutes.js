import express from "express";
import { getRiderById } from "../controllers/RiderController.js";

const router = express.Router();

// GET /rider/:id
router.get("/:id", getRiderById);

export default router;
