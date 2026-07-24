export interface IngestedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  chunkCount: number;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docName: string;
  chunkIndex: number;
  content: string;
  embedding?: number[];
}

export interface RAGSearchResult {
  answer: string;
  sourceDocs: {
    docName: string;
    chunkIndex: number;
    content: string;
    similarity: number;
  }[];
}

export interface ServerStatus {
  isReady: boolean;
  docCount: number;
  chunkCount: number;
  hasApiKey: boolean;
  documents: IngestedDocument[];
}
