import { Partner } from "../models/partner.js";
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
