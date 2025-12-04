import { Styler } from "../models/styler.js";
import mongoose from "mongoose";

export const getAllStylers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.name) filter.name = { $regex: req.query.name, $options: "i" };
    if (req.query.country) filter.country = req.query.country;
    if (req.query.gender) filter.gender = req.query.gender;

    const total = await Styler.countDocuments(filter);

    const stylers = await Styler.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: stylers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a styler by ID
export const getStylerById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const styler = await Styler.findById(req.params.id);

    if (!styler) return res.status(404).json({ error: "Styler not found." });

    res.status(200).json(styler);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new styler
export const createStyler = async (req, res) => {
  try {
    const newStyler = new Styler(req.body);
    const savedStyler = await newStyler.save();
    res.status(201).json({ message: "Styler created", styler: savedStyler });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => {
        const message = e.message;
        if (message.includes("is required")) {
          return message.replace(/Path `(.+)` is required\./, "$1 is required");
        }
        return message;
      });
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update a styler by ID
export const updateStyler = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const updatedStyler = await Styler.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedStyler) return res.status(404).json({ error: "Styler not found." });

    res.status(200).json({ message: "Styler updated", styler: updatedStyler });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => {
        const message = e.message;
        if (message.includes("is required")) {
          return message.replace(/Path `(.+)` is required\./, "$1 is required");
        }
        return message;
      });
      return res.status(400).json({ error: errors.join(", ") });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete a styler by ID
export const deleteStyler = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const deletedStyler = await Styler.findByIdAndDelete(req.params.id);

    if (!deletedStyler) return res.status(404).json({ error: "Styler not found." });

    res.status(200).json({ message: "Styler deleted", styler: deletedStyler });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
