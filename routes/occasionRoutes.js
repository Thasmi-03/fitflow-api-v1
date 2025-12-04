import express from "express";
import {
  createOccasion,
  getAllOccasions,
  getOccasionById,
  updateOccasion,
  deleteOccasion,
  getOccasionSuggestions,
} from "../controllers/occasionController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/admin.js";

const router = express.Router();

router.get("/", verifyToken, verifyRole(["styler", "partner"]), getAllOccasions);
router.post("/", verifyToken, verifyRole("styler"), createOccasion);
router.get("/:id", verifyToken, verifyRole("styler"), getOccasionById);
router.get("/:id/suggestions", verifyToken, verifyRole("styler"), getOccasionSuggestions);
router.put("/:id", verifyToken, verifyRole("styler"), updateOccasion);
router.delete("/:id", verifyToken, verifyRole("styler"), deleteOccasion);

export default router;
