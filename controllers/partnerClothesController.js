// server/Api/controllers/partnerClothesController.js
import mongoose from "mongoose";
import { PartnerCloth } from "../models/partnerClothes.js";

/** Check if valid ObjectId */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Pagination helper */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || "10", 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/** Parse sort string */
const parseSort = (sortStr) => {
  if (!sortStr) return { createdAt: -1 };
  const sort = {};
  sortStr.split(",").forEach((part) => {
    const [field, dir] = part.split(":").map((s) => s.trim());
    if (!field) return;
    sort[field] = dir === "asc" ? 1 : -1;
  });
  return sort;
};

/** Build filter from query */
const buildFilterFromQuery = (query, extras = {}) => {
  const filters = [];
  if (extras && Object.keys(extras).length) filters.push(extras);

  if (query.search) {
    const q = query.search.trim();
    filters.push({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { color: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    });
  }

  if (query.color) filters.push({ color: { $regex: query.color.trim(), $options: "i" } });
  if (query.category) filters.push({ category: { $regex: query.category.trim(), $options: "i" } });

  if (query.minPrice || query.maxPrice) {
    const price = {};
    if (query.minPrice) price.$gte = Number(query.minPrice);
    if (query.maxPrice) price.$lte = Number(query.maxPrice);
    filters.push({ price });
  }

  if (filters.length === 1) return filters[0];
  if (filters.length > 1) return { $and: filters };
  return {};
};

/** Create cloth (partner only) */
export const createCloth = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== "partner") return res.status(403).json({ error: "Partner role required" });

    const { name, color, category, brand, price, image, visibility } = req.body;
    if (!name || !color || !category || !brand) return res.status(400).json({ error: "Missing required fields (name, color, category, brand)" });

    const cloth = new PartnerCloth({
      name,
      color,
      category,
      brand,
      price: price || 0,
      image: image || "https://yourcdn.com/default-cloth.jpg",
      ownerType: "partner",
      ownerId: req.user._id,
      visibility: visibility || "public",
    });

    const saved = await cloth.save();
    res.status(201).json({ message: "Cloth created", cloth: saved });
  } catch (error) {
    console.error("Error in createCloth:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

/** Get single cloth by ID */
export const getClothById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const cloth = await PartnerCloth.findById(id);
    if (!cloth) return res.status(404).json({ error: "Cloth not found" });

    // Private cloth access
    if (cloth.visibility === "private") {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const isOwner = String(cloth.ownerId) === String(req.user._id);
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json(cloth);
  } catch (error) {
    console.error("Error in getClothById:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

/** Update cloth */
export const updateCloth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const cloth = await PartnerCloth.findById(id);
    if (!cloth) return res.status(404).json({ error: "Cloth not found" });

    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const isOwner = String(cloth.ownerId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Access denied" });

    const updated = await PartnerCloth.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.status(200).json({ message: "Cloth updated", cloth: updated });
  } catch (error) {
    console.error("Error in updateCloth:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

/** Delete cloth */
export const deleteCloth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const cloth = await PartnerCloth.findById(id);
    if (!cloth) return res.status(404).json({ error: "Cloth not found" });

    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const isOwner = String(cloth.ownerId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Access denied" });

    await PartnerCloth.findByIdAndDelete(id);
    res.status(200).json({ message: "Cloth deleted" });
  } catch (error) {
    console.error("Error in deleteCloth:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

/** List public cloths */
export const getPublicCloths = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sort);
    const filter = buildFilterFromQuery(req.query, { visibility: "public", ownerType: "partner" });

    const [total, clothes] = await Promise.all([
      PartnerCloth.countDocuments(filter),
      PartnerCloth.find(filter)
        .populate('ownerId', 'name location phone email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
    ]);

    res.status(200).json({
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: clothes,
    });
  } catch (error) {
    console.error("Error in getPublicCloths:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

/** List my cloths (partner only) */
export const getMyCloths = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sort);

    const filter = buildFilterFromQuery(req.query, { ownerId: req.user._id });

    const [total, clothes] = await Promise.all([
      PartnerCloth.countDocuments(filter),
      PartnerCloth.find(filter).sort(sort).skip(skip).limit(limit),
    ]);

    res.status(200).json({
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: clothes,
    });
  } catch (error) {
    console.error("Error in getMyCloths:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

/** Get suggestions for styler */
export const getSuggestions = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== "styler") return res.status(403).json({ error: "Styler role required" });

    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query.sort);

    const filter = buildFilterFromQuery(req.query, { visibility: "public", ownerType: "partner" });

    const [total, suggestions] = await Promise.all([
      PartnerCloth.countDocuments(filter),
      PartnerCloth.find(filter).sort(sort).skip(skip).limit(limit),
    ]);

    res.status(200).json({
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: suggestions,
    });
  } catch (error) {
    console.error("Error in getSuggestions:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};
