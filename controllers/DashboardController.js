import pool from "../config/db.js";

// ------------------------- DASHBOARD STATS -------------------------
export const getDashboardStats = async (req, res) => {
  try {
    // Total Orders today and yesterday
    const [ordersToday] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders WHERE DATE(created_at) = CURDATE()"
    );
    const [ordersYesterday] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)"
    );

    // Total Customers this week and last week
    const [customersThisWeek] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role='customer' AND WEEK(created_at,1) = WEEK(CURDATE(),1)"
    );
    const [customersLastWeek] = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role='customer' AND WEEK(created_at,1) = WEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK),1)"
    );

    // Revenue today and yesterday (completed orders)
    const [revenueToday] = await pool.query(
      "SELECT IFNULL(SUM(total_amount),0) AS total FROM orders WHERE status='completed' AND DATE(created_at) = CURDATE()"
    );
    const [revenueYesterday] = await pool.query(
      "SELECT IFNULL(SUM(total_amount),0) AS total FROM orders WHERE status='completed' AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)"
    );

    // Feedback this week and last week
    const [feedbackThisWeek] = await pool.query(
      "SELECT IFNULL(AVG(rating),0) AS avg FROM feedback WHERE WEEK(created_at,1) = WEEK(CURDATE(),1)"
    );
    const [feedbackLastWeek] = await pool.query(
      "SELECT IFNULL(AVG(rating),0) AS avg FROM feedback WHERE WEEK(created_at,1) = WEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK),1)"
    );

    res.status(200).json({
      totalOrders: Number(ordersToday[0].total || 0),
      totalOrdersPrevious: Number(ordersYesterday[0].total || 0),
      totalCustomers: Number(customersThisWeek[0].total || 0),
      totalCustomersPrevious: Number(customersLastWeek[0].total || 0),
      todayRevenue: Number(revenueToday[0].total || 0),
      revenuePrevious: Number(revenueYesterday[0].total || 0),
      averageFeedback: Number(parseFloat(feedbackThisWeek[0].avg || 0).toFixed(1)),
      feedbackPrevious: Number(parseFloat(feedbackLastWeek[0].avg || 0).toFixed(1)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
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

    const formattedRows = rows.map((r) => ({
      ...r,
      total_amount: Number(r.total_amount || 0),
    }));

    res.status(200).json(formattedRows);
  } catch (err) {
    console.error("Failed to fetch recent orders:", err);
    res.status(500).json({ message: "Failed to fetch recent orders" });
  }
};

// ------------------------- ALL ORDERS -------------------------
export const getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, u.first_name AS customer_name, o.total_amount, o.status, o.created_at
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      ORDER BY o.created_at DESC
    `);

    const formattedRows = rows.map((r) => ({
      ...r,
      total_amount: Number(r.total_amount || 0),
    }));

    res.status(200).json(formattedRows);
  } catch (err) {
    console.error("Failed to fetch all orders:", err);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

// ------------------------- ORDERS BY HOUR -------------------------
export const getOrdersByHour = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT HOUR(created_at) AS hour, COUNT(*) AS orders
      FROM orders
      WHERE DATE(created_at) = CURDATE()
      GROUP BY HOUR(created_at)
      ORDER BY hour
    `);

    const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8AM-8PM
    const data = hours.map((h) => rows.find((r) => r.hour === h)?.orders || 0);
    const labels = hours.map((h) => `${h > 12 ? h - 12 : h}${h >= 12 ? "PM" : "AM"}`);

    res.status(200).json({ labels, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders by hour" });
  }
};

// ------------------------- SALES WEEKLY -------------------------
export const getSalesByDay = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DAYNAME(created_at) AS day, IFNULL(SUM(total_amount),0) AS sales
      FROM orders
      WHERE WEEK(created_at, 1) = WEEK(CURDATE(), 1)
        AND status = 'completed'
      GROUP BY DAYNAME(created_at)
    `);

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = weekDays.map((day) => rows.find((r) => r.day.startsWith(day))?.sales || 0);

    res.status(200).json({ labels: weekDays, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch sales by week" });
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
    console.error("Failed to fetch order items:", err);
    res.status(500).json({ message: "Failed to fetch order items" });
  }
};

// ------------------------- CUSTOMERS -------------------------
export const getAllCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, first_name, email, phone, password, address, created_at 
      FROM users 
      WHERE role = 'customer'
      ORDER BY created_at DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Failed to fetch customers:", err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};

export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { first_name, email, phone, password, address } = req.body;

  try {
    await pool.query(
      `UPDATE users 
       SET first_name = ?, email = ?, phone = ?, password = ?, address = ? 
       WHERE id = ?`,
      [first_name, email, phone, password, address, id]
    );

    res.status(200).json({ message: "Customer updated successfully" });
  } catch (err) {
    console.error("Failed to update customer:", err);
    res.status(500).json({ message: "Failed to update customer" });
  }
};
