import pool from "../config/db.js";

// --------------------
// Get rider info
// --------------------
export const getRiderByIdModel = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, first_name, username, role
     FROM users
     WHERE id = ? AND role = 'rider'`,
    [id]
  );

  if (rows.length === 0) return null;

  const rider = rows[0];
  return {
    id: rider.id,
    name: rider.first_name,
    username: rider.username,
    riderId: `R${String(rider.id).padStart(3, "0")}`,
  };
};

// --------------------
// Get orders assigned to rider (with rating)
// --------------------
export const getOrdersByRiderIdModel = async (id, status) => {
  let query = `
    SELECT o.id AS id,
           o.total_amount,
           o.status,
           o.created_at,
           o.completed_at,
           u.first_name AS customer_name,
           u.phone AS customer_phone,
           u.address AS customer_address,
           f.rating AS rating
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    LEFT JOIN feedback f ON f.order_id = o.id
    WHERE o.rider_id = ?`;

  const params = [id];

  if (status) {
    query += " AND o.status = ?";
    params.push(status);
  }

  query += " ORDER BY o.created_at DESC";

  const [orders] = await pool.query(query, params);

  const orderIds = orders.map((o) => o.id);
  let itemsMap = {};

  if (orderIds.length > 0) {
    const [items] = await pool.query(
      `SELECT oi.order_id, m.name AS item_name, oi.quantity, oi.price, oi.total
       FROM order_items oi
       JOIN menu m ON oi.menu_id = m.id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    items.forEach((item) => {
      if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
      itemsMap[item.order_id].push(item);
    });
  }

  return orders.map((o) => ({
    ...o,
    items: itemsMap[o.id] || [],
    rating: o.rating != null ? parseFloat(o.rating) : null,
  }));
};

// --------------------
// Get stats for rider
// --------------------
export const getRiderStatsModel = async (id) => {
  const [todaysDeliveries] = await pool.query(
    `SELECT total_amount
     FROM orders
     WHERE rider_id = ? AND status = 'completed' AND DATE(completed_at) = CURDATE()`,
    [id]
  );

  const totalDeliveries = todaysDeliveries.length;
  const totalEarnings = todaysDeliveries.reduce(
    (sum, o) => sum + parseFloat(o.total_amount || 0),
    0
  );

  // Average rating
  const [ratings] = await pool.query(
    `SELECT f.rating
     FROM feedback f
     JOIN orders o ON f.order_id = o.id
     WHERE o.rider_id = ? AND f.rating IS NOT NULL`,
    [id]
  );

  const validRatings = ratings.map((r) => parseFloat(r.rating));
  const avgRating =
    validRatings.length > 0
      ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
      : 0;

  return {
    totalDeliveries,
    totalEarnings: parseFloat(totalEarnings.toFixed(2)),
    avgRating: parseFloat(avgRating.toFixed(2)),
    totalReviews: validRatings.length,
  };
};

// --------------------
// Accept a delivery
// --------------------
export const acceptDeliveryModel = async (riderId, orderId) => {
  const [result] = await pool.query(
    `UPDATE orders
     SET status = 'on the way', rider_id = ?
     WHERE id = ? AND status = 'assigned'`,
    [riderId, orderId]
  );
  return result.affectedRows > 0;
};

// --------------------
// Complete a delivery
// --------------------
export const completeDeliveryModel = async (riderId, orderId) => {
  const [result] = await pool.query(
    `UPDATE orders
     SET status = 'completed', completed_at = NOW()
     WHERE id = ? AND rider_id = ? AND status = 'on the way'`,
    [orderId, riderId]
  );
  return result.affectedRows > 0;
};

// --------------------
// ⭐ Submit Rating (untouched)
// --------------------
export const submitRatingModel = async (orderId, riderId, rating, review) => {
  // Check if order belongs to this rider
  const [orderCheck] = await pool.query(
    `SELECT id FROM orders WHERE id = ? AND rider_id = ? AND status = 'completed'`,
    [orderId, riderId]
  );
  if (orderCheck.length === 0)
    return { success: false, message: "Invalid order" };

  // Check if already rated
  const [existing] = await pool.query(
    `SELECT id FROM feedback WHERE order_id = ?`,
    [orderId]
  );
  if (existing.length > 0) return { success: false, message: "Already rated" };

  // Insert new rating
  const [result] = await pool.query(
    `INSERT INTO feedback (order_id, rating, review, created_at)
     VALUES (?, ?, ?, NOW())`,
    [orderId, rating, review || null]
  );

  return { success: result.affectedRows > 0 };
};
