import { initializeRAG } from "./server.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await initializeRAG();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error initializing RAG:", error);
    res.status(500).json({ error: error.message });
  }
}
