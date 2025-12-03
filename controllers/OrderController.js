import pool from "../config/db.js";

export const placeOrderController = async (req, res) => {
  const { user_id, paymentMethod, deliveryAddress, items } = req.body;

  // Validate required fields
  if (
    !user_id ||
    !deliveryAddress?.first_name ||
    !deliveryAddress?.last_name ||
    !deliveryAddress?.phone ||
    !deliveryAddress?.address
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Fetch cart items if items not sent from frontend
    let orderItems = items;
    if (!orderItems || !orderItems.length) {
      const [cartItems] = await connection.query(
        `SELECT c.menu_id, c.quantity, m.price
         FROM carts c
         JOIN menu m ON c.menu_id = m.id
         WHERE c.user_id = ?`,
        [user_id]
      );

      if (!cartItems.length) throw new Error("Cart is empty");
      orderItems = cartItems.map((i) => ({
        menu_id: i.menu_id,
        quantity: i.quantity,
        price: i.price,
      }));
    }

    // Calculate total
    const totalAmount = orderItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    // 2️⃣ Insert into orders
    const [orderResult] = await connection.query(
      `INSERT INTO orders (customer_id, total_amount, payment_method, status) 
       VALUES (?, ?, ?, 'pending')`,
      [user_id, totalAmount, paymentMethod]
    );

    const order_id = orderResult.insertId;

    // 3️⃣ Insert into order_items
    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, menu_id, quantity, price, total) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          order_id,
          item.menu_id,
          item.quantity,
          item.price,
          item.price * item.quantity,
        ]
      );
    }

    // 4️⃣ Insert into delivery_info
    await connection.query(
      `INSERT INTO delivery_info 
        (order_id, first_name, last_name, phone, email, address, delivery_instructions) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        deliveryAddress.first_name,
        deliveryAddress.last_name,
        deliveryAddress.phone,
        deliveryAddress.email || null,
        deliveryAddress.address,
        deliveryAddress.delivery_instructions || null,
      ]
    );

    // 5️⃣ Clear user's cart
    await connection.query(`DELETE FROM carts WHERE user_id = ?`, [user_id]);

    await connection.commit();
    res.status(200).json({ order_id });
  } catch (err) {
    await connection.rollback();
    console.error("Place Order Error:", err);
    res.status(500).json({
      message: "Failed to place order",
      error: err.message,
    });
  } finally {
    connection.release();
  }
};
