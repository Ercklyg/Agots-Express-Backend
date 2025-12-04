import express from "express";
import {
  addCartItem,
  clearCartItems,
  getCart,
  removeCartItem,
  updateCartItemController,
} from "../controllers/CartController.js";

const router = express.Router();

router.get("/:user_id", getCart);
router.post("/add", addCartItem);
router.delete("/remove/:user_id/:menu_id", removeCartItem);
router.delete("/clear/:user_id", clearCartItems);
router.put("/update", updateCartItemController);


export default router;
