# Crop Mix Intensification Chatbot

A React-based chatbot application that provides expert guidance on sustainable intensification practices for smallholder farmers in Zambia, based on the Sustainable Intensification Practices for Smallholder Farmers in Zambia: A Farmer's Manual developed by CIMMYT and partners.

## 🌾 Features

- **AI-Powered Chatbot**: Interactive chat interface powered by OpenAI's GPT models
- **RAG (Retrieval-Augmented Generation)**: Context-aware responses based on the CIMMYT manual
- **PDF Document Viewer**: Built-in PDF viewer for the SIFAZ manual
- **Real-time Streaming**: Live streaming responses for better user experience
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Document Search**: Intelligent document retrieval using Pinecone vector database

## 🚀 Tech Stack

### Frontend

- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React PDF** - PDF viewing capabilities
- **React Markdown** - Markdown rendering for responses

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **LangChain** - LLM application framework
- **OpenAI API** - GPT models for text generation
- **Pinecone** - Vector database for document retrieval
- **PDF Parse** - PDF text extraction

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **OpenAI API Key**
- **Pinecone API Key** and **Index Name**

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd crop-mix-intensification-chatbot
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd api
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_BACKEND_URL=http://localhost:3001
   ```

   Create a `.env` file in the `backend` directory:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX_NAME=your_pinecone_index_name_here
   PORT=3001
   ```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server** (in a new terminal)

   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173` to access the application.

### Production Build

1. **Build the frontend**

   ```bash
   npm run build
   ```

2. **Start the backend**
   ```bash
   cd backend
   npm start
   ```

## 🌐 Deployment

### Option 1: Separate Deployments (Recommended)

#### Frontend (Vercel)

1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `vercel`
3. Set environment variable `VITE_BACKEND_URL` to your backend URL

#### Backend (Railway/Render/Heroku)

1. Deploy the `/backend` folder to your chosen platform
2. Set environment variables:
   - `OPENAI_API_KEY`
   - `PINECONE_API_KEY`
   - `PINECONE_INDEX_NAME`

### Option 2: Monorepo Deployment (Vercel)

1. Deploy the entire project: `vercel`
2. Set all environment variables in Vercel dashboard

## 📁 Project Structure

```
crop-mix-intensification-chatbot/
├── backend/                      # Backend API server
│   ├── server.js                 # Express server setup
│   ├── package.json              # Backend dependencies
│   └── README.md                # Backend documentation
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── Chatbot.jsx          # Main chatbot interface
│   │   ├── PDFViewer.jsx        # PDF document viewer
│   │   └── Sidebar.jsx          # Application sidebar
│   ├── config/                   # Configuration files
│   │   └── api.js               # API endpoints and functions
│   ├── App.jsx                   # Main application component
│   └── main.jsx                  # Application entry point
├── public/                       # Static assets
│   ├── SIFAZ_manual.pdf         # CIMMYT manual
│   └── cimmyt.svg               # CIMMYT logo
├── package.json                  # Frontend dependencies
├── vite.config.js               # Vite configuration
├── vercel.json                  # Vercel deployment config
└── README.md                    # This file
```

## 🔧 Configuration

### API Configuration

The application uses environment variables for configuration:

- `VITE_BACKEND_URL`: Backend API URL (default: `http://localhost:3001`)
- `OPENAI_API_KEY`: OpenAI API key for GPT models
- `PINECONE_API_KEY`: Pinecone API key for vector database
- `PINECONE_INDEX_NAME`: Pinecone index name for document storage

### RAG System

The RAG (Retrieval-Augmented Generation) system:

1. Initializes with the SIFAZ manual content
2. Stores document embeddings in Pinecone
3. Retrieves relevant documents for user queries
4. Generates context-aware responses using OpenAI

## 🤖 Chatbot Capabilities

The chatbot can help with:

- **Crop Selection**: Guidance on choosing appropriate crops
- **Planting Techniques**: Strip intercropping, doubled-up legumes
- **Conservation Agriculture**: Soil health and sustainability practices
- **Climate Resilience**: Adaptation strategies for changing weather
- **Input Management**: Fertilizer and seed recommendations
- **Timing**: Planting calendars and seasonal considerations

## 📚 Manual Integration

The application integrates with the "Sustainable Intensification Practices for Smallholder Farmers in Zambia: A Farmer's Manual" developed by CIMMYT and partners. Users can:

- View the complete manual in the built-in PDF viewer
- Ask questions about specific practices
- Get context-aware responses based on manual content

## 🧪 Testing

Run the linter to check code quality:

```bash
npm run lint
```

## 📝 Scripts

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **CIMMYT** for developing the Sustainable Intensification Practices manual
- **OpenAI** for providing the GPT models
- **Pinecone** for vector database services
- **LangChain** for the LLM application framework

## 📞 Support

For support or questions about the application:

- Check the documentation in the `/docs` folder
- Review the CIMMYT manual for farming-specific questions
- Contact the development team for technical issues

## 🔄 Version History

- **v1.0.0** - Initial release with RAG-powered chatbot
- Features: PDF viewer, streaming responses, responsive design

---

**Note**: This application is designed to support smallholder farmers in Zambia with sustainable intensification practices. Always consult local agricultural experts for region-specific advice.
