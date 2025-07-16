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
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://sifaz-chatbot.vercel.app"
  );
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
}
