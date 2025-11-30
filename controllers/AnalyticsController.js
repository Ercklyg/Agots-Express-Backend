// controllers/AnalyticsController.js
import pool from "../config/db.js";

// Helper to safely convert numbers
const safeNumber = (val) => Number(val ?? 0);

// 1️⃣ Revenue & Orders Trend
export const getRevenueTrend = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT MONTH(created_at) AS month_num,
             DATE_FORMAT(created_at, '%b') AS month,
             SUM(total_amount) AS revenue,
             COUNT(id) AS orders
      FROM orders
      WHERE status = 'completed'
      GROUP BY MONTH(created_at)
      ORDER BY MONTH(created_at)
    `);

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthMap = {};
    rows.forEach((r) => {
      monthMap[r.month_num] = {
        month: r.month,
        revenue: safeNumber(r.revenue),
        orders: safeNumber(r.orders),
      };
    });

    const data = months.map(
      (m, idx) => monthMap[idx + 1] ?? { month: m, revenue: 0, orders: 0 }
    );
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch revenue trend", error: err.message });
  }
};

// 2️⃣ Sales by Group
export const getSalesByGroup = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.\`group\` AS name,
             SUM(oi.quantity) AS value
      FROM order_items oi
      JOIN menu m ON oi.menu_id = m.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY m.\`group\`
      ORDER BY value DESC
    `);

    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a569bd"];
    const data = rows.map((r, idx) => ({
      name: r.name || "Uncategorized",
      value: safeNumber(r.value),
      color: colors[idx % colors.length],
    }));

    if (data.length === 0) {
      return res.json([
        { name: "Main Course", value: 0, color: "#8884d8" },
        { name: "Dessert", value: 0, color: "#82ca9d" },
        { name: "Appetizer", value: 0, color: "#ffc658" },
        { name: "Beverage", value: 0, color: "#ff7f50" },
        { name: "Combo Meal", value: 0, color: "#a569bd" },
      ]);
    }

    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch sales by group", error: err.message });
  }
};

// 3️⃣ Top Selling Items
export const getTopItems = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.name,
             SUM(oi.quantity) AS orders
      FROM order_items oi
      JOIN menu m ON oi.menu_id = m.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status = 'completed'
      GROUP BY m.id
      ORDER BY orders DESC
      LIMIT 5
    `);

    const data = rows.map((r) => ({
      name: r.name,
      orders: safeNumber(r.orders),
    }));
    while (data.length < 5)
      data.push({ name: `Item ${data.length + 1}`, orders: 0 });

    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch top items", error: err.message });
  }
};

// 4️⃣ Key Metrics with percentage difference
export const getKeyMetrics = async (req, res) => {
  try {
    // Current month
    const [[currentOrders]] = await pool.query(`
      SELECT COALESCE(SUM(total_amount),0) AS total_revenue,
             COALESCE(COUNT(id),0) AS total_orders
      FROM orders
      WHERE status = 'completed'
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `);

    const [[currentCustomers]] = await pool.query(`
      SELECT COALESCE(COUNT(id),0) AS new_customers
      FROM users
      WHERE role = 'customer'
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `);

    const [[currentRating]] = await pool.query(`
      SELECT COALESCE(AVG(rating),0) AS avg_rating
      FROM feedback
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `);

    // Previous month
    const [[prevOrders]] = await pool.query(`
      SELECT COALESCE(SUM(total_amount),0) AS prev_total_revenue,
             COALESCE(COUNT(id),0) AS prev_total_orders
      FROM orders
      WHERE status = 'completed'
        AND MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
        AND YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
    `);

    const [[prevCustomers]] = await pool.query(`
      SELECT COALESCE(COUNT(id),0) AS prev_new_customers
      FROM users
      WHERE role = 'customer'
        AND MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
        AND YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
    `);

    const [[prevRating]] = await pool.query(`
      SELECT COALESCE(AVG(rating),0) AS prev_avg_rating
      FROM feedback
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
        AND YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
    `);

    res.json({
      total_revenue: safeNumber(currentOrders.total_revenue),
      total_orders: safeNumber(currentOrders.total_orders),
      new_customers: safeNumber(currentCustomers.new_customers),
      avg_rating: safeNumber(currentRating.avg_rating),
      prev_total_revenue: safeNumber(prevOrders.prev_total_revenue),
      prev_total_orders: safeNumber(prevOrders.prev_total_orders),
      prev_new_customers: safeNumber(prevCustomers.prev_new_customers),
      prev_avg_rating: safeNumber(prevRating.prev_avg_rating),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch key metrics", error: err.message });
  }
};
     