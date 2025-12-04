import express from "express";
import upload from "../config/upload.js";

const router = express.Router();

// Single file upload field name = "image"
router.post("/upload", upload.single("image"), (req, res) => {
  try {
    // multer-storage-cloudinary sets req.file.path to Cloudinary URL
    const imageUrl = req.file?.path || null;
    const publicId = req.file?.filename || null;

    res.json({
      success: true,
      imageUrl,
      publicId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

export default router;
