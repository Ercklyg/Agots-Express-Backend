// controllers/DashboardController.js
import pool from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Total orders
    const [orders] = await pool.query(
      "SELECT COUNT(*) AS totalOrders FROM orders"
    );

    // Total customers
    const [customers] = await pool.query(
      "SELECT COUNT(*) AS totalCustomers FROM users WHERE role='customer'"
    );

    // Total revenue (only completed orders)
    const [revenue] = await pool.query(
      "SELECT IFNULL(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE status='completed'"
    );

    // Average feedback
    const [feedback] = await pool.query(
      "SELECT IFNULL(AVG(rating), 0) AS averageFeedback FROM feedback"
    );

    res.status(200).json({
      totalOrders: orders[0].totalOrders,
      totalCustomers: customers[0].totalCustomers,
      totalRevenue: revenue[0].totalRevenue,
      averageFeedback: parseFloat(feedback[0].averageFeedback).toFixed(1),
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
