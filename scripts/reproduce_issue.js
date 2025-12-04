import mongoose from "mongoose";
import "dotenv/config";
import { getOccasionSuggestions } from "../controllers/occasionController.js";
import { Occasion } from "../models/occasion.js";

// Mock Express Request and Response
const mockReq = (userId, occasionId) => ({
  user: { _id: userId },
  params: { id: occasionId }
});

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

const reproduce = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const userId = "692815a6235f8ead6f839a0f";
    
    // Find a wedding occasion for this user
    const occasion = await Occasion.findOne({ userId, type: "wedding" });
    
    if (!occasion) {
      console.log("No wedding occasion found for user. Creating one...");
      // Create one if not exists (though debug showed one)
      // For now just exit if not found to be safe
      console.error("Please create a wedding occasion first.");
      process.exit(1);
    }

    console.log(`Testing with Occasion ID: ${occasion._id} (Type: ${occasion.type})`);

    const req = mockReq(userId, occasion._id);
    const res = mockRes();

    await getOccasionSuggestions(req, res);

    console.log("\n=== Response ===");
    console.log(`Status: ${res.statusCode}`);
    if (res.body && res.body.suggestions) {
      console.log(`Suggestions count: ${res.body.suggestions.length}`);
      res.body.suggestions.forEach(s => {
        console.log(`- ${s.name} (Occasion: ${s.matchReason})`);
      });
    } else {
      console.log("Body:", JSON.stringify(res.body, null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

reproduce();
