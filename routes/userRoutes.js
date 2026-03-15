import express from "express";
import {
  loginUser,
  registerUser,
  assignAdminRole,
  getAllUsers,
  getMe,       // ✅ ADD
  logoutUser,  // ✅ ADD
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/assign-admin", assignAdminRole);
router.get("/users", getAllUsers);

router.get("/me", protect, getMe);        // ✅ GET /api/auth/me
router.post("/logout", protect, logoutUser); // ✅ POST /api/auth/logout

export default router;