import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/admin.js";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment
} from "../controllers/paymentController.js";

const router = express.Router();

// Protected routes
router.post("/", verifyToken, verifyRole(["styler", "partner"]), createPayment);
router.get("/", verifyToken, verifyRole(["admin", "styler", "partner"]), getAllPayments);
router.get("/:id", verifyToken, verifyRole(["admin", "styler", "partner"]), getPaymentById);
router.put("/:id", verifyToken, verifyRole(["styler", "partner"]), updatePayment);
router.delete("/:id", verifyToken, verifyRole(["styler", "partner"]), deletePayment);

export default router;
