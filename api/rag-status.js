import { isRAGReady } from "./server.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const status = await isRAGReady();
    res.status(200).json({ isReady: status });
  } catch (error) {
    console.error("Error checking RAG status:", error);
    res.status(500).json({ error: error.message });
  }
}
