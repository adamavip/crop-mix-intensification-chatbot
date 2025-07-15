const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; //|| "http://localhost:3001";

// Function to initialize RAG system
export const initializeRAG = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/init-rag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to initialize RAG system");
    }

    const result = await response.json();
    console.log("RAG system initialized:", result);
    return result;
  } catch (error) {
    console.error("Error initializing RAG:", error);
    throw error;
  }
};

// Function to check if RAG is ready
export const isRAGReady = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/rag-status`);
    if (!response.ok) {
      return false;
    }
    const status = await response.json();
    return status.isReady;
  } catch (error) {
    console.error("Error checking RAG status:", error);
    return false;
  }
};

// Function to get relevant documents for a query
export const getRelevantDocumentsWithPages = async (query) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/get-relevant-docs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error("Failed to retrieve documents");
    }

    const result = await response.json();
    console.log(
      `Retrieved ${result.documents.length} relevant documents for query: "${query}"`
    );

    return result.documents;
  } catch (error) {
    console.error("Error retrieving documents:", error);
    return [];
  }
};

// Function to generate AI response with RAG
export const generateResponse = async (query, conversationHistory = []) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, conversationHistory }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate response");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};

// Function to generate streaming AI response with RAG
export const generateStreamingResponse = async (
  query,
  conversationHistory = [],
  onChunk,
  onComplete,
  onError
) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, conversationHistory }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate response");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              onError(data.error);
              return;
            }

            if (data.done) {
              onComplete(data);
              return;
            }

            if (data.content) {
              onChunk(data.content);
            }
          } catch (e) {
            console.error("Error parsing SSE data:", e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error generating streaming response:", error);
    onError(error.message);
  }
};

// System prompt for crop mix intensification
export const SYSTEM_PROMPT = `
You are an expert assistant specializing in sustainable intensification practices for smallholder farmers in Zambia, based on the Sustainable Intensification Practices for Smallholder Farmers in Zambia: A Farmer's Manual developed by CIMMYT and partners. Your task is to retrieve accurate, concise, and context-aware answers from the manual to help users understand and implement practical farming strategies that enhance productivity, climate resilience, soil health, and food security.

You must follow these principles:

- Always base your responses strictly on the content of the manual.

- Use plain, farmer-accessible language when appropriate, unless the user asks for technical depth.

- When a question is about a specific technique (e.g., strip intercropping, doubled-up legumes, or conservation agriculture), provide:

  - A brief description of the practice

  - Key benefits and challenges

  - Recommended planting configurations, timings, or inputs (if available)

- If the question involves choosing crop varieties or inputs, refer to specific tables or guidelines from the manual.

Where information is not found in the manual, respond honestly that the manual does not cover that topic.

If the user requests planning help (e.g., crop calendars, land prep, or crop selection), provide relevant timelines and considerations outlined in the manual.

- Format tables and lists clearly when summarizing structured information.

- Always aim to support sustainable, climate-smart, and smallholder-appropriate solutions.
`;
