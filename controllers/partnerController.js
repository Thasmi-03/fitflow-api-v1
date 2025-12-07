import mongoose from "mongoose";
import { Partner } from "../models/partner.js";

export const getAllPartners = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const requestedLimit = parseInt(req.query.limit, 10) || 10;
    const MAX_LIMIT = 50;
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.name) filter.name = new RegExp(req.query.name, "i");

    const total = await Partner.countDocuments(filter);
    const data = await Partner.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPartnerById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const partner = await Partner.findById(req.params.id);
    if (!partner) return res.status(404).json({ error: "Partner not found." });
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPartner = async (req, res) => {
  try {
    const newPartner = new Partner(req.body);
    const saved = await newPartner.save();
    res.status(201).json({ message: "Partner created", partner: saved });
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

export const updatePartner = async (req, res) => {
  try {
    const updated = await Partner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: "Partner not found." });
    res.status(200).json({ message: "Partner updated", partner: updated });
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

export const deletePartner = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID format" });

    const deleted = await Partner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Partner not found." });
    res.status(200).json({ message: "Partner deleted", partner: deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import { PartnerCloth } from "../models/partnerClothes.js";

/**
 * Get partner analytics - shows all partners with their uploaded clothes
 * Admin only endpoint
 */
export const getPartnerAnalytics = async (req, res) => {
  try {
    // Get all partners
    const partners = await Partner.find().sort({ createdAt: -1 });

    // For each partner, get their clothes
    const partnerAnalytics = await Promise.all(
      partners.map(async (partner) => {
        const clothes = await PartnerCloth.find({ ownerId: partner._id })
          .sort({ createdAt: -1 })
          .select('name category price image createdAt visibility stock sales brand color size gender occasion description suitableSkinTones');

        return {
          _id: partner._id,
          name: partner.name,
          email: partner.email,
          phone: partner.phone,
          location: partner.location || 'Not specified',
          isApproved: partner.isApproved,
          createdAt: partner.createdAt,
          totalClothes: clothes.length,
          clothes: clothes.map(cloth => ({
            _id: cloth._id,
            name: cloth.name,
            category: cloth.category,
            price: cloth.price,
            image: cloth.image,
            uploadedAt: cloth.createdAt,
            visibility: cloth.visibility,
            stock: cloth.stock || 0,
            sales: cloth.sales || 0,
            brand: cloth.brand,
            color: cloth.color,
            size: cloth.size,
            gender: cloth.gender,
            occasion: cloth.occasion,
            description: cloth.description,
            suitableSkinTones: cloth.suitableSkinTones || []
          }))
        };
      })
    );

    res.status(200).json({
      count: partnerAnalytics.length,
      partners: partnerAnalytics
    });
  } catch (error) {
    console.error("Error in getPartnerAnalytics:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

/**
 * Get analytics for the authenticated partner
 * Shows their own clothes and view counts
 */
export const getPartnerOwnAnalytics = async (req, res) => {
  try {
    const partnerId = req.user.id; // From verifyToken middleware

    // Get partner's clothes
    const clothes = await PartnerCloth.find({ ownerId: partnerId })
      .sort({ createdAt: -1 })
      .select('name category price image createdAt visibility stock sales brand color size gender occasion description suitableSkinTones views');

    const analyticsData = clothes.map(cloth => ({
      _id: cloth._id,
      name: cloth.name,
      category: cloth.category,
      price: cloth.price,
      image: cloth.image,
      uploadedAt: cloth.createdAt,
      visibility: cloth.visibility,
      stock: cloth.stock || 0,
      sales: cloth.sales || 0,
      brand: cloth.brand,
      color: cloth.color,
      size: cloth.size,
      gender: cloth.gender,
      occasion: cloth.occasion,
      description: cloth.description,
      suitableSkinTones: cloth.suitableSkinTones || [],
      viewCount: cloth.views ? cloth.views.length : 0
    }));

    res.status(200).json({
      count: analyticsData.length,
      clothes: analyticsData
    });
  } catch (error) {
    console.error("Error in getPartnerOwnAnalytics:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};
