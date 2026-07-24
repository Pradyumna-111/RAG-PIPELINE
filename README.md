# AI Document Search Using LangChain and Gemini

A Retrieval-Augmented Generation (RAG) system that enables semantic search over your documents using Google's Gemini AI. This application allows you to upload documents, build a vector index, and search them using natural language queries through a Streamlit interface.

## 🎯 Features

- **Multi-Format Support**: Upload and process PDF, TXT, and DOCX files.
- **Interactive UI**: User-friendly Streamlit interface for document management and searching.
- **Vector Embeddings**: Generate semantic embeddings using Google's `gemini-embedding-001`.
- **FAISS Indexing**: Store embeddings in a local FAISS vector database for fast retrieval.
- **Semantic Search**: Query documents using natural language and get concise answers from Gemini.
- **Source Transparency**: View the specific document chunks used to generate each answer.

## 🌐 Live Demo

Try the deployed application here:

🔗 https://ai-document-search-with-langchain-ntdwdrvqpezxwsuwghvnc2.streamlit.app/



## 📋 Prerequisites

- Python 3.8 or higher
- Google AI API Key (Gemini)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-document-search
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## 📖 Usage

### Run the Streamlit App

```bash
streamlit run main.py
```

### Workflow

1. **Enter API Key**: Provide your Google API Key in the sidebar.
2. **Upload Documents**: Select PDF, TXT, or DOCX files and click "Ingest Documents".
3. **Search**: Enter your question in the search box to get an AI-generated answer based on your documents.
4. **View Sources**: Expand the "View Source Documents" section to see the context used for the answer.
5. **Manage Index**: Use the "Clear Vector Store" button in the sidebar to reset the index.

## 📁 Project Structure

```
ai-document-search/
├── config.py          # Centralized configuration and model settings
├── ingest.py          # Document loading, chunking, and indexing logic
├── search.py          # RAG search pipeline and chain definition
├── main.py            # Streamlit UI and application entry point
├── requirements.txt   # Python dependencies
├── docs/              # Temporary storage for uploaded documents
└── vectorstore/       # FAISS index storage (auto-created)
```

## 🛠️ Technologies Used

- **Streamlit**: Web interface
- **LangChain**: LLM orchestration framework
- **Google Generative AI**: Gemini-1.5-flash LLM and Embeddings
- **FAISS**: Local vector similarity search

## 🎓 How RAG Works

Retrieval-Augmented Generation (RAG) combines:
1. **Retrieval**: Find relevant documents based on query similarity.
2. **Augmentation**: Pass retrieved context to the LLM.
3. **Generation**: LLM produces answers grounded in the provided context.

This approach reduces hallucinations and ensures answers are based on your specific documents.

## 📝 License

MIT License - feel free to use and modify
