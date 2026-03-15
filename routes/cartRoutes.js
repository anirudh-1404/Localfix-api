import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/:userId", getCart); // Using params for userId for now (typically from middleware)
router.post("/remove", removeFromCart); // Using POST for remove to send body easily

export default router;
