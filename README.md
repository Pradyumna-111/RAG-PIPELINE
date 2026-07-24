# AI Document Search (RAG with Google Gemini)

An interactive full-stack Retrieval-Augmented Generation (RAG) web application for semantic searching and natural language question-answering over custom uploaded documents. Built with React, TypeScript, Tailwind CSS, Express, and Google's `@google/genai` SDK (`gemini-3.6-flash` and `text-embedding-004`).

## 🎯 Features

- **Multi-Format Document Ingestion**: Upload PDF, DOCX, TXT, Markdown, CSV, or JSON files.
- **Smart Text Chunking & Embeddings**: Automatically splits documents into overlapping text chunks and computes vector embeddings using Google's `text-embedding-004` model.
- **Fast Similarity Search**: Performs cosine similarity matching with keyword relevance scoring to retrieve the most pertinent excerpts.
- **Synthesized Answers**: Generates context-grounded natural language answers using `gemini-3.6-flash`.
- **Source Transparency**: Inspect retrieved document chunks, page/chunk indices, and similarity relevance scores.
- **Interactive UI**: Responsive desktop and mobile interface with live status indicators, file queues, markdown answer rendering, and vector index controls.

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **Google AI API Key**: Get your key from [Google AI Studio](https://aistudio.google.com/)

## 🚀 Quick Start

1. **Clone or Download the Repository**
   ```bash
   git clone <repository-url>
   cd AI-Document-Search-with-langchain
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file at the project root or configure environment variables:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Alternatively, you can enter your API Key directly in the web app sidebar settings UI.)*

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 📖 Application Workflow

1. **Upload Documents**: Drag and drop or browse PDF, TXT, or DOCX files in the upload zone and click **Ingest Documents**.
2. **Vector Indexing**: The backend server extracts text, splits it into chunks, and computes embeddings via Gemini.
3. **Ask Questions**: Type natural language queries or select example prompts in the search panel.
4. **View Answers & Sources**: Read AI-synthesized answers and expand the **View Source Documents** accordion to inspect exact source excerpts and match scores.

## 📁 Project Structure

```
.
├── server.ts             # Express application server and API endpoints
├── server/
│   └── ragEngine.ts      # Chunking, vector similarity, embedding & Gemini RAG engine
├── src/
│   ├── main.tsx          # React application entry point
│   ├── App.tsx           # Main App layout and state management
│   ├── types.ts          # TypeScript interfaces for docs and search results
│   ├── components/
│   │   ├── Header.tsx font/badge header component
│   │   ├── Sidebar.tsx   # Settings, API key input, vector index status & clear controls
│   │   ├── UploadSection.tsx  # Drag-and-drop document uploader
│   │   ├── DocumentList.tsx   # List of active ingested documents
│   │   └── SearchSection.tsx   # Query input, AI response & source context inspector
├── package.json          # Node dependencies and build scripts
└── vite.config.ts        # Vite build & development server config
```

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Motion, React Markdown
- **Backend**: Express, Multer, PDF-Parse, Mammoth
- **AI / Embeddings**: `@google/genai` (`gemini-3.6-flash`, `text-embedding-004`)
- **Build Tools**: Vite, TSX, Esbuild

## 📝 License

MIT License - feel free to adapt and expand!

