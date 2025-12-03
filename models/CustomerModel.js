import pool from "../config/db.js";

// --- Customer Profile ---
export const getCustomerByIdModel = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, first_name, email, phone, address 
     FROM users 
     WHERE id = ? AND role = 'customer'`,
    [id]
  );
  if (!rows.length) return null;

  return {
    id: rows[0].id,
    first_name: rows[0].first_name,
    email: rows[0].email,
    phone: rows[0].phone,
    address: rows[0].address,
  };
};

export const updateCustomerProfileModel = async (
  id,
  full_name,
  email,
  phone,
  address
) => {
  await pool.query(
    `UPDATE users SET first_name = ?, email = ?, phone = ?, address = ?
     WHERE id = ? AND role = 'customer'`,
    [full_name, email, phone, address, id]
  );
};

// --- Orders ---
export const getOrdersByCustomerModel = async (
  customerId,
  statuses = ["pending", "completed"]
) => {
  const [orders] = await pool.query(
    `SELECT id, total_amount, status, created_at, completed_at
     FROM orders 
     WHERE customer_id = ? AND status IN (?)
     ORDER BY created_at DESC`,
    [customerId, statuses]
  );

  if (orders.length === 0) return [];

  // Fetch order items
  const orderIds = orders.map((o) => o.id);
  const [items] = await pool.query(
    `SELECT oi.order_id, m.name AS item_name, oi.quantity, oi.price
     FROM order_items oi
     JOIN menu m ON oi.menu_id = m.id
     WHERE oi.order_id IN (?)`,
    [orderIds]
  );

  const itemsMap = {};
  items.forEach((item) => {
    if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
    itemsMap[item.order_id].push(`${item.quantity} x ${item.item_name}`);
  });

  return orders.map((o) => ({
    ...o,
    items: itemsMap[o.id] || [],
  }));
};

// --- Stats ---
// --- Stats ---
export const getCustomerStatsModel = async (customerId) => {
  // Total spent: sum of completed orders
  const [completedOrders] = await pool.query(
    `SELECT total_amount FROM orders 
     WHERE customer_id = ? AND status = 'completed'`,
    [customerId]
  );

  const totalSpent = completedOrders.reduce(
    (sum, o) => sum + parseFloat(o.total_amount || 0),
    0
  );

  // Total recent orders: count orders that are not yet completed
  const [recentOrders] = await pool.query(
    `SELECT COUNT(*) as total FROM orders 
     WHERE customer_id = ? AND status IN ('pending','preparing','ready','assigned','on the way')`,
    [customerId]
  );

  const totalOrders = recentOrders[0]?.total || 0;

  return {
    totalOrders,
    totalSpent: parseFloat(totalSpent.toFixed(2)),
  };
};

// --- Feedback with admin response ---
export const getFeedbackByOrderModel = async (customerId, orderId) => {
  const [rows] = await pool.query(
    `SELECT f.id AS feedback_id, f.rating, f.comment, r.response
     FROM feedback f
     LEFT JOIN feedback_responses r ON f.id = r.feedback_id
     WHERE f.customer_id = ? AND f.order_id = ?`,
    [customerId, orderId]
  );
  return rows[0] || null;
};

export const submitFeedbackModel = async (
  customerId,
  orderId,
  rating,
  comment
) => {
  const existing = await getFeedbackByOrderModel(customerId, orderId);
  if (existing) throw new Error("Feedback already submitted for this order");

  const [result] = await pool.query(
    `INSERT INTO feedback (customer_id, order_id, rating, comment, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [customerId, orderId, rating, comment || ""]
  );

  return {
    feedback_id: result.insertId,
    rating,
    comment,
    response: "", // initially no admin response
  };
};
