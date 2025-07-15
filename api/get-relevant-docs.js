import { getRelevantDocuments } from "./server.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const documents = await getRelevantDocuments(query);
    res.status(200).json({ documents });
  } catch (error) {
    console.error("Error retrieving documents:", error);
    res.status(500).json({ error: error.message });
  }
}
