import {
  acceptDeliveryModel,
  completeDeliveryModel,
  getOrdersByRiderIdModel,
  getRiderByIdModel,
  getRiderStatsModel,
} from "../models/RiderModel.js";

// --------------------
// GET /rider/:id
// --------------------
export const getRiderById = async (req, res) => {
  try {
    const rider = await getRiderByIdModel(req.params.id);
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    res.status(200).json(rider);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch rider info", error: err.message });
  }
};

// --------------------
// GET /rider/:id/orders
// --------------------
export const getOrdersByRiderId = async (req, res) => {
  try {
    const orders = await getOrdersByRiderIdModel(
      req.params.id,
      req.query.status
    );
    res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
};

// --------------------
// GET /rider/:id/stats
// --------------------
export const getRiderStats = async (req, res) => {
  try {
    const stats = await getRiderStatsModel(req.params.id);
    res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch rider stats", error: err.message });
  }
};

// --------------------
// PATCH /rider/:id/orders/:orderId/accept
// --------------------
export const acceptDelivery = async (req, res) => {
  try {
    const success = await acceptDeliveryModel(
      req.params.id,
      req.params.orderId
    );
    if (!success)
      return res
        .status(404)
        .json({ message: "Order not found or cannot be accepted" });

    res.status(200).json({ message: "Delivery accepted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to accept delivery", error: err.message });
  }
};

// --------------------
// PATCH /rider/:id/orders/:orderId/complete
// --------------------
export const completeDelivery = async (req, res) => {
  try {
    const success = await completeDeliveryModel(
      req.params.id,
      req.params.orderId
    );
    if (!success)
      return res.status(400).json({
        message: "Order not found or not 'on the way', cannot complete",
      });

    res.status(200).json({ message: "Delivery marked as completed" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to complete delivery", error: err.message });
  }
};
