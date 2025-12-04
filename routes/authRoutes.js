import express from "express";
import { register, login, getProfile, logout } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes - require authentication
router.get("/profile", verifyToken, getProfile);
router.post("/logout", verifyToken, logout);

export default router;

