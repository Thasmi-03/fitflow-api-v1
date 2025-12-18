import express from "express";
import {
  recordWear,
  getClosetHealth
} from "../controllers/analyticsController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.post("/wear", recordWear);
router.get("/health", getClosetHealth);

export default router;
