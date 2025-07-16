import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader("Access-Control-Allow-Origin", "https://sifaz-chatbot.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    // Handle preflight request
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
  
    // Your real logic
    res.status(200).json({ isReady: true });
  }
  

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

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if we need to initialize
    if (!isInitialized) {
      try {
        await loadAndProcessPDF();
      } catch (error) {
        console.error("Error initializing RAG:", error);
        return res.json({
          isReady: false,
          hasVectorStore: false,
          error: error.message,
        });
      }
    }

    res.json({
      isReady: isInitialized,
      hasVectorStore: vectorStore !== null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking RAG status:", error);
    res.status(500).json({
      error: error.message,
      isReady: false,
      hasVectorStore: false,
    });
  }
}
