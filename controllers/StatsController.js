import pool from "../config/db.js";
import { getDashboardStats } from "../models/StatsModel.js";

/**
 * GET /dashboard/stats
 */
export const getStats = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json(stats);
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({
      totalOrders: 0,
      totalOrdersPrevious: 0,
      totalCustomers: 0,
      todayCustomers: 0,
      yesterdayCustomers: 0,
      customerPercentage: 0,
      todayRevenue: 0,
      revenuePrevious: 0,
      newFeedbackToday: 0,
      feedbackPrevious: 0,
      satisfactionPercentage: 0,
    });
  }
};

// ------------------------- RECENT ORDERS -------------------------
export const getRecentOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, u.first_name AS customer_name, o.total_amount, o.status, o.created_at
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);
    const formatted = rows.map((r) => ({
      ...r,
      total_amount: Number(r.total_amount || 0),
    }));
    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recent orders" });
  }
};

// ------------------------- ORDER ITEMS -------------------------
export const getOrderItems = async (req, res) => {
  const { orderId } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT m.name AS food_name, oi.quantity, oi.price, oi.total
       FROM order_items oi
       JOIN menu m ON m.id = oi.menu_id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch order items" });
  }
};
