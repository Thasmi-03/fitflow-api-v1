import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

export const getDressSuggestions = async (req, res) => {
  try {
    const { skinTone } = req.body;

    if (!skinTone) {
      return res.status(400).json({ message: "Skin tone is required" });
    }

    if (!process.env.VERTEX_API_KEY) {
        console.error("VERTEX_API_KEY is missing");
        return res.status(500).json({ message: "Server configuration error: API key missing" });
    }

    const genAI = new GoogleGenerativeAI(process.env.VERTEX_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Suggest suitable dress colors for a person with ${skinTone} skin tone. Return ONLY a JSON object with this structure: { "recommendedColors": ["color1", "color2", "color3", "color4", "color5"], "advice": "short advice (max 2 sentences)" }. Do not include markdown formatting or backticks.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the text if it contains markdown code blocks
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
        const jsonResponse = JSON.parse(cleanText);
        res.status(200).json(jsonResponse);
    } catch (parseError) {
        console.error("Error parsing AI response:", cleanText);
        res.status(500).json({ message: "Failed to parse AI suggestions", raw: text });
    }

  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    res.status(500).json({ 
      message: "Failed to get suggestions", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const detectSkinTone = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    console.log("[detectSkinTone] Request received for imageUrl:", imageUrl?.substring(0, 100) + "...");

    if (!imageUrl) {
      console.error("[detectSkinTone] Missing imageUrl in request");
      return res.status(400).json({ message: "Image URL is required" });
    }

    if (!process.env.VERTEX_API_KEY) {
      console.error("[detectSkinTone] VERTEX_API_KEY environment variable is missing");
      return res.status(500).json({ 
        message: "Server configuration error: API key missing",
        hint: "Please ensure VERTEX_API_KEY is configured in environment variables"
      });
    }

    console.log("[detectSkinTone] Initializing Gemini AI model...");
    const genAI = new GoogleGenerativeAI(process.env.VERTEX_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Fetch the image and convert to base64 with timeout
    console.log("[detectSkinTone] Fetching image from URL...");
    let imageResponse;
    try {
      imageResponse = await axios.get(imageUrl, { 
        responseType: 'arraybuffer',
        timeout: 10000, // 10 second timeout
        maxContentLength: 10 * 1024 * 1024, // 10MB max
      });
      console.log("[detectSkinTone] Image fetched successfully, size:", imageResponse.data.length, "bytes");
    } catch (fetchError) {
      console.error("[detectSkinTone] Failed to fetch image:", fetchError.message);
      return res.status(400).json({ 
        message: "Failed to fetch image from URL",
        error: fetchError.message,
        hint: "Ensure the image URL is publicly accessible"
      });
    }

    const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
    const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';
    console.log("[detectSkinTone] Image converted to base64, mimeType:", mimeType);

    const prompt = `Analyze this person's skin tone in the image and classify it into ONE of these categories ONLY: fair, light, medium, tan, deep, dark, reddish, olive, pale.

Return ONLY a JSON object with this exact structure (no markdown, no backticks):
{
  "skinTone": "one of the categories above",
  "confidence": "high|medium|low"
}`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    };

    console.log("[detectSkinTone] Sending request to Gemini API...");
    let result;
    try {
      result = await model.generateContent([prompt, imagePart]);
    } catch (apiError) {
      console.error("[detectSkinTone] Gemini API error:", apiError.message);
      return res.status(500).json({ 
        message: "AI service error",
        error: apiError.message,
        hint: "Check API key validity and quota limits"
      });
    }

    const response = await result.response;
    const text = response.text();
    console.log("[detectSkinTone] Received AI response:", text);

    // Clean up the text if it contains markdown code blocks
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const jsonResponse = JSON.parse(cleanText);
      console.log("[detectSkinTone] Successfully parsed response:", jsonResponse);
      res.status(200).json(jsonResponse);
    } catch (parseError) {
      console.error("[detectSkinTone] Error parsing AI response:", cleanText);
      res.status(500).json({ 
        message: "Failed to parse skin tone detection", 
        raw: text,
        hint: "The AI returned an unexpected format"
      });
    }

  } catch (error) {
    console.error("[detectSkinTone] Unexpected error:", error);
    console.error("[detectSkinTone] Error stack:", error.stack);
    console.error("[detectSkinTone] Error message:", error.message);
    res.status(500).json({ 
      message: "Failed to detect skin tone", 
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error",
      type: error.name
    });
  }
};
