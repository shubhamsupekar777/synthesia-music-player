import express from "express";
import {
  resetPassword,
  forgotPassword,
  getMe,
  login,
  signup,
  editProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/profile", protect, editProfile);

export default router;
