import mongoose from "mongoose";
import "dotenv/config";
import { StylerClothes } from "../models/stylerClothes.js";
import { Occasion } from "../models/occasion.js";

const inspectData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const userId = "692815a6235f8ead6f839a0f";

    console.log("\n=== Inspecting Occasions ===");
    const occasions = await Occasion.find({ userId });
    occasions.forEach(o => {
      console.log(`Title: "${o.title}", Type: "${o.type}"`);
      console.log(`Type CharCodes: ${[...o.type].map(c => c.charCodeAt(0))}`);
    });

    console.log("\n=== Inspecting Clothes ===");
    const clothes = await StylerClothes.find({ ownerId: userId });
    clothes.forEach(c => {
      console.log(`Name: "${c.name}", Occasion: "${c.occasion}"`);
      if (c.occasion) {
        console.log(`Occasion CharCodes: ${[...c.occasion].map(c => c.charCodeAt(0))}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

inspectData();
