import { generateResponse } from "./server.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query, conversationHistory = [] } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const result = await generateResponse(query, conversationHistory);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: error.message });
  }
}
