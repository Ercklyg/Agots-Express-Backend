import pool from "../config/db.js";

// Get all announcements
export const getAllAnnouncements = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM announcements ORDER BY date DESC, created_at DESC"
    );
    return rows;
  } catch (err) {
    console.error("Error fetching announcements:", err);
    throw new Error("Failed to fetch announcements");
  }
};

// Get announcement by ID
export const getAnnouncementById = async (id) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM announcements WHERE id = ?",
      [id]
    );
    return rows[0];
  } catch (err) {
    console.error("Error fetching announcement by ID:", err);
    throw new Error("Failed to fetch announcement");
  }
};

// Add a new announcement
export const addAnnouncement = async (title, type, content, date) => {
  if (!title || !type || !content || !date) {
    throw new Error("All fields are required");
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO announcements (title, type, content, date) VALUES (?, ?, ?, ?)",
      [title, type, content, date]
    );

    return { id: result.insertId, title, type, content, date };
  } catch (err) {
    console.error("Error inserting announcement:", err);
    throw new Error("Failed to create announcement");
  }
};

// Update an existing announcement
export const updateAnnouncement = async (id, data) => {
  const { title, type, content, date } = data;
  if (!title || !type || !content || !date) {
    throw new Error("All fields are required");
  }

  try {
    const [result] = await pool.query(
      "UPDATE announcements SET title = ?, type = ?, content = ?, date = ? WHERE id = ?",
      [title, type, content, date, id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error updating announcement:", err);
    throw new Error("Failed to update announcement");
  }
};

// Delete announcement
export const deleteAnnouncement = async (id) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM announcements WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error deleting announcement:", err);
    throw new Error("Failed to delete announcement");
  }
};
