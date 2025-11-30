import express from "express";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
} from "../controllers/AnnouncementController.js";

const router = express.Router();

// Routes
router.get("/", getAllAnnouncements); // Get all announcements
router.get("/:id", getAnnouncementById); // Get announcement by ID
router.post("/", createAnnouncement); // Create announcement
router.put("/:id", updateAnnouncement); // Update announcement
router.delete("/:id", deleteAnnouncement); // Delete announcement

export default router;
