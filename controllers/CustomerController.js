import {
  getCustomerByIdModel,
  getCustomerStatsModel,
  getFeedbackByOrderModel,
  getOrdersByCustomerModel,
  submitFeedbackModel,
  updateCustomerProfileModel,
} from "../models/CustomerModel.js";

// --- Profile ---
export const getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await getCustomerByIdModel(customerId);
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCustomerProfile = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { full_name, email, phone, address } = req.body;
    await updateCustomerProfileModel(
      customerId,
      full_name,
      email,
      phone,
      address
    );
    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- Orders ---
export const getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.params.id;
    const statuses = [
      "pending",
      "preparing",
      "ready",
      "assigned",
      "on the way",
    ];
    const orders = await getOrdersByCustomerModel(customerId, statuses);
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCustomerOrderHistory = async (req, res) => {
  try {
    const customerId = req.params.id;
    const orders = await getOrdersByCustomerModel(customerId, ["completed"]);
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- Stats ---
export const getCustomerStats = async (req, res) => {
  try {
    const customerId = req.params.id;
    const stats = await getCustomerStatsModel(customerId);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --- Feedback ---
export const getOrderFeedback = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { orderId } = req.query;
    const feedback = await getFeedbackByOrderModel(customerId, orderId);
    res.json({ success: true, data: feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const customerId = req.params.id;
    const { orderId, rating, comment } = req.body;
    const feedback = await submitFeedbackModel(
      customerId,
      orderId,
      rating,
      comment
    );
    res.json({
      success: true,
      data: feedback,
      message: "Feedback submitted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};
