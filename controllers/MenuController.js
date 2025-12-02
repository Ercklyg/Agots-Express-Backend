import fs from "fs";
import path from "path";
import * as MenuModel from "../models/MenuModel.js";

// Create menu item
export const createMenuItem = async (req, res) => {
  const { name, category, price, description, group } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const newItem = await MenuModel.addMenuItem(
      name,
      category,
      price,
      description,
      group,
      image
    );
    res.status(201).json({ ...newItem, category: newItem.category || "None" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create menu item", error: err.message });
  }
};

// Update menu item
export const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, description, group, existingImage } = req.body;

  try {
    // Fetch the current menu item
    const currentItem = await MenuModel.getMenuItemById(id);
    if (!currentItem)
      return res.status(404).json({ message: "Menu item not found" });

    // Determine the image to use
    let imageToUse = currentItem.image; // default: keep current image
    if (req.file) {
      // If new file uploaded, replace it
      imageToUse = req.file.filename;

      // Delete old image from disk if exists
      if (currentItem.image) {
        const oldImagePath = path.join("uploads/menu", currentItem.image);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Failed to delete old image:", err.message);
        });
      }
    }

    // Update the menu item
    const updated = await MenuModel.updateMenuItem(id, {
      name,
      category,
      price,
      description,
      group,
      image: imageToUse,
    });

    res.status(200).json({
      id,
      name,
      category: category || "None",
      price,
      description,
      group,
      image: imageToUse,
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
    // Fetch the item to get its image
    const item = await MenuModel.getMenuItemById(id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    // Delete the image file if exists
    if (item.image) {
      const imagePath = path.join("uploads/menu", item.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Failed to delete image:", err.message);
      });
    }

    const deleted = await MenuModel.deleteMenuItem(id);
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
