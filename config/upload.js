import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js"; 

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fitflow",            // cloudinary folder
    allowed_formats: ["jpg","png","jpeg","webp"],
    transformation: [{ width: 1000, crop: "limit" }] // optional
  }
});

const upload = multer({ storage });

export default upload;
