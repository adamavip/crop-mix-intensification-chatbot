import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Configure dotenv
dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI components
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  batchSize: 1536,
  model: "text-embedding-3-small",
});

// Initialize Pinecone
const pinecone = new Pinecone(process.env.PINECONE_API_KEY);

// Global vector store instance
let vectorStore = null;
let isInitialized = false;

// Function to load and process the PDF
const loadAndProcessPDF = async () => {
  try {
    console.log("Starting PDF processing...");

    // Load the PDF file using Node.js file system
    const pdfPath = path.join(
      __dirname,
      "../../frontend/public/SIFAZ_manual.pdf"
    );
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} pages from PDF`);

    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`Split into ${splitDocs.length} chunks`);

    // Get or create Pinecone index
    const indexName = "sifaz-manual";
    const listResponse = await pinecone.listIndexes();
    const existingIndexes = listResponse.map((index) => index.name);
    console.log("existing indexes: ", existingIndexes);
    let index;

    if (existingIndexes.includes(indexName)) {
      console.log(`Index "${indexName}" already exists, fetching vectors…`);
      index = pinecone.Index(indexName);

      // Rehydrate a LangChain vector store from the existing Pinecone index
      vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index,
        namespace: "default",
      });
      console.log("✅ Fetched existing vector store");
    } else {
      console.log(`Creating index "${indexName}" and upserting embeddings…`);

      // Create the Pinecone index
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });

      index = pinecone.Index(indexName);

      // Embed your documents/chunks and upsert them
      vectorStore = await PineconeStore.fromDocuments(splitDocs, embeddings, {
        pineconeIndex: index,
        namespace: "default",
      });
      console.log("✅ Created index and upserted embeddings");
    }

    isInitialized = true;
    console.log("PDF processed and stored in Pinecone successfully");
    return vectorStore;
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw error;
  }
};

// Function to get relevant documents with page numbers
const getRelevantDocumentsWithPages = async (query) => {
  try {
    if (!isInitialized) {
      await loadAndProcessPDF();
    }

    const retriever = vectorStore.asRetriever({
      k: 5,
      searchType: "similarity",
    });

    const docs = await retriever.getRelevantDocuments(query);
    console.log(
      `Retrieved ${docs.length} relevant documents for query: "${query}"`
    );

    // Extract page numbers from metadata and return top 3 with page info
    const docsWithPages = docs.map((doc, index) => {
      let pageNumber = "Unknown";

      // Check for page number in different metadata locations
      if (doc.metadata?.["loc.pageNumber"] !== undefined) {
        pageNumber = doc.metadata["loc.pageNumber"].toString();
      } else if (doc.metadata?.page !== undefined) {
        pageNumber = (doc.metadata.page + 1).toString(); // PDF pages are 0-indexed
      } else if (doc.metadata?.pageNumber !== undefined) {
        pageNumber = doc.metadata.pageNumber.toString();
      } else {
        pageNumber = (index + 1).toString();
      }

      return {
        content: doc.pageContent,
        pageNumber: pageNumber,
        metadata: doc.metadata,
      };
    });

    return docsWithPages;
  } catch (error) {
    console.error("Error retrieving documents:", error);
    return [];
  }
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { query, conversationHistory = [] } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Get relevant documents
    const relevantDocs = await getRelevantDocumentsWithPages(query);

    // Create enhanced system prompt
    const SYSTEM_PROMPT = `
You are an expert assistant specializing in sustainable intensification practices for smallholder farmers in Zambia, based on the Sustainable Intensification Practices for Smallholder Farmers in Zambia: A Farmer's Manual developed by CIMMYT and partners. Your task is to retrieve accurate, concise, and context-aware answers from the manual to help users understand and implement practical farming strategies that enhance productivity, climate resilience, soil health, and food security.

You must follow these principles:

- Always base your responses strictly on the content of the manual.
- Use plain, farmer-accessible language when appropriate, unless the user asks for technical depth.
- When a question is about a specific technique (e.g., strip intercropping, doubled-up legumes, or conservation agriculture), provide:
  - A brief description of the practice
  - Key benefits and challenges
  - Recommended planting configurations, timings, or inputs (if available)
- If the question involves choosing crop varieties or inputs, refer to specific tables or guidelines from the manual.
- Where information is not found in the manual, respond honestly that the manual does not cover that topic.
- If the user requests planning help (e.g., crop calendars, land prep, or crop selection), provide relevant timelines and considerations outlined in the manual.
- Format tables and lists clearly when summarizing structured information.
- Always aim to support sustainable, climate-smart, and smallholder-appropriate solutions.
`;

    const context = relevantDocs.map((doc) => doc.content).join("\n\n");
    const enhancedSystemPrompt = context
      ? `${SYSTEM_PROMPT}\n\nRelevant information from the manual:\n${context}\n\nUse this information to provide accurate answers.`
      : SYSTEM_PROMPT;

    // Create streaming chat model
    const streamingChatModel = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true,
    });

    // Generate streaming response
    const stream = await streamingChatModel.stream([
      { role: "system", content: enhancedSystemPrompt },
      ...conversationHistory,
      { role: "user", content: query },
    ]);

    let fullResponse = "";

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.content;
      if (content) {
        fullResponse += content;
        // Send chunk as Server-Sent Event
        res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
      }
    }

    // Send sources and completion signal
    const sources = relevantDocs.map((doc) => ({
      pageNumber: doc.pageNumber,
      content: doc.content.substring(0, 100) + "...",
    }));

    res.write(
      `data: ${JSON.stringify({
        content: "",
        done: true,
        sources,
        fullResponse,
      })}\n\n`
    );

    res.end();
  } catch (error) {
    console.error("Error generating response:", error);
    res.write(
      `data: ${JSON.stringify({ error: error.message, done: true })}\n\n`
    );
    res.end();
  }
}
