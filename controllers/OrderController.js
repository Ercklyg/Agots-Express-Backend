import pool from "../config/db.js";

// Place a new order
export const placeOrder = async (req, res) => {
  const {
    customer_id,
    items, // Array of { menu_id, quantity, price }
    paymentMethod,
    deliveryAddress, // { first_name, last_name, phone, email, address, delivery_instructions, latitude, longitude }
  } = req.body;

  if (!customer_id || !items || !items.length || !deliveryAddress) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Calculate total amount
    let totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    if (paymentMethod === "cash") totalAmount += 50; // Add delivery fee if cash

    // Insert into orders
    const [orderResult] = await connection.query(
      "INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, 'pending')",
      [customer_id, totalAmount]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      const itemTotal = item.price * item.quantity;
      await connection.query(
        "INSERT INTO order_items (order_id, menu_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.menu_id, item.quantity, item.price, itemTotal]
      );
    }

    // Insert delivery address
    const {
      first_name,
      last_name,
      phone,
      email,
      address,
      delivery_instructions,
      latitude,
      longitude,
    } = deliveryAddress;

    await connection.query(
      `INSERT INTO delivery_address 
      (order_id, first_name, last_name, phone, email, address, delivery_instructions, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        first_name,
        last_name,
        phone,
        email || null,
        address,
        delivery_instructions || null,
        latitude,
        longitude,
      ]
    );

    await connection.commit();

    res.status(201).json({
      message: "Order placed successfully",
      order_id: orderId,
      total_amount: totalAmount,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Failed to place order:", err.message);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  } finally {
    connection.release();
  }
};
