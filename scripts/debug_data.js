import mongoose from "mongoose";
import "dotenv/config";
import { StylerClothes } from "../models/stylerClothes.js";
import { Occasion } from "../models/occasion.js";

const debugData = async () => {
  try {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is missing in .env");
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    console.log("\n=== Styler Clothes (My Wardrobe) ===");
    const clothes = await StylerClothes.find({}, { name: 1, occasion: 1, category: 1, ownerId: 1 });
    console.log(`Total clothes found: ${clothes.length}`);
    clothes.forEach(c => {
      console.log(`Name: "${c.name}", Occasion: "${c.occasion}", Owner: ${c.ownerId}`);
    });

    console.log("\n=== Testing Query ===");
    const userId = "692815a6235f8ead6f839a0f";
    const targetOccasion = "wedding";
    
    console.log(`Querying for ownerId: ${userId} and occasion: ${targetOccasion}`);
    const matches = await StylerClothes.find({
      ownerId: userId,
      occasion: targetOccasion
    });
    console.log(`Matches found: ${matches.length}`);
    matches.forEach(m => console.log(`- ${m.name} (Occasion: ${m.occasion})`));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

debugData();
