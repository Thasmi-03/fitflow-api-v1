import express from "express";
import { getPartnerAnalytics } from "../controllers/partnerAnalyticsController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Admin only - get partner analytics
router.get("/analytics", authenticate, getPartnerAnalytics);

export default router;
