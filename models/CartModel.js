import pool from "../config/db.js";

// Get cart items by user ID
export const getCartByUserId = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT c.*, m.name, m.price, m.image
     FROM carts c
     JOIN menu m ON c.menu_id = m.id
     WHERE c.user_id = ?`,
    [user_id]
  );
  return rows;
};

// Add or update item in cart
export const addToCart = async (user_id, menu_id, quantity = 1) => {
  const [existing] = await pool.query(
    "SELECT * FROM carts WHERE user_id=? AND menu_id=?",
    [user_id, menu_id]
  );

  if (existing.length > 0) {
    const newQty = existing[0].quantity + quantity;
    await pool.query(
      "UPDATE carts SET quantity=?, updated_at=NOW() WHERE user_id=? AND menu_id=?",
      [newQty, user_id, menu_id]
    );
    return { menu_id, quantity: newQty };
  } else {
    const [result] = await pool.query(
      "INSERT INTO carts (user_id, menu_id, quantity) VALUES (?, ?, ?)",
      [user_id, menu_id, quantity]
    );
    return { id: result.insertId, menu_id, quantity };
  }
};

// Remove item from cart
export const removeFromCart = async (user_id, menu_id) => {
  const [result] = await pool.query(
    "DELETE FROM carts WHERE user_id=? AND menu_id=?",
    [user_id, menu_id]
  );
  return result.affectedRows > 0;
};

// Clear all items for user
export const clearCart = async (user_id) => {
  const [result] = await pool.query("DELETE FROM carts WHERE user_id=?", [
    user_id,
  ]);
  return result.affectedRows > 0;
};

export const updateCartItem = async (
  user_id,
  menu_id,
  quantity,
  specialInstructions
) => {
  const updates = [];
  const params = [];

  if (quantity !== undefined) {
    updates.push("quantity=?");
    params.push(quantity);
  }
  if (specialInstructions !== undefined) {
    updates.push("special_instructions=?");
    params.push(specialInstructions);
  }

  if (updates.length === 0) return null; // Nothing to update

  params.push(user_id, menu_id);

  const [result] = await pool.query(
    `UPDATE carts SET ${updates.join(", ")}, updated_at=NOW() WHERE user_id=? AND menu_id=?`,
    params
  );

  if (result.affectedRows === 0) return null;

  // Return the updated cart item
  const [rows] = await pool.query(
    `SELECT c.*, m.name, m.price, m.image
     FROM carts c
     JOIN menu m ON c.menu_id = m.id
     WHERE c.user_id=? AND c.menu_id=?`,
    [user_id, menu_id]
  );

  return rows[0] || null;
};