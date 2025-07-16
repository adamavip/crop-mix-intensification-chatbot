import express from "express";
import cors from "cors";
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

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI components
const chatModel = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY, // In Node.js defaults to process.env.OPENAI_API_KEY
  batchSize: 1536, // Default value if omitted is 512. Max is 2048
  model: "text-embedding-3-small",
});

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Global vector store instance
let vectorStore = null;
let isInitialized = false;

// Function to load and process the PDF
const loadAndProcessPDF = async () => {
  try {
    console.log("Starting PDF processing...");

    // Load the PDF file using Node.js file system
    const pdfPath = path.join(__dirname, "../public/SIFAZ_manual.pdf");
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();
    console.log(`Loaded ${docs.length} pages from PDF`);
    console.log(`Metadata: ${JSON.stringify(docs[0].metadata)}`);

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
    // depending on client version this might be `listResponse.indexes`
    // or `listResponse.names`. Inspect it via console.log(listResponse).
    const existingIndexes = listResponse.indexes.map((index) => index.name);
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
        vectorType: "dense",
        dimension: 1536,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
        deletionProtection: "disabled",
        tags: { environment: "development" },
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
    //console.log("doc1: ", docs[0]);

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

// API Routes

// Initialize RAG system
app.post("/api/init-rag", async (req, res) => {
  try {
    if (!isInitialized) {
      await loadAndProcessPDF();
    }
    res.json({ success: true, message: "RAG system initialized" });
  } catch (error) {
    console.error("Error initializing RAG:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get relevant documents with page numbers
app.post("/api/get-relevant-docs", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const relevantDocs = await getRelevantDocumentsWithPages(query);
    res.json({ documents: relevantDocs });
  } catch (error) {
    console.error("Error retrieving documents:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate AI response with RAG (Streaming)
app.post("/api/generate-response", async (req, res) => {
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
});

// Check if RAG is ready
app.get("/api/rag-status", (req, res) => {
  res.json({
    isReady: isInitialized,
    hasVectorStore: vectorStore !== null,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Debug endpoint to test PDF loading
app.get("/api/debug-pdf", async (req, res) => {
  try {
    const pdfPath = path.join(__dirname, "../public/SIFAZ_manual.pdf");
    const fs = await import("fs");

    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      res.json({
        success: true,
        pdfPath: pdfPath,
        fileSize: stats.size,
        exists: true,
        message: "PDF file found",
      });
    } else {
      res.json({
        success: false,
        pdfPath: pdfPath,
        exists: false,
        message: "PDF file not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error checking PDF file",
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Debug environment variables (be careful with this in production)
app.get("/api/debug-env", (req, res) => {
  res.json({
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasPineconeKey: !!process.env.PINECONE_API_KEY,
    nodeEnv: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`RAG status: http://localhost:${PORT}/api/rag-status`);
});
