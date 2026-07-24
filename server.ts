import express from 'express';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import {
  processAndIngestFiles,
  performRAGSearch,
  clearVectorStore,
  getVectorStoreStatus,
} from './server/ragEngine.js';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max file size
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- API Routes ---

  // Get vector store and environment status
  app.get('/api/status', (req, res) => {
    try {
      const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
      const status = getVectorStoreStatus(apiKeyHeader);
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error fetching status' });
    }
  });

  // Get ingested documents
  app.get('/api/documents', (req, res) => {
    try {
      const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
      const status = getVectorStoreStatus(apiKeyHeader);
      res.json({ documents: status.documents });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error fetching documents' });
    }
  });

  // Upload and ingest documents
  app.post('/api/upload', upload.array('files', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
      const result = await processAndIngestFiles(files, apiKeyHeader);
      res.json(result);
    } catch (err: any) {
      console.error('Upload handler error:', err);
      res.status(500).json({ error: err.message || 'Failed to ingest documents' });
    }
  });

  // Search and generate RAG answer
  app.post('/api/search', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
      const result = await performRAGSearch(query.trim(), apiKeyHeader);
      res.json(result);
    } catch (err: any) {
      console.error('Search handler error:', err);
      res.status(500).json({ error: err.message || 'Failed to perform search' });
    }
  });

  // Clear vector store
  app.post('/api/clear', (req, res) => {
    try {
      const msg = clearVectorStore();
      res.json({ message: msg });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to clear vector store' });
    }
  });

  // --- Vite / Static Files Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
