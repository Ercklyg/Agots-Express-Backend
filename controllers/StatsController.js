import pool from "../config/db.js";

// Get stats for the dashboard
export const getStats = async (req, res) => {
  try {
    // Total Orders
    const [totalOrders] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders"
    );

    // Total Customers
    const [totalCustomers] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role='customer'"
    );

    // Total Revenue
    const [totalRevenue] = await pool.query(
      "SELECT IFNULL(SUM(total),0) AS total FROM orders WHERE status='completed'"
    );

    // Average Feedback
    const [averageFeedback] = await pool.query(
      "SELECT IFNULL(AVG(rating),0) AS average FROM feedback"
    );

    res.status(200).json({
      success: true,
      stats: {
        totalOrders: totalOrders[0].total,
        totalCustomers: totalCustomers[0].total,
        totalRevenue: totalRevenue[0].total,
        averageFeedback: parseFloat(averageFeedback[0].average.toFixed(1))
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
