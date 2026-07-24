import { GoogleGenAI } from '@google/genai';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import crypto from 'crypto';

export interface DocChunk {
  id: string;
  docId: string;
  docName: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}

export interface IngestedDoc {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  chunkCount: number;
}

// In-memory vector store and document registry
let ingestedDocuments: IngestedDoc[] = [];
let chunkVectorStore: DocChunk[] = [];

// Helper to chunk text recursively
export function chunkText(text: string, chunkSize = 1000, chunkOverlap = 200): string[] {
  const chunks: string[] = [];
  if (!text || text.trim().length === 0) return chunks;

  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length <= chunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      if (trimmed.length > chunkSize) {
        // Splitting large paragraph into fixed length pieces
        let start = 0;
        while (start < trimmed.length) {
          const end = Math.min(start + chunkSize, trimmed.length);
          chunks.push(trimmed.slice(start, end));
          start += chunkSize - chunkOverlap;
        }
        currentChunk = '';
      } else {
        // Keep overlap from previous chunk if possible
        const overlapStart = Math.max(0, currentChunk.length - chunkOverlap);
        const overlapText = currentChunk.slice(overlapStart);
        currentChunk = overlapText ? overlapText + '\n\n' + trimmed : trimmed;
      }
    }
  }

  if (currentChunk && currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text.slice(0, chunkSize)];
}

// Cosine similarity helper
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// TF-IDF fallback vectorizer in case embedding model call fails or key is missing
function generateSimpleWordFreqVector(text: string, vocabulary: string[]): number[] {
  const words = text.toLowerCase().match(/\w+/g) || [];
  const counts = new Map<string, number>();
  for (const w of words) {
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  return vocabulary.map((v) => counts.get(v) || 0);
}

// Initialize Gemini client helper
export function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const key = customApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Extract text from uploaded file buffer
export async function extractTextFromFile(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  const ext = originalName.slice(originalName.lastIndexOf('.')).toLowerCase();

  if (ext === '.pdf' || mimeType === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text || '';
  } else if (ext === '.docx' || mimeType.includes('wordprocessingml')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } else {
    // Plain text or markdown
    return buffer.toString('utf-8');
  }
}

// Generate embedding for text
export async function getEmbedding(ai: GoogleGenAI | null, text: string): Promise<number[]> {
  if (ai) {
    try {
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });
      const resAny = response as any;
      if (resAny.embedding?.values) {
        return resAny.embedding.values;
      }
      if (resAny.embeddings?.[0]?.values) {
        return resAny.embeddings[0].values;
      }
    } catch (e) {
      console.warn('Embedding model call failed, falling back to basic vectorizer:', e);
    }
  }

  // Basic fallback deterministic hash-based pseudo-vector for keyword matching
  const words = Array.from(new Set(text.toLowerCase().match(/[a-z0-9]{3,}/g) || []));
  const vec = new Array(64).fill(0);
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % 64;
    vec[idx] += 1;
  }
  return vec;
}

// Ingest uploaded files
export async function processAndIngestFiles(
  files: { buffer: Buffer; originalname: string; mimetype: string; size: number }[],
  customApiKey?: string
): Promise<{ success: boolean; message: string; ingestedDocs: IngestedDoc[]; totalChunks: number }> {
  const ai = getGeminiClient(customApiKey);
  let newChunksCount = 0;
  const processedDocs: IngestedDoc[] = [];

  for (const file of files) {
    const docId = crypto.randomUUID();
    const text = await extractTextFromFile(file.buffer, file.originalname, file.mimetype);
    
    if (!text || text.trim().length === 0) {
      continue;
    }

    const rawChunks = chunkText(text, 1000, 200);
    const docChunks: DocChunk[] = [];

    for (let i = 0; i < rawChunks.length; i++) {
      const chunkTextContent = rawChunks[i];
      const embedding = await getEmbedding(ai, chunkTextContent);
      docChunks.push({
        id: crypto.randomUUID(),
        docId,
        docName: file.originalname,
        chunkIndex: i + 1,
        content: chunkTextContent,
        embedding,
      });
    }

    const ingestedDoc: IngestedDoc = {
      id: docId,
      name: file.originalname,
      type: file.mimetype || file.originalname.split('.').pop() || 'unknown',
      size: file.size,
      uploadedAt: new Date().toISOString(),
      chunkCount: docChunks.length,
    };

    ingestedDocuments.push(ingestedDoc);
    chunkVectorStore.push(...docChunks);
    processedDocs.push(ingestedDoc);
    newChunksCount += docChunks.length;
  }

  return {
    success: true,
    message: `Successfully ingested ${processedDocs.length} document(s) with ${newChunksCount} chunks.`,
    ingestedDocs: processedDocs,
    totalChunks: chunkVectorStore.length,
  };
}

// Perform RAG search
export async function performRAGSearch(
  query: string,
  customApiKey?: string
): Promise<{
  answer: string;
  sources: { docName: string; chunkIndex: number; content: string; similarity: number }[];
}> {
  if (chunkVectorStore.length === 0) {
    return {
      answer: 'No documents have been ingested yet. Please upload and ingest documents first.',
      sources: [],
    };
  }

  const ai = getGeminiClient(customApiKey);
  const queryEmbedding = await getEmbedding(ai, query);

  // Score all chunks by cosine similarity
  const scoredChunks = chunkVectorStore.map((chunk) => {
    let similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
    
    // Keyword match boost
    const queryTerms = query.toLowerCase().match(/\w+/g) || [];
    const chunkLower = chunk.content.toLowerCase();
    let matchCount = 0;
    for (const term of queryTerms) {
      if (term.length > 2 && chunkLower.includes(term)) {
        matchCount++;
      }
    }
    if (queryTerms.length > 0) {
      similarity += (matchCount / queryTerms.length) * 0.2;
    }

    return { chunk, similarity };
  });

  // Sort descending by similarity
  scoredChunks.sort((a, b) => b.similarity - a.similarity);

  // Top 4 chunks
  const topK = scoredChunks.slice(0, 4);
  const sources = topK.map((item) => ({
    docName: item.chunk.docName,
    chunkIndex: item.chunk.chunkIndex,
    content: item.chunk.content,
    similarity: Math.round(item.similarity * 100) / 100,
  }));

  const contextText = topK
    .map((item, idx) => `[Document: ${item.chunk.docName}, Chunk ${item.chunk.chunkIndex}]\n${item.chunk.content}`)
    .join('\n\n---\n\n');

  let answer = '';

  if (ai) {
    try {
      const prompt = `You are an AI assistant for question-answering over documents.
Use the following document context to answer the user's question concisely and accurately.
If you do not know the answer based on the context, say "I could not find the answer in the uploaded documents."

Context:
${contextText}

Question: ${query}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      answer = response.text || 'No response generated.';
    } catch (err: any) {
      console.error('Gemini generation error:', err);
      answer = `Error generating response with Gemini: ${err?.message || err}. Here are the retrieved document excerpts for your question.`;
    }
  } else {
    answer = `[API Key Required] Here are the top matching excerpts from your documents:\n\n` +
      topK.map((item, i) => `**Snippet ${i + 1} (${item.chunk.docName})**:\n"${item.chunk.content.slice(0, 300)}..."`).join('\n\n') +
      `\n\nPlease set your Google API Key to enable AI-synthesized answers.`;
  }

  return { answer, sources };
}

// Clear vector store
export function clearVectorStore(): string {
  ingestedDocuments = [];
  chunkVectorStore = [];
  return 'Vector store cleared successfully.';
}

// Get status
export function getVectorStoreStatus(customApiKey?: string) {
  const hasKey = Boolean(customApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  return {
    isReady: chunkVectorStore.length > 0,
    docCount: ingestedDocuments.length,
    chunkCount: chunkVectorStore.length,
    hasApiKey: hasKey,
    documents: ingestedDocuments,
  };
}
