import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function testAI() {
  console.log("Testing Google Generative AI...");
  
  const apiKey = process.env.VERTEX_API_KEY;
  if (!apiKey) {
    console.error("Error: VERTEX_API_KEY is missing in .env");
    return;
  }
  console.log("API Key found (length):", apiKey.length);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = "gemini-flash-latest";
    console.log(`Testing generation with model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    console.log("Success! Response:", text);

  } catch (error) {
    console.error("Error testing AI:", error.message);
    if (error.response) {
       // console.error("Error details:", JSON.stringify(error.response, null, 2));
    }
  }
}

testAI();
