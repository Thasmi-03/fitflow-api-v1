import mongoose from "mongoose";
import { Payment } from "../models/payment.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ===== Build filter from query (status, user, search, date range) =====
const buildPaymentFilter = (query, user) => {
  const filters = [];

  // User role: admin sees all, others see own
  if (user.role !== "admin") {
    filters.push({ userId: user._id });
  } else if (query.user && isValidObjectId(query.user)) {
    filters.push({ userId: query.user });
  }

  // Filter by status
  if (query.status) filters.push({ status: query.status });

  // Search: description, method, currency
  if (query.search) {
    const q = query.search.trim();
    filters.push({
      $or: [
        { description: { $regex: q, $options: "i" } },
        { method: { $regex: q, $options: "i" } },
        { currency: { $regex: q, $options: "i" } },
      ],
    });
  }

  // --- Date filtering: from, to (range) and date (single day) ---
  const makeValidDate = (s) => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  // If `date` provided => treat as that whole day
  if (query.date) {
    const d = makeValidDate(query.date);
    if (d) {
      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);
      filters.push({ createdAt: { $gte: start, $lte: end } });
    }
  } else {
    // from / to range
    const dateFilter = {};
    if (query.from) {
      const from = makeValidDate(query.from);
      if (from) {
        // if string was date-only (YYYY-MM-DD) it's at 00:00:00, which is fine for $gte
        dateFilter.$gte = from;
      }
    }
    if (query.to) {
      const to = makeValidDate(query.to);
      if (to) {
        // if user passed date-only (YYYY-MM-DD) convert to end of day to be inclusive
        if (/^\d{4}-\d{2}-\d{2}$/.test(query.to)) {
          to.setHours(23, 59, 59, 999);
        }
        dateFilter.$lte = to;
      }
    }
    if (Object.keys(dateFilter).length) {
      filters.push({ createdAt: dateFilter });
    }
  }

  if (filters.length === 0) return {};
  if (filters.length === 1) return filters[0];
  return { $and: filters };
};

// ===== PAGINATION HELPER =====
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(Math.max(1, parseInt(query.limit || "10", 10)), 50);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

// ===== CREATE PAYMENT =====
export const createPayment = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { amount, currency, method, status, description } = req.body || {};

    if (amount === undefined || amount === null)
      return res.status(400).json({ error: "Missing required field: amount" });

    const payment = new Payment({
      userId: req.user._id,
      amount: Number(amount),
      currency: currency || "USD",
      method: method || "card",
      status: status || "pending",
      description: description || "",
    });

    const saved = await payment.save();
    const populated = await Payment.findById(saved._id).populate("userId", "-password");

    res.status(201).json({ message: "Payment created", payment: populated });
  } catch (error) {
    console.error("createPayment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== GET ALL PAYMENTS (with pagination, filter, search) =====
export const getAllPayments = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { page, limit, skip } = parsePagination(req.query);
    const filter = buildPaymentFilter(req.query, req.user);

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("userId", "-password")
      .lean();

    res.status(200).json({
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data: payments,
    });
  } catch (error) {
    console.error("getAllPayments error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== GET PAYMENT BY ID =====
export const getPaymentById = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const payment = await Payment.findById(id).populate("userId", "-password");
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    // Only admin or owner can view
    if (req.user.role !== "admin" && String(payment.userId._id) !== String(req.user._id))
      return res.status(403).json({ error: "Forbidden" });

    res.status(200).json(payment);
  } catch (error) {
    console.error("getPaymentById error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== UPDATE PAYMENT =====
export const updatePayment = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    if (req.user.role !== "admin" && String(payment.userId) !== String(req.user._id))
      return res.status(403).json({ error: "Forbidden" });

    const updated = await Payment.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate("userId", "-password");

    res.status(200).json({ message: "Payment updated", payment: updated });
  } catch (error) {
    console.error("updatePayment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ===== DELETE PAYMENT =====
export const deletePayment = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    if (req.user.role !== "admin" && String(payment.userId) !== String(req.user._id))
      return res.status(403).json({ error: "Forbidden" });

    await Payment.findByIdAndDelete(id);
    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("deletePayment error:", error);
    res.status(500).json({ error: error.message });
  }
};
