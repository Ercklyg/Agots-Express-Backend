    import * as CartModel from "../models/CartModel.js";

    // Get cart for a user
    export const getCart = async (req, res) => {
    const { user_id } = req.params;
    try {
        const items = await CartModel.getCartByUserId(user_id);
        res.status(200).json(items);
    } catch (err) {
        console.error(err);
        res
        .status(500)
        .json({ message: "Failed to fetch cart", error: err.message });
    }
    };

    // Add/update cart item
    export const addCartItem = async (req, res) => {
    const { user_id, menu_id, quantity } = req.body;
    try {
        const item = await CartModel.addToCart(user_id, menu_id, quantity);
        res.status(200).json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to add item", error: err.message });
    }
    };

    // Remove item
    export const removeCartItem = async (req, res) => {
    const { user_id, menu_id } = req.params;
    try {
        const success = await CartModel.removeFromCart(user_id, menu_id);
        res.status(200).json({ success });
    } catch (err) {
        console.error(err);
        res
        .status(500)
        .json({ message: "Failed to remove item", error: err.message });
    }
    };

    // Clear cart
    export const clearCartItems = async (req, res) => {
    const { user_id } = req.params;
    try {
        const success = await CartModel.clearCart(user_id);
        res.status(200).json({ success });
    } catch (err) {
        console.error(err);
        res
        .status(500)
        .json({ message: "Failed to clear cart", error: err.message });
    }
    };

    export const updateCartItemController = async (req, res) => {
    const { user_id, menu_id, quantity, specialInstructions } = req.body;

    try {
        const updatedItem = await CartModel.updateCartItem(
        user_id,
        menu_id,
        quantity,
        specialInstructions
        );

        if (updatedItem) {
        res.status(200).json(updatedItem); // Return only the updated item
        } else {
        res
            .status(404)
            .json({ message: "Cart item not found or nothing to update." });
        }
    } catch (err) {
        console.error(err);
        res
        .status(500)
        .json({ message: "Failed to update cart item", error: err.message });
    }
    };
