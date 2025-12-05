import express from "express";
import upload from "../config/uploadLocal.js";

const router = express.Router();

// Single file upload field name = "image"
router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Construct the URL for the uploaded file
    const imageUrl = `${req.protocol}://${req.get('host')}/api/uploads/${req.file.filename}`;

    res.json({
      success: true,
      imageUrl,
      filename: req.file.filename,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

export default router;
