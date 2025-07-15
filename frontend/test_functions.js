// Test script for Node.js environment
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

console.log("env variables: ", import.meta.env);

// Get API key from environment variable
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn(
    "VITE_OPENAI_API_KEY is not set. Please add your OpenAI API key to .env file"
  );
}

// Mock browser environment
global.import = { meta: { env: process.env } };

// Import the API functions
import { loadAndProcessPDF } from "./src/config/api.js";

async function test() {
  try {
    console.log("Testing PDF processing...");
    const result = await loadAndProcessPDF();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
