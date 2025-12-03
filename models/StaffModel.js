import pool from "../config/db.js";

// ----------------------------
// Count orders by status
// ----------------------------
export const countOrdersByStatus = async (status) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM orders WHERE status = ?`,
    [status]
  );
  return rows[0].total;
};

// ----------------------------
// Count available riders (exclude any rider with on the way orders)
// ----------------------------
export const countAvailableRiders = async () => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM users r
     WHERE r.role = 'rider'
       AND NOT EXISTS (
         SELECT 1
         FROM orders o
         WHERE o.rider_id = r.id
           AND o.status = 'on the way'
       )`
  );
  return rows[0].total;
};

// ----------------------------
// Fetch active orders (pending, preparing, ready)
// ----------------------------
export const fetchActiveOrders = async () => {
  const [rows] = await pool.query(
    `SELECT 
        o.id,
        o.customer_id,
        u.first_name AS customer,
        o.rider_id,
        o.total_amount,
        o.status,
        DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i') AS time,
        GROUP_CONCAT(CONCAT(m.name, ' x', oi.quantity) SEPARATOR ', ') AS items,
        CASE
          WHEN o.status = 'pending' THEN 'low'
          WHEN o.status = 'preparing' THEN 'medium'
          ELSE 'high'
        END AS priority
     FROM orders o
     JOIN users u ON o.customer_id = u.id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     LEFT JOIN menu m ON oi.menu_id = m.id
     WHERE o.status IN ('pending', 'preparing', 'ready')
     GROUP BY o.id
     ORDER BY o.created_at DESC`
  );
  return rows;
};

// ----------------------------
// Fetch available riders (exclude riders with on the way orders)
// ----------------------------
export const fetchAvailableRiders = async () => {
  const [rows] = await pool.query(
    `SELECT 
        r.id,
        r.first_name AS name,
        COUNT(o_completed.id) AS deliveries
     FROM users r
     LEFT JOIN orders o_completed
       ON r.id = o_completed.rider_id
       AND o_completed.status = 'completed'
       AND DATE(o_completed.completed_at) = CURDATE()
     WHERE r.role = 'rider'
       AND r.id NOT IN (
         SELECT rider_id 
         FROM orders 
         WHERE status = 'on the way' AND rider_id IS NOT NULL
       )
     GROUP BY r.id, r.first_name`
  );
  return rows;
};

// ----------------------------
// Update order status
// ----------------------------
export const updateOrderStatus = async (orderId, status) => {
  const [result] = await pool.query(
    `UPDATE orders SET status = ? WHERE id = ?`,
    [status, orderId]
  );
  return result.affectedRows;
};

// ----------------------------
// Assign rider to order
// ----------------------------
export const assignRiderToOrder = async (orderId, riderId) => {
  const [result] = await pool.query(
    `UPDATE orders 
     SET rider_id = ?, status = 'assigned' 
     WHERE id = ?`,
    [riderId, orderId]
  );
  return result.affectedRows;
};