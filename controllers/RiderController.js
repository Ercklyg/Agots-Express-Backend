import pool from "../config/db.js";

export const getRiderById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT id, first_name, username, role FROM users WHERE id = ? AND role = 'rider'",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Rider not found" });
    }

    const rider = rows[0];
    res.status(200).json({
      id: rider.id,
      name: rider.first_name,
      username: rider.username,
      riderId: `R${String(rider.id).padStart(3, "0")}`,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch rider info", error: err.message });
  }
};
