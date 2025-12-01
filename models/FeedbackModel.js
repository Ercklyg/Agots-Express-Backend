import pool from "../config/db.js";

// Get all feedback with customer info and optional response
export const getAllFeedback = async () => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        f.id AS feedback_id,
        f.customer_id,
        f.order_id,
        f.rating,
        f.comment AS feedback_comment,
        f.created_at AS feedback_created_at,
        u.username AS customer_name,
        u.email AS customer_email,
        r.id AS response_id,
        r.responder_id,
        r.response AS response_text,
        r.created_at AS response_created_at
      FROM feedback f
      JOIN users u ON f.customer_id = u.id
      LEFT JOIN feedback_responses r ON f.id = r.feedback_id
      ORDER BY f.created_at DESC
    `);
    return rows;
  } catch (err) {
    console.error("Error fetching feedback:", err.message);
    throw err;
  }
};

// Get average rating (SQL) for consistency
export const getAverageRating = async () => {
  try {
    const [[row]] = await pool.query(`
      SELECT COALESCE(AVG(rating),0) AS avg_rating
      FROM feedback
    `);
    return row;
  } catch (err) {
    console.error("Error fetching average rating:", err.message);
    throw err;
  }
};

// Add or update a feedback response
export const addOrUpdateFeedbackResponse = async (
  feedback_id,
  responder_id,
  response
) => {
  if (!feedback_id || !responder_id || !response) {
    throw new Error(
      "Feedback ID, responder ID, and response text are required"
    );
  }

  try {
    const [existing] = await pool.query(
      `SELECT id FROM feedback_responses WHERE feedback_id = ?`,
      [feedback_id]
    );

    if (existing.length > 0) {
      await pool.query(
        `UPDATE feedback_responses SET responder_id = ?, response = ?, created_at = NOW() WHERE feedback_id = ?`,
        [responder_id, response, feedback_id]
      );
      return { feedback_id, responder_id, response, updated: true };
    } else {
      const [result] = await pool.query(
        `INSERT INTO feedback_responses (feedback_id, responder_id, response) VALUES (?, ?, ?)`,
        [feedback_id, responder_id, response]
      );
      return {
        id: result.insertId,
        feedback_id,
        responder_id,
        response,
        updated: false,
      };
    }
  } catch (err) {
    console.error("Error adding/updating feedback response:", err.message);
    throw new Error("Failed to add or update feedback response");
  }
};
