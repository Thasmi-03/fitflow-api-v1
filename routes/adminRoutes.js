import express from "express";
import {
  approveUser,
  getPendingUsers,
  getPendingPartners,
  rejectUser,
} from "../controllers/authController.js";
import { getAdminAnalytics, getAllUsers, getAllPartners, getAllStylists } from "../controllers/adminController.js";
import { verifyToken } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);
 
// Admin only routes
router.get("/analytics", getAdminAnalytics);
router.get("/pending", getPendingUsers);
router.put("/approve/:userId", approveUser);
router.get("/users", getAllUsers);
router.get("/partners", getAllPartners);
router.get("/stylists", getAllStylists);

// Partner management routes
router.get("/partners/pending", getPendingPartners);
router.patch("/partners/:userId/approve", approveUser);
router.patch("/partners/:userId/reject", rejectUser);

export default router;

