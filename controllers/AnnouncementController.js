import * as AnnouncementsModel from "../models/AnnouncementModel.js";

// Get all announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await AnnouncementsModel.getAllAnnouncements();
    res.status(200).json(announcements);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch announcements", error: err.message });
  }
};

// Get announcement by ID
export const getAnnouncementById = async (req, res) => {
  const { id } = req.params;
  try {
    const announcement = await AnnouncementsModel.getAnnouncementById(id);
    if (!announcement)
      return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json(announcement);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch announcement", error: err.message });
  }
};

// Create new announcement
export const createAnnouncement = async (req, res) => {
  const { title, type, content, date } = req.body;
  try {
    const newAnnouncement = await AnnouncementsModel.addAnnouncement(
      title,
      type,
      content,
      date
    );
    res.status(201).json(newAnnouncement);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create announcement", error: err.message });
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, type, content, date } = req.body;

  try {
    const updated = await AnnouncementsModel.updateAnnouncement(id, {
      title,
      type,
      content,
      date,
    });
    if (!updated)
      return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json({ id, title, type, content, date });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update announcement", error: err.message });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await AnnouncementsModel.deleteAnnouncement(id);
    if (!deleted)
      return res.status(404).json({ message: "Announcement not found" });
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete announcement", error: err.message });
  }
};
