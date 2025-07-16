# Crop Mix Intensification Chatbot

A comprehensive AI-powered chatbot application designed to provide expert guidance on sustainable intensification practices for smallholder farmers in Zambia. The application is built with a modern React frontend and a Node.js backend, utilizing RAG (Retrieval-Augmented Generation) technology to provide context-aware responses based on the Sustainable Intensification Practices for Smallholder Farmers in Zambia: A Farmer's Manual developed by CIMMYT and partners.

## 🌾 Overview

This project consists of two main components:

- **Frontend**: A modern React application with an interactive chat interface and PDF viewer
- **Backend**: A Node.js API server that handles AI processing, document retrieval, and RAG functionality

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/API    ┌─────────────────┐
│   Frontend      │ ◄────────────► │    Backend      │
│   (React)       │                │   (Node.js)     │
│                 │                │                 │
│ • Chat Interface│                │ • RAG System    │
│ • PDF Viewer    │                │ • OpenAI API    │
│ • UI Components │                │ • Pinecone DB   │
└─────────────────┘                └─────────────────┘
```

## 🚀 Tech Stack

### Frontend Technologies

- **React 19** - Modern React with latest features and hooks
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework for styling
- **React PDF** - PDF viewing and navigation capabilities
- **React Markdown** - Markdown rendering for AI responses
- **ESLint** - Code quality and linting

### Backend Technologies

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for API endpoints
- **LangChain** - LLM application framework for AI interactions
- **OpenAI API** - GPT-4o-mini model for text generation
- **Pinecone** - Vector database for semantic document search
- **PDF Parse** - PDF text extraction and processing
- **CORS** - Cross-origin resource sharing support

## 📁 Project Structure

```
crop-mix-intensification-chatbot/
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Chatbot.jsx      # Main chatbot interface
│   │   │   ├── PDFViewer.jsx    # PDF document viewer
│   │   │   └── Sidebar.jsx      # Application sidebar
│   │   ├── config/
│   │   │   └── api.js           # API endpoints and functions
│   │   ├── App.jsx              # Main application component
│   │   └── main.jsx             # Application entry point
│   ├── public/                  # Static assets
│   │   ├── SIFAZ_manual.pdf    # CIMMYT manual
│   │   ├── cimmyt-square.png   # CIMMYT logo
│   │   └── cimmyt.svg          # CIMMYT SVG logo
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── vercel.json             # Vercel deployment config
│   └── .dockerignore           # Docker ignore rules
├── backend/                     # Node.js backend API
│   ├── server.js               # Express server and API endpoints
│   ├── package.json            # Backend dependencies
│   └── README.md               # Backend documentation
└── README.md                   # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **OpenAI API Key** - Get from [OpenAI Platform](https://platform.openai.com/)
- **Pinecone API Key** - Get from [Pinecone Console](https://app.pinecone.io/)

### Step-by-Step Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd crop-mix-intensification-chatbot
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd ../backend
   npm install
   ```

4. **Configure environment variables**

   Create `.env` file in the `frontend` directory:

   ```env
   VITE_BACKEND_URL=http://localhost:3001
   ```

   Create `.env` file in the `backend` directory:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PORT=3001
   ```

5. **Set up Pinecone**
   - Create a Pinecone account at [https://www.pinecone.io/](https://www.pinecone.io/)
   - Create a new index with these settings:
     - Name: `sifaz-manual`
     - Dimension: `1536` (for OpenAI embeddings)
     - Metric: `cosine`
   - Copy your API key to the backend `.env` file

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

   The backend will start on `http://localhost:3001`

2. **Start the frontend development server** (in a new terminal)

   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

3. **Access the application**
   Open your browser and navigate to `http://localhost:5173`

### Production Build

1. **Build the frontend**

   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend**
   ```bash
   cd backend
   npm start
   ```

## 🔧 Configuration Details

### Frontend Configuration

The frontend uses Vite for build tooling and development. Key configuration files:

- **`vite.config.js`**: Vite configuration with React and Tailwind plugins
- **`src/config/api.js`**: API endpoint configuration and functions
- **`vercel.json`**: Deployment configuration for Vercel

### Backend Configuration

The backend is an Express.js server with the following key features:

- **RAG System**: Retrieval-Augmented Generation for context-aware responses
- **PDF Processing**: Automatic processing of the SIFAZ manual
- **Vector Storage**: Pinecone integration for semantic search
- **Streaming Responses**: Real-time response streaming for better UX

### Environment Variables

#### Frontend (.env)

```env
VITE_BACKEND_URL=http://localhost:3001  # Backend API URL
```

#### Backend (.env)

```env
OPENAI_API_KEY=your_openai_api_key      # OpenAI API key
PINECONE_API_KEY=your_pinecone_key      # Pinecone API key
PORT=3001                               # Server port
```

## 🌐 Deployment

This project uses a multi-platform deployment strategy:

- **Frontend**: Deployed on Vercel for optimal performance and global CDN
- **Backend**: Deployed on Render for reliable serverless API hosting

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy from frontend directory**

   ```bash
   cd frontend
   vercel
   ```

3. **Set environment variables in Vercel dashboard**

   - `VITE_BACKEND_URL`: Your Render backend deployment URL (e.g., `https://your-app.onrender.com`)

4. **Configure custom domain (optional)**
   - Add your domain in Vercel dashboard
   - Update DNS settings as instructed

### Backend Deployment (Render)

1. **Create a new Web Service in Render**

   - Go to [render.com](https://render.com) and create an account
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository

2. **Configure the service**

   - **Name**: `sifaz-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set environment variables in Render dashboard**

   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PINECONE_API_KEY`: Your Pinecone API key
   - `NODE_ENV`: `production`
   - `PORT`: Leave empty (Render auto-assigns)

4. **Deploy**

   - Click "Create Web Service"
   - Render will automatically build and deploy your backend
   - Note the deployment URL (e.g., `https://your-app.onrender.com`)

5. **Update frontend configuration**
   - Go to your Vercel dashboard
   - Update `VITE_BACKEND_URL` with your Render backend URL

### Deployment Architecture

```
┌─────────────────┐    API Calls    ┌─────────────────┐
│   Frontend      │ ──────────────► │    Backend      │
│   (Vercel)      │                 │   (Render)      │
│                 │                 │                 │
│ • React App     │                 │ • Express API   │
│ • Static Assets │                 │ • RAG System    │
│ • Global CDN    │                 │ • Pinecone DB   │
└─────────────────┘                 └─────────────────┘
```

### Environment Variables Summary

#### Frontend (Vercel)

```env
VITE_BACKEND_URL=https://your-app.onrender.com
```

#### Backend (Render)

```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
NODE_ENV=production
```

### Post-Deployment Verification

1. **Test backend health**: `GET https://your-app.onrender.com/api/health`
2. **Test RAG status**: `GET https://your-app.onrender.com/api/rag-status`
3. **Test PDF access**: `GET https://your-app.onrender.com/api/debug-pdf`
4. **Test frontend**: Visit your Vercel deployment URL
5. **Test full flow**: Send a query through the chatbot interface

## 🤖 Features & Capabilities

### Chatbot Features

- **Interactive Chat Interface**: Real-time conversation with AI
- **Streaming Responses**: Live response streaming for better UX
- **Context Awareness**: RAG-powered responses based on manual content
- **Source Citations**: Page number references for responses
- **Conversation History**: Save and manage chat sessions

### PDF Viewer Features

- **Built-in PDF Viewer**: View the complete SIFAZ manual
- **Page Navigation**: Jump to specific pages
- **Source Linking**: Automatic navigation to cited pages
- **Responsive Design**: Works on desktop and mobile

### RAG System Features

- **Document Processing**: Automatic PDF text extraction
- **Vector Embeddings**: Semantic search using OpenAI embeddings
- **Relevant Retrieval**: Context-aware document retrieval
- **Response Generation**: AI-powered response generation

## 📚 Manual Integration

The application integrates with the "Sustainable Intensification Practices for Smallholder Farmers in Zambia: A Farmer's Manual" developed by CIMMYT and partners. The RAG system:

1. **Processes the PDF**: Extracts and chunks the manual content
2. **Creates Embeddings**: Generates vector embeddings for semantic search
3. **Stores in Pinecone**: Indexes content for fast retrieval
4. **Retrieves Context**: Finds relevant sections for user queries
5. **Generates Responses**: Creates context-aware AI responses

## 🧪 Testing & Quality Assurance

### Frontend Testing

```bash
cd frontend
npm run lint          # Run ESLint
npm run build         # Test production build
npm run preview       # Preview production build
```

### Backend Testing

```bash
cd backend
npm start             # Test production server
```

### API Testing

Test the backend endpoints:

- `GET /api/health` - Health check
- `GET /api/rag-status` - RAG system status
- `POST /api/init-rag` - Initialize RAG system
- `POST /api/get-relevant-docs` - Get relevant documents
- `POST /api/generate-response` - Generate AI response

## 📝 Available Scripts

### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Scripts

```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
```

## 🔍 Troubleshooting

### Common Issues

1. **PDF not found in production**

   - Ensure `SIFAZ_manual.pdf` is in `backend/public/` directory
   - Verify the file is committed to Git (not excluded by `.gitignore`)
   - Check Render logs for file access errors

2. **API key errors**

   - Verify OpenAI and Pinecone API keys in Render environment variables
   - Check API key permissions and quotas
   - Ensure keys are set in Render dashboard, not in `.env` files

3. **Pinecone index errors**

   - Ensure Pinecone index is created with dimension 1536
   - Verify index name matches configuration (`sifaz-manual`)
   - Check Pinecone dashboard for index status

4. **CORS errors**

   - Check `VITE_BACKEND_URL` in Vercel environment variables
   - Verify the URL points to your Render backend
   - Ensure backend CORS configuration allows Vercel domain

5. **RAG not initializing in production**

   - Test PDF access: `GET /api/debug-pdf`
   - Test RAG status: `GET /api/rag-status`
   - Check Render logs for initialization errors
   - Verify environment variables are set correctly

6. **Frontend can't connect to backend**

   - Verify `VITE_BACKEND_URL` is set correctly in Vercel
   - Test backend health: `GET /api/health`
   - Check if Render service is running

### Debug Endpoints

Use these endpoints to troubleshoot production issues:

- `GET /api/health` - Basic health check
- `GET /api/rag-status` - RAG system status
- `GET /api/debug-pdf` - Test PDF file access
- `GET /api/debug-env` - Check environment variables (be careful in production)
- `POST /api/init-rag` - Manually initialize RAG system

### Render-Specific Issues

1. **Service not starting**

   - Check build logs in Render dashboard
   - Verify `package.json` scripts are correct
   - Ensure all dependencies are in `package.json`

2. **Memory/timeout issues**

   - Check Render logs for memory limit errors
   - Consider upgrading Render plan if needed
   - Optimize PDF processing for production

3. **Environment variables not working**
   - Verify variables are set in Render dashboard
   - Check variable names match exactly
   - Redeploy after changing environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly (frontend and backend)
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **CIMMYT** for developing the Sustainable Intensification Practices manual
- **OpenAI** for providing the GPT models and embeddings
- **Pinecone** for vector database services
- **LangChain** for the LLM application framework
- **React** and **Vite** communities for excellent development tools

## 📞 Support

For support or questions about the application:

- Check the documentation in both frontend and backend README files
- Review the CIMMYT manual for farming-specific questions
- Contact the development team for technical issues

## 🔄 Version History

- **v1.0.0** - Initial release with RAG-powered chatbot
  - Frontend: React 19, Vite, Tailwind CSS
  - Backend: Node.js, Express, LangChain, Pinecone
  - Features: PDF viewer, streaming responses, responsive design

---

**Note**: This application is designed to support smallholder farmers in Zambia with sustainable intensification practices. Always consult local agricultural experts for region-specific advice.
