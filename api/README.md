# SIFAZ API Server

This is the Node.js API server for the SIFAZ chatbot with RAG (Retrieval-Augmented Generation) functionality.

## Features

- PDF processing and text extraction
- Vector embeddings with Pinecone
- RAG system for context-aware responses
- Page number tracking for sources
- RESTful API endpoints

## Setup

### Prerequisites

- Node.js (v16 or higher)
- SIFAZ_manual.pdf file in the root directory
- Pinecone account and API key

### Installation

1. Navigate to the API directory:

```bash
cd api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the API directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PORT=3001
```

4. Make sure the `SIFAZ_manual.pdf` file is in the root directory (one level up from the api folder)

### Pinecone Setup

1. Create a Pinecone account at [https://www.pinecone.io/](https://www.pinecone.io/)
2. Create a new index with the following settings:
   - Name: `sifaz-manual`
   - Dimension: `1536` (for OpenAI embeddings)
   - Metric: `cosine`
3. Get your API key from the Pinecone console
4. Add the API key to your `.env` file

### Running the Server

#### Development mode:

```bash
npm run dev
```

#### Production mode:

```bash
npm start
```

The server will start on port 3001 (or the port specified in your .env file).

## API Endpoints

### Health Check

- **GET** `/api/health`
- Returns server status

### RAG Status

- **GET** `/api/rag-status`
- Returns whether the RAG system is initialized

### Initialize RAG

- **POST** `/api/init-rag`
- Initializes the PDF processing and vector store

### Get Relevant Documents

- **POST** `/api/get-relevant-docs`
- Body: `{ "query": "your search query" }`
- Returns relevant documents with page numbers

### Generate Response

- **POST** `/api/generate-response`
- Body: `{ "query": "user question", "conversationHistory": [] }`
- Returns AI response with sources

## File Structure

```
api/
├── server.js          # Main server file
├── package.json       # Dependencies
└── README.md         # This file

../SIFAZ_manual.pdf   # PDF file (in root directory)
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `PINECONE_API_KEY`: Your Pinecone API key
- `PORT`: Server port (default: 3001)

## Frontend Integration

The frontend should be configured to use this API server by setting:

```env
VITE_BACKEND_URL=http://localhost:3001
```

## Troubleshooting

1. **PDF not found**: Make sure `SIFAZ_manual.pdf` is in the root directory
2. **API key error**: Check your `.env` file has the correct OpenAI and Pinecone API keys
3. **Pinecone index error**: Make sure your Pinecone index is created with dimension 1536 and cosine metric
4. **Port conflicts**: Change the PORT in your `.env` file if 3001 is in use
