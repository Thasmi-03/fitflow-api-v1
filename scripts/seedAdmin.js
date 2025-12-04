import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { User } from "../models/user.js";

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const email = "admin@gmail.com";
    const password = "admin@123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin user already exists!");

      // Update existing admin to be approved and reset password
      existingAdmin.isApproved = true;
      existingAdmin.password = password; // Let the pre-save hook hash it
      await existingAdmin.save();

      console.log("✓ Admin user updated!");
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`isApproved: ${existingAdmin.isApproved}`);
      process.exit(0);
    }

    // Create new admin user
    // Note: Don't hash password manually - let the pre-save hook in the schema handle it
    const admin = new User({
      email,
      password, // Will be automatically hashed by the pre-save hook
      role: "admin",
      isApproved: true, // First admin is auto-approved
    });

    await admin.save();
    console.log("✓ Admin created successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: admin`);
    console.log(`isApproved: true`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    if (err.code === 11000) {
      console.error("Admin with this email already exists!");
    }
    process.exit(1);
  }
};

createAdmin();
