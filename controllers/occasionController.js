import { Occasion } from "../models/occasion.js";
import { StylerClothes } from "../models/stylerClothes.js";
import { Styler } from "../models/styler.js";

/**
 * Create a new occasion/outfit
 */
export const createOccasion = async (req, res) => {
  try {
    const { title, type, date, location, dressCode, notes, skinTone, clothesList } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!title || !date) {
      return res.status(400).json({ error: "Title and date are required" });
    }

    const occasion = new Occasion({
      userId,
      title,
      type: type || "other",
      date,
      location,
      dressCode,
      notes,
      skinTone,
      clothesList: clothesList || []
    });

    await occasion.save();
    
    // Populate clothesList before returning
    await occasion.populate('clothesList');

    res.status(201).json({ occasion });
  } catch (error) {
    console.error("Error in createOccasion:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all occasions for the authenticated user
 */
export const getAllOccasions = async (req, res) => {
  try {
    const userId = req.user._id;

    const occasions = await Occasion.find({ userId })
      .populate('clothesList')
      .sort({ date: -1 });

    res.status(200).json({ data: occasions });
  } catch (error) {
    console.error("Error in getAllOccasions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get a single occasion by ID
 */
export const getOccasionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const occasion = await Occasion.findOne({ _id: id, userId })
      .populate('clothesList');

    if (!occasion) {
      return res.status(404).json({ error: "Occasion not found" });
    }

    res.status(200).json({ occasion });
  } catch (error) {
    console.error("Error in getOccasionById:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update an occasion
 */
export const updateOccasion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { title, type, date, location, dressCode, notes, skinTone, clothesList } = req.body;

    const occasion = await Occasion.findOne({ _id: id, userId });

    if (!occasion) {
      return res.status(404).json({ error: "Occasion not found" });
    }

    // Update fields if provided
    if (title !== undefined) occasion.title = title;
    if (type !== undefined) occasion.type = type;
    if (date !== undefined) occasion.date = date;
    if (location !== undefined) occasion.location = location;
    if (dressCode !== undefined) occasion.dressCode = dressCode;
    if (notes !== undefined) occasion.notes = notes;
    if (skinTone !== undefined) occasion.skinTone = skinTone;
    if (clothesList !== undefined) occasion.clothesList = clothesList;

    await occasion.save();
    await occasion.populate('clothesList');

    res.status(200).json({ occasion });
  } catch (error) {
    console.error("Error in updateOccasion:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete an occasion
 */
export const deleteOccasion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const occasion = await Occasion.findOneAndDelete({ _id: id, userId });

    if (!occasion) {
      return res.status(404).json({ error: "Occasion not found" });
    }

    res.status(200).json({ message: "Occasion deleted successfully" });
  } catch (error) {
    console.error("Error in deleteOccasion:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get dress suggestions for an occasion based on type and user gender
 */
export const getOccasionSuggestions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the occasion
    const occasion = await Occasion.findOne({ _id: id, userId });

    if (!occasion) {
      return res.status(404).json({ error: "Occasion not found" });
    }

    // Get user's gender from Styler model (if available)
    const styler = await Styler.findById(userId);
    const userGender = styler?.gender;

    // Import PartnerCloth and Partner models
    const { PartnerCloth } = await import("../models/partnerClothes.js");
    const { Partner } = await import("../models/partner.js");

    // Build query to find matching clothes from Partner inventory
    const query = {
      visibility: "public",
      occasion: occasion.type
    };

    // Gender filter
    if (userGender && userGender !== 'other') {
      query.$or = [
        { gender: userGender },
        { gender: 'unisex' },
        { gender: { $exists: false } }
      ];
    }

    // Skin tone filter (if user has one)
    if (styler?.skinTone) {
      // PartnerCloth has 'suitableSkinTones' as an array
      const skinToneQuery = {
        $or: [
          { suitableSkinTones: styler.skinTone },
          { suitableSkinTones: { $size: 0 } },
          { suitableSkinTones: { $exists: false } }
        ]
      };
      
      if (query.$or) {
        // If we already have an $or for gender, we need to use $and to combine them
        query.$and = [
          { $or: query.$or },
          skinToneQuery
        ];
        delete query.$or;
      } else {
        Object.assign(query, skinToneQuery);
      }
    }

    // Find matching clothes from partner inventory
    const suggestions = await PartnerCloth.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    // Get unique partner IDs
    const partnerIds = [...new Set(suggestions.map(cloth => cloth.ownerId))];
    
    // Fetch partner details
    const partners = await Partner.find({ _id: { $in: partnerIds } });
    const partnerMap = {};
    partners.forEach(partner => {
      partnerMap[partner._id.toString()] = partner;
    });

    // Format suggestions with partner details
    const formattedSuggestions = suggestions.map(cloth => {
      const partner = partnerMap[cloth.ownerId?.toString()];
      return {
        _id: cloth._id,
        name: cloth.name,
        category: cloth.category,
        color: cloth.color,
        image: cloth.image,
        gender: cloth.gender,
        price: cloth.price,
        brand: cloth.brand,
        matchReason: `Matches ${occasion.type}${styler?.skinTone ? ` & suitable for ${styler.skinTone} skin tone` : ''}`,
        partner: partner ? {
          _id: partner._id,
          name: partner.name,
          location: partner.location || 'Location not specified',
          phone: partner.phone || 'N/A',
          email: partner.email
        } : null
      };
    });

    res.status(200).json({ 
      suggestions: formattedSuggestions,
      occasion: {
        title: occasion.title,
        type: occasion.type,
        date: occasion.date
      },
      userGender: userGender || 'not set'
    });
  } catch (error) {
    console.error("Error in getOccasionSuggestions:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};
