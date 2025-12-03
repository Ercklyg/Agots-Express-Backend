import {
  assignRiderToOrder,
  countAvailableRiders,
  countOrdersByStatus,
  fetchActiveOrders,
  fetchAvailableRiders,
  updateOrderStatus,
} from "../models/StaffModel.js";

// ----------------------------
// GET /staff/dashboard/stats
// ----------------------------
export const getDashboardStats = async (req, res) => {
  try {
    const pending = await countOrdersByStatus("pending");
    const preparing = await countOrdersByStatus("preparing");
    const readyForDelivery = await countOrdersByStatus("ready");
    const availableRiders = await countAvailableRiders();

    res.json({
      success: true,
      data: { pending, preparing, readyForDelivery, availableRiders },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------
// GET /staff/dashboard/orders
// ----------------------------
export const getActiveOrders = async (req, res) => {
  try {
    const orders = await fetchActiveOrders();
    const riders = await fetchAvailableRiders(); // ✅ Only riders without "on_the_way" orders

    res.json({
      success: true,
      data: { orders, riders },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------
// PATCH /staff/orders/:id/status
// ----------------------------
export const changeOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const affected = await updateOrderStatus(id, status);

    if (!affected)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.json({ success: true, message: `Order ${id} updated to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------------
// PATCH /staff/orders/:id/assign
// ----------------------------
export const assignRider = async (req, res) => {
  try {
    const { id } = req.params;
    const { riderId } = req.body;

    const affected = await assignRiderToOrder(id, riderId);

    if (!affected)
      return res
        .status(404)
        .json({ success: false, message: "Order not found or rider invalid" });

    res.json({
      success: true,
      message: `Rider ${riderId} assigned to order ${id}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
