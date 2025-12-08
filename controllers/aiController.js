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
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    if (!process.env.VERTEX_API_KEY) {
      console.error("VERTEX_API_KEY is missing");
      return res.status(500).json({ message: "Server configuration error: API key missing" });
    }

    const genAI = new GoogleGenerativeAI(process.env.VERTEX_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Fetch the image and convert to base64
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(imageResponse.data, 'binary').toString('base64');
    const mimeType = imageResponse.headers['content-type'] || 'image/jpeg';

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

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Clean up the text if it contains markdown code blocks
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const jsonResponse = JSON.parse(cleanText);
      res.status(200).json(jsonResponse);
    } catch (parseError) {
      console.error("Error parsing AI response:", cleanText);
      res.status(500).json({ message: "Failed to parse skin tone detection", raw: text });
    }

  } catch (error) {
    console.error("Error detecting skin tone:", error);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    res.status(500).json({ 
      message: "Failed to detect skin tone", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};
