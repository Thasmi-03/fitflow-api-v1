import express from "express";
import { verifyToken, optionalAuthenticate } from "../middleware/auth.js";
import { verifyRole } from "../middleware/role.js"; // <-- fixed
import {
  createCloth,
  getPublicCloths,
  getMyCloths,
  getClothById,
  updateCloth,
  deleteCloth,
  getSuggestions,
  recordView,
  toggleLike,
} from "../controllers/partnerClothesController.js";

const router = express.Router();

// Public route
router.get("/", getPublicCloths);

// Partner routes
router.post("/", verifyToken, verifyRole("partner"), createCloth);
router.get("/mine", verifyToken, verifyRole("partner"), getMyCloths);

// Styler route
router.get("/suggestions", verifyToken, verifyRole("styler"), getSuggestions);

// Individual cloth routes
router.get("/:id", optionalAuthenticate, getClothById);
router.put("/:id", verifyToken, updateCloth); // owner/admin check inside controller
router.delete("/:id", verifyToken, deleteCloth);

// Styler view tracking and likes
router.post("/:id/view", verifyToken, verifyRole("styler"), recordView);
router.post("/:id/like", verifyToken, verifyRole("styler"), toggleLike);

export default router;
