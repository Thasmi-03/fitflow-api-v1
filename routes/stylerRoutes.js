import express from "express";
import {
  createStyler,
  getAllStylers,
  getStylerById,
  updateStyler,
  deleteStyler,
} from "../controllers/stylerController.js";
import { verifyToken } from "../middleware/auth.js";
import { verifyRole } from "../middleware/admin.js";

const router = express.Router();

router.post("/", verifyToken, verifyRole("styler"), createStyler);
router.get("/", verifyToken, verifyRole( "admin"), getAllStylers);
router.get("/:id", verifyToken, verifyRole(["styler", "admin"]), getStylerById);
router.put("/:id", verifyToken, verifyRole("styler"), updateStyler);
router.delete("/:id", verifyToken, verifyRole(["styler", "admin"]), deleteStyler);

export default router;
