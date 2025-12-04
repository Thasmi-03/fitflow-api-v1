import jwt from "jsonwebtoken";
import { User } from "../models/user.js";

/**
 * Middleware to verify JWT authentication token
 * Extracts token from Authorization header and verifies it
 * Attaches user information to request object
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Check blacklist (logout invalidates tokens immediately)
    try {
      const { isTokenBlacklisted } = await import("../utils/tokenBlacklist.js");
      if (isTokenBlacklisted(token)) {
        return res.status(401).json({ error: "Token has been revoked" });
      }
    } catch (_) {}

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    // Find user by ID from token
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if user is approved (only approved users can access protected routes)
    if (!user.isApproved) {
      return res.status(403).json({
        error: "Account pending approval. Please wait for admin approval.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(500).json({ error: "Authentication failed" });
  }
};

/**
 * Middleware to optionally verify JWT authentication token
 * If token is present and valid, attaches user to request
 * If no token, proceeds without user
 * If invalid token, returns 401 (client should know their token is bad)
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return next();
    }

    // Check blacklist
    try {
      const { isTokenBlacklisted } = await import("../utils/tokenBlacklist.js");
      if (isTokenBlacklisted(token)) {
        return res.status(401).json({ error: "Token has been revoked" });
      }
    } catch (_) {}

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    const user = await User.findById(decoded.userId).select("-password");

    if (user && user.isApproved) {
      req.user = user;
    }

    next();
  } catch (error) {
    // If token is invalid, we should probably let the client know so they can refresh/logout
    // instead of treating them as a guest.
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    next();
  }
};

// Alias for clarity in routes
export const verifyToken = authenticate;

