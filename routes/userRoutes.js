import express from "express";
import { loginUser, registerUser, assignAdminRole, getAllUsers, updatePassword } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/assign-admin", assignAdminRole);
router.get("/users", getAllUsers);
router.patch("/update-password", protect, updatePassword);

export default router;
