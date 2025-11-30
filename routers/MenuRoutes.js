
import express from "express";
import {
  createMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
} from "../controllers/MenuController.js";

const router = express.Router();

// Routes for managing menu items
router.post("/menu", createMenuItem); // Create a new menu item
router.get("/menu", getAllMenuItems); // Get all menu items
router.get("/menu/:id", getMenuItemById); // Get a single menu item by ID
router.put("/menu/:id", updateMenuItem); // Update a menu item by ID
router.delete("/menu/:id", deleteMenuItem); // Delete a menu item by ID

export default router;
