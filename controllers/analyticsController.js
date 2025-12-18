import { WearHistory } from "../models/wearHistory.js";
import { StylerClothes } from "../models/stylerClothes.js";
import mongoose from "mongoose";

// 1. Record when a dress is worn
export const recordWear = async (req, res, next) => {
  try {
    const { dressId, color, category, date } = req.body;
    const userId = req.user.id;

    if (!dressId || !color || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create wear record
    const wearRecord = new WearHistory({
      dressId,
      userId,
      color,
      category,
      wornAt: date || new Date()
    });

    await wearRecord.save();

    // Increment usage count in StylerClothes
    await StylerClothes.findByIdAndUpdate(dressId, { $inc: { usageCount: 1 } });

    res.status(201).json({ message: "Wear recorded successfully", data: wearRecord });
  } catch (error) {
    next(error);
  }
};

// 2. Get Closet Health & Analytics
export const getClosetHealth = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch all clothes for the user
    const clothes = await StylerClothes.find({ ownerId: userId });
    const totalClothes = clothes.length;

    if (totalClothes === 0) {
      return res.status(200).json({
        score: 0,
        stats: {
          total: 0,
          worn: 0,
          unused: 0,
          colors: [],
          categories: []
        },
        suggestions: ["Start adding clothes to your wardrobe!"]
      });
    }

    // --- Analysis ---

    // 1. Unused Clothes (Not worn in last 30 days or usageCount = 0)
    // For simplicity, we'll check usageCount first. If > 0, we check last worn date from history.
    // Since we just added tracking, existing clothes might have usageCount=0.
    // We will define "Unused" as usageCount == 0 OR last worn > 30 days ago.
    
    // To get last worn date efficiently, we can aggregate WearHistory or just rely on usageCount for now if history is sparse.
    // Let's do a quick aggregation to get last worn date for all items.
    const lastWornMap = new Map();
    const history = await WearHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$dressId",
          lastWorn: { $max: "$wornAt" }
        }
      }
    ]);
    
    history.forEach(h => lastWornMap.set(h._id.toString(), h.lastWorn));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let unusedCount = 0;
    const colorCounts = {};
    const categoryCounts = {};

    clothes.forEach(item => {
      // Color Analysis
      const color = item.color.toLowerCase();
      colorCounts[color] = (colorCounts[color] || 0) + 1;

      // Category Analysis
      const category = item.category.toLowerCase();
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      // Unused Analysis
      const lastWorn = lastWornMap.get(item._id.toString());
      // If never worn (usageCount 0) or last worn > 30 days ago
      if (item.usageCount === 0 || (lastWorn && new Date(lastWorn) < thirtyDaysAgo)) {
        unusedCount++;
      }
    });

    const wornCount = totalClothes - unusedCount;

    // --- Score Calculation ---
    let score = 100;
    const suggestions = [];

    // Deduct for unused clothes
    const unusedPercentage = (unusedCount / totalClothes) * 100;
    if (unusedPercentage > 50) {
      score -= 20;
      suggestions.push(`You have ${unusedCount} unused items. Try wearing them more often.`);
    } else if (unusedPercentage > 20) {
      score -= 10;
      suggestions.push("Consider donating or wearing your unused clothes.");
    }

    // Deduct for lack of color variety
    const totalColors = Object.keys(colorCounts).length;
    const maxColorCount = Math.max(...Object.values(colorCounts));
    const maxColorName = Object.keys(colorCounts).find(c => colorCounts[c] === maxColorCount);
    
    if (totalColors < 3 && totalClothes > 5) {
      score -= 15;
      suggestions.push("Your wardrobe lacks color variety. Try adding more colorful items.");
    }
    
    if ((maxColorCount / totalClothes) > 0.4 && totalClothes > 5) {
      score -= 10;
      suggestions.push(`You have a lot of ${maxColorName} clothes. Add some variety!`);
    }

    // Deduct for category imbalance
    const categories = Object.keys(categoryCounts);
    if (categories.length < 3 && totalClothes > 5) {
      score -= 10;
      suggestions.push("Try diversifying your wardrobe with different types of clothes.");
    }

    // Cap score
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Format Data for Frontend
    const colorData = Object.entries(colorCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const categoryData = Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    res.status(200).json({
      score,
      stats: {
        total: totalClothes,
        worn: wornCount,
        unused: unusedCount,
        colors: colorData,
        categories: categoryData
      },
      suggestions
    });

  } catch (error) {
    next(error);
  }
};
