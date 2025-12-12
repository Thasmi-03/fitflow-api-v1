import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { Styler } from "../models/styler.js";
import { Partner } from "../models/partner.js";

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" }
  );
};

/**
 * Register a new user
 * - Stylers: Auto-approved and receive token immediately
 * - First Admin: Auto-approved and receive token immediately (if no approved admins exist)
 * - Partners: Require admin approval before they can log in
 * - Subsequent Admins: Require approval from existing admin
 */
export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        error: "Email, password, and role are required",
      });
    }

    // Validate role
    if (!["styler", "partner", "admin"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Must be one of: styler, partner, admin",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Determine approval status based on role
    let isApproved = false;
    let shouldReturnToken = false;
    
    if (role === "styler") {
      // Stylers are auto-approved - no admin approval needed
      isApproved = true;
      shouldReturnToken = true;
    } else if (role === "admin") {
      // Check if this is the first admin (no approved admins exist)
      const approvedAdmins = await User.countDocuments({ 
        role: "admin", 
        isApproved: true 
      });
      
      if (approvedAdmins === 0) {
        // This is the first admin - auto-approve
        isApproved = true;
        shouldReturnToken = true;
      }
      // Subsequent admins need approval
    } else if (role === "partner") {
      // Partners need admin approval
      isApproved = false;
      shouldReturnToken = false;
    }

    // Create new user
    const newUser = new User({
      email,
      password,
      role,
      isApproved,
    });

    const savedUser = await newUser.save();

    // Create role-specific record
    if (role === "styler") {
      const { fullName, phone, address, gender, dateOfBirth } = req.body;
      const stylerData = {
        _id: savedUser._id, // Use same ID as User
        name: fullName || email.split('@')[0],
      };
      
      // Add optional fields if provided
      if (gender) stylerData.gender = gender;
      if (dateOfBirth) stylerData.dateOfBirth = new Date(dateOfBirth);
      
      const newStyler = new Styler(stylerData);
      await newStyler.save();
    } else if (role === "partner") {
      const { fullName, phone, address } = req.body;
      const newPartner = new Partner({
        _id: savedUser._id, // Use same ID as User
        email: email,
        name: fullName || email.split('@')[0],
        phone: phone || '',
        location: address || '',
      });
      await newPartner.save();
    }

    // Return user without password
    const userResponse = savedUser.toJSON();
    delete userResponse.password;

    // If user is auto-approved, return token immediately
    if (shouldReturnToken) {
      const token = generateToken(savedUser._id);
      
      const message = role === "styler" 
        ? "Styler registered successfully. You can now log in."
        : "Admin registered and approved successfully. You can now log in.";
      
      return res.status(201).json({
        message,
      }); 
    }

    // For users that need approval (partners and subsequent admins)
    res.status(201).json({
      message: "User registered successfully. Waiting for admin approval."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Login user
 * Only approved users can log in
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user by email (case-insensitive search)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(403).json({
        error: "Account pending approval. Please wait for admin approval.",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Increment login count and record login timestamp
    user.loginCount = (user.loginCount || 0) + 1;
    if (!user.loginHistory) {
      user.loginHistory = [];
    }
    user.loginHistory.push(new Date());
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Approve a user (Admin only)
 * This endpoint should be protected with admin middleware
 * Only partners and admins can be approved (stylers are auto-approved)
 */
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Stylers don't need approval - they are auto-approved on registration
    if (user.role === "styler") {
      return res.status(400).json({ 
        error: "Stylers are automatically approved and don't require manual approval." 
      });
    }

    if (user.isApproved) {
      return res.status(400).json({ error: "User is already approved" });
    }

    user.isApproved = true;
    await user.save();

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({
      message: "User approved successfully",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get pending users (Admin only)
 * Returns list of users waiting for approval (partners and admins only, not stylers)
 */
export const getPendingUsers = async (req, res) => {
  try {
    // Only get partners and admins that are pending approval  (stylers are auto-approved)
    const pendingUsers = await User.find({ 
      isApproved: false,
      role: { $in: ["partner", "admin"] }
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get pending partners (Admin only)
 */
export const getPendingPartners = async (req, res) => {
  try {
    const pendingPartners = await User.find({ 
      isApproved: false,
      role: "partner"
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: pendingPartners.length,
      users: pendingPartners,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reject a user (Admin only)
 */
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isApproved) {
      return res.status(400).json({ error: "Cannot reject an already approved user" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User rejected and removed successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    // User is already attached to req.user by authenticate middleware
    let userResponse = req.user.toJSON();
    delete userResponse.password;

    if (req.user.role === 'styler') {
        const styler = await Styler.findById(req.user._id);
        if (styler) {
            userResponse = { ...userResponse, ...styler.toJSON() };
        }
    } else if (req.user.role === 'partner') {
        const partner = await Partner.findById(req.user._id);
        if (partner) {
            userResponse = { ...userResponse, ...partner.toJSON() };
        }
    }

    res.status(200).json({
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout:blacklist current token so it cannot be used again
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(400).json({ error: "No authorization token provided" });
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    if (!token) return res.status(400).json({ error: "No token provided" });

    // Decode without verifying to read exp (signature isn't needed here)
    const decoded = jwt.decode(token);
    const exp = decoded && decoded.exp ? decoded.exp : undefined;
    const { blacklistToken } = await import("../utils/tokenBlacklist.js");
    blacklistToken(token, exp);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

