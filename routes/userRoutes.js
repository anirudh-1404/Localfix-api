import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
//
router.post("/logoust",logoutUser)

export default router;
