import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import stylerclothesRoutes from "./routes/stylerClothesRoutes.js";
import partnerclothesRoutes from "./routes/partnerClothesRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import stylerRoutes from "./routes/stylerRoutes.js";
import partnersPublicRoutes from "./routes/partnersPublicRoutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import occasionRoutes from "./routes/occasionRoutes.js";

// Cloudinary upload route
import uploadRoute from "./routes/uploadRoute.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// DB connect
connectDB().then(() => console.log("DB Connected Successfully!"));

// Health check
app.get("/", (req, res) => res.send("API running"));

// ===== Public routes =====
app.use("/api/auth", authRoutes);
app.use("/api/partners/public", partnersPublicRoutes);

// ===== Protected / Admin routes =====
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/stylerclothes", stylerclothesRoutes);
app.use("/api/partnerclothes", partnerclothesRoutes);
app.use("/api/styler", stylerRoutes);
app.use("/api/occasion", occasionRoutes);

// ===== Cloudinary upload route =====
// Serve uploaded files statically
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/api/uploads", express.static(join(__dirname, 'uploads')));

app.use("/api/upload", uploadRoute);

// Error handler (last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
