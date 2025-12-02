import pool from "../config/db.js";

// Add new menu item
export const addMenuItem = async (
  name,
  category,
  price,
  description,
  group,
  image
) => {
  if (!name || !price || !description || !group) {
    throw new Error("Name, price, description, and group are required fields");
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO menu (name, category, price, description, `group`, image) VALUES (?, ?, ?, ?, ?, ?)",
      [
        name,
        category === "None" ? null : category,
        price,
        description,
        group,
        image || null,
      ]
    );

    return {
      id: result.insertId,
      name,
      category: category === "None" ? null : category,
      price,
      description,
      group,
      image: image || null,
    };
  } catch (err) {
    console.error("Error inserting menu item:", err.message);
    throw new Error("Failed to create menu item");
  }
};

// Update menu item
export const updateMenuItem = async (id, data) => {
  const { name, category, price, description, group, image } = data;
  if (!name || !price || !description || !group) {
    throw new Error("Name, price, description, and group are required fields");
  }

  try {
    const updatedCategory = category === "None" ? null : category;
    const [result] = await pool.query(
      "UPDATE menu SET name = ?, category = ?, price = ?, description = ?, `group` = ?, image = ? WHERE id = ?",
      [name, updatedCategory, price, description, group, image || null, id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error updating menu item:", err.message);
    throw new Error("Failed to update menu item");
  }
};

// Get all menu items
export const getAllMenuItems = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM menu");
    return rows;
  } catch (err) {
    console.error("Error fetching menu items:", err.message);
    throw new Error("Failed to fetch menu items");
  }
};

// Get menu item by ID
export const getMenuItemById = async (id) => {
  try {
    const [rows] = await pool.query("SELECT * FROM menu WHERE id = ?", [id]);
    return rows[0];
  } catch (err) {
    console.error("Error fetching menu item by ID:", err.message);
    throw new Error("Failed to fetch menu item by ID");
  }
};

// Delete menu item
export const deleteMenuItem = async (id) => {
  try {
    const [result] = await pool.query("DELETE FROM menu WHERE id = ?", [id]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Failed to delete menu item:", err);
    throw new Error("Failed to delete menu item");
  }
};
  