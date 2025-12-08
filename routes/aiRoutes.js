import express from "express";
import { getDressSuggestions, detectSkinTone } from "../controllers/aiController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/admin.js";

const router = express.Router();

router.post("/suggestions", verifyToken, verifyRole("styler"), getDressSuggestions);
router.post("/detect-skin-tone", verifyToken, verifyRole("styler"), detectSkinTone);

export default router;
