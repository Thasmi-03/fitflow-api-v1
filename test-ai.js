import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testAI() {
  try {
    console.log("Testing Google Generative AI...");
    console.log("API Key present:", !!process.env.VERTEX_API_KEY);
    
    const genAI = new GoogleGenerativeAI(process.env.VERTEX_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Suggest suitable dress colors for a person with medium skin tone. Return ONLY a JSON object with this structure: { "recommendedColors": ["color1", "color2", "color3", "color4", "color5"], "advice": "short advice (max 2 sentences)" }. Do not include markdown formatting or backticks.`;
    
    console.log("Sending request to AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("AI Response:", text);
    
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonResponse = JSON.parse(cleanText);
    
    console.log("Parsed JSON:", jsonResponse);
    console.log("✓ Test successful!");
    
  } catch (error) {
    console.error("✗ Test failed!");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

testAI();
