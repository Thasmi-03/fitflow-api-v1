// routes/upload.js
import express from "express";
import upload from "../config/uploadMemory.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const router = express.Router();

// Single file upload field name = "image" (make sure frontend uses name "image")
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Check for Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Missing Cloudinary configuration");
      return res.status(500).json({ 
        success: false, 
        message: "Missing Cloudinary configuration on server",
        details: "Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel settings."
      });
    }

    // Upload buffer to Cloudinary
    const result = await uploadBufferToCloudinary(req.file.buffer, "fitflow");
    // result.secure_url contains the hosted image
    return res.json({
      success: true,
      imageUrl: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ 
        success: false, 
        message: err.message || "Upload failed", 
        details: err.error ? err.error.message : (err.message || "Unknown error"),
        fullError: JSON.stringify(err, Object.getOwnPropertyNames(err))
    });
  }
});

export default router;
