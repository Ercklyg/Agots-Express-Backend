import express from "express";
import multer from "multer";
import path from "path";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getMenuItemById,
} from "../controllers/MenuController.js";

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/menu/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.post("/menu", upload.single("image"), createMenuItem);
router.put("/menu/:id", upload.single("image"), updateMenuItem);
router.get("/menu", getAllMenuItems);
router.get("/menu/:id", getMenuItemById);
router.delete("/menu/:id", deleteMenuItem);

export default router;
