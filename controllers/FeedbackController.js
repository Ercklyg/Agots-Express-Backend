import * as FeedbackModel from "../models/FeedbackModel.js";

// Fetch all feedback with SQL-calculated average rating
export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await FeedbackModel.getAllFeedback();

    // Get average rating directly from SQL (rounded to 1 decimal)
    const avgRatingObj = await FeedbackModel.getAverageRating();
    const avgRating = Number(avgRatingObj.avg_rating || 0);

    res.status(200).json({ feedback, avgRating });
  } catch (err) {
    console.error("Error fetching feedback:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch feedback", error: err.message });
  }
};

// Respond to a feedback (add or update)
export const respondToFeedback = async (req, res) => {
  const { id } = req.params; // feedback ID
  const { responder_id, response } = req.body;

  try {
    const feedbackResponse = await FeedbackModel.addOrUpdateFeedbackResponse(
      id,
      responder_id,
      response
    );

    res.status(201).json(feedbackResponse);
  } catch (err) {
    console.error("Error responding to feedback:", err.message);
    res
      .status(500)
      .json({ message: "Failed to send response", error: err.message });
  }
};
