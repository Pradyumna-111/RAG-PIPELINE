import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { UploadSection } from './components/UploadSection';
import { SearchSection } from './components/SearchSection';
import { DocumentList } from './components/DocumentList';
import { RAGSearchResult, ServerStatus } from './types';

export function App() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('custom_gemini_api_key') || '';
  });

  const [status, setStatus] = useState<ServerStatus>({
    isReady: false,
    docCount: 0,
    chunkCount: 0,
    hasApiKey: false,
    documents: [],
  });

  const [isIngesting, setIsIngesting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string>('');
  const [searchResult, setSearchResult] = useState<RAGSearchResult | null>(null);

  // Fetch status from backend
  const fetchStatus = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }
      const res = await fetch('/api/status', { headers });
      if (res.ok) {
        const data: ServerStatus = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch server status:', err);
    }
  }, [apiKey]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('custom_gemini_api_key', key);
  };

  // Handle document upload and ingestion
  const handleIngest = async (files: File[]) => {
    if (files.length === 0) return;
    setIsIngesting(true);
    setUploadStatusMsg('');
    setUploadErrorMsg('');

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const headers: Record<string, string> = {};
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUploadStatusMsg(data.message || 'Documents ingested successfully!');
        await fetchStatus();
      } else {
        setUploadErrorMsg(data.error || 'Failed to ingest documents.');
      }
    } catch (err: any) {
      setUploadErrorMsg(err.message || 'Error occurred during document upload.');
    } finally {
      setIsIngesting(false);
    }
  };

  // Handle RAG search query
  const handleSearch = async (query: string) => {
    if (!query) return;
    setIsSearching(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const res = await fetch('/api/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResult({
          answer: data.answer,
          sourceDocs: data.sources || [],
        });
      } else {
        const errData = await res.json();
        setSearchResult({
          answer: `Error performing search: ${errData.error || res.statusText}`,
          sourceDocs: [],
        });
      }
    } catch (err: any) {
      setSearchResult({
        answer: `Network error during search: ${err.message || err}`,
        sourceDocs: [],
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Clear vector store index
  const handleClearVectorStore = async () => {
    setIsClearing(true);
    try {
      const res = await fetch('/api/clear', { method: 'POST' });
      if (res.ok) {
        setSearchResult(null);
        setUploadStatusMsg('');
        setUploadErrorMsg('');
        await fetchStatus();
      }
    } catch (err) {
      console.error('Failed to clear vector store:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        hasApiKey={status.hasApiKey}
        isReady={status.isReady}
        docCount={status.docCount}
        chunkCount={status.chunkCount}
        onOpenApiKeyModal={() => {
          const el = document.getElementById('sidebar-settings');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <UploadSection
              onIngest={handleIngest}
              isIngesting={isIngesting}
              statusMessage={uploadStatusMsg}
              errorMessage={uploadErrorMsg}
            />

            <DocumentList documents={status.documents} />

            <SearchSection
              onSearch={handleSearch}
              isSearching={isSearching}
              searchResult={searchResult}
              isReady={status.isReady}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4" id="sidebar-settings">
            <Sidebar
              apiKey={apiKey}
              onApiKeyChange={handleApiKeyChange}
              isReady={status.isReady}
              docCount={status.docCount}
              chunkCount={status.chunkCount}
              onClearVectorStore={handleClearVectorStore}
              isClearing={isClearing}
            />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>
          AI Document Search — Powered by Google Gemini & Express/React • Retrieval-Augmented Generation
        </p>
      </footer>
    </div>
  );
}

export default App;
