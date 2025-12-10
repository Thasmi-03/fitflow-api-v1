// controllers/stylerClothesController.js
import mongoose from "mongoose";
import { StylerClothes } from "../models/stylerClothes.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getMyStylerClothes = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { search, category, color, minPrice, maxPrice, skinTone, page = 1, limit = 10 } = req.query;

    // --- SAFER ownerId creation: use `new` and validate ---
    if (!isValidObjectId(req.user._id)) {
      console.warn("getMyStylerClothes: req.user._id is not a valid ObjectId:", req.user._id);
      return res.status(400).json({ error: "Invalid user id" });
    }
    const ownerId = new mongoose.Types.ObjectId(String(req.user._id));

    // rely on ownerId only (schema doesn't have ownerType)
    const filter = { ownerId };

    if (category) filter.category = category;
    if (color) filter.color = color;
    // skinTone is now an array, MongoDB will match if the value is in the array
    if (skinTone) filter.skinTone = skinTone;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (search) filter.name = { $regex: search, $options: "i" };

    console.log("getMyStylerClothes filter:", JSON.stringify(filter));

    const skip = (Number(page) - 1) * Number(limit);

    const clothes = await StylerClothes.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await StylerClothes.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit) || 1);

    res.status(200).json({ page: Number(page), limit: Number(limit), total, totalPages, clothes });
  } catch (error) {
    console.error("getMyStylerClothes error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getStylerClothById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const cloth = await StylerClothes.findById(id);
    if (!cloth) return res.status(404).json({ error: "Cloth not found" });

    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const isOwner = String(cloth.ownerId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    res.status(200).json({ cloth });
  } catch (error) {
    console.error("getStylerClothById error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createStylerCloth = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== "styler") return res.status(403).json({ error: "Styler role required" });

    // Log incoming data for debugging
    console.log("createStylerCloth - Request body:", JSON.stringify(req.body, null, 2));
    console.log("createStylerCloth - User:", req.user._id, req.user.role);

    const { name, color, category, price, image, visibility, skinTone, gender, age, note, occasion } = req.body;
    if (!name || !color || !category) {
      console.warn("createStylerCloth: Missing required fields", { name, color, category });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure ownerId is valid ObjectId
    if (!isValidObjectId(req.user._id)) {
      console.warn("createStylerCloth: req.user._id is not a valid ObjectId:", req.user._id);
      return res.status(400).json({ error: "Invalid user id" });
    }
    const ownerId = new mongoose.Types.ObjectId(String(req.user._id));

    // Validate occasion array
    const occasionValue = occasion && Array.isArray(occasion) && occasion.length > 0 ? occasion : ["casual"];
    console.log("createStylerCloth - Occasion value:", occasionValue);

    const clothData = {
      name,
      color,
      category,
      price: price || 0,
      image: image || undefined,
      skinTone: skinTone || undefined,
      gender: gender || undefined,
      age: age || undefined,
      note: note || undefined,
      occasion: occasionValue,
      ownerId, // pass ObjectId instance
      visibility: visibility || "private",
    };

    console.log("createStylerCloth - Creating cloth with data:", JSON.stringify(clothData, null, 2));

    const cloth = new StylerClothes(clothData);
    const saved = await cloth.save();
    
    console.log("createStylerCloth - Successfully created cloth:", saved._id);
    res.status(201).json({ message: "Cloth created", cloth: saved });
  } catch (error) {
    console.error("createStylerCloth error:", error);
    console.error("createStylerCloth error name:", error.name);
    console.error("createStylerCloth error message:", error.message);
    if (error.errors) {
      console.error("createStylerCloth validation errors:", JSON.stringify(error.errors, null, 2));
    }
    res.status(500).json({ 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined
    });
  }
};

export const updateStylerCloth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const cloth = await StylerClothes.findById(id);
    if (!cloth) return res.status(404).json({ error: "Cloth not found" });

    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const isOwner = String(cloth.ownerId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    // Log incoming data for debugging
    console.log("updateStylerCloth - Request body:", JSON.stringify(req.body, null, 2));
    console.log("updateStylerCloth - Existing cloth:", JSON.stringify(cloth, null, 2));

    // Filter out undefined values to prevent validation issues
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== '') {
        updateData[key] = req.body[key];
      }
    });

    console.log("updateStylerCloth - Filtered update data:", JSON.stringify(updateData, null, 2));

    const updated = await StylerClothes.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    res.status(200).json({ message: "Cloth updated", cloth: updated });
  } catch (error) {
    console.error("updateStylerCloth error:", error);
    console.error("updateStylerCloth error name:", error.name);
    console.error("updateStylerCloth error message:", error.message);
    if (error.errors) {
      console.error("updateStylerCloth validation errors:", JSON.stringify(error.errors, null, 2));
    }
    res.status(500).json({ 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined
    });
  }
};

export const deleteStylerCloth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid ID" });

    const cloth = await StylerClothes.findById(id);
    if (!cloth) return res.status(404).json({ error: "Cloth not found" });

    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const isOwner = String(cloth.ownerId) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

    await StylerClothes.findByIdAndDelete(id);
    res.status(200).json({ message: "Cloth deleted successfully" });
  } catch (error) {
    console.error("deleteStylerCloth error:", error);
    res.status(500).json({ error: error.message });
  }
};
