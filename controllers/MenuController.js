import * as MenuModel from "../models/MenuModel.js";

// Create menu item
export const createMenuItem = async (req, res) => {
  const { name, category, price, description, group } = req.body;
  try {
    const newItem = await MenuModel.addMenuItem(
      name,
      category,
      price,
      description,
      group
    );
    res.status(201).json({
      ...newItem,
      category: newItem.category || "None",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create menu item", error: err.message });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, description, group } = req.body;
  try {
    const updated = await MenuModel.updateMenuItem(id, {
      name,
      category,
      price,
      description,
      group,
    });
    if (!updated)
      return res.status(404).json({ message: "Menu item not found" });
    res
      .status(200)
      .json({
        id,
        name,
        category: category || "None",
        price,
        description,
        group,
      });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update menu item", error: err.message });
  }
};

// Delete menu item
export const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await MenuModel.deleteMenuItem(id);
    if (!deleted)
      return res.status(404).json({ message: "Menu item not found" });
    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete menu item", error: err.message });
  }
};

// Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuModel.getAllMenuItems();
    const formatted = items.map((item) => ({
      ...item,
      category: item.category || "None",
    }));
    res.status(200).json(formatted);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch menu items", error: err.message });
  }
};

// Get menu item by ID
export const getMenuItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await MenuModel.getMenuItemById(id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.status(200).json({ ...item, category: item.category || "None" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch menu item", error: err.message });
  }
};
