import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return; // already connected
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected Successfully!");
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
