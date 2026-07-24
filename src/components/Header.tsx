import React from 'react';
import { FileSearch, Sparkles, Key, CheckCircle2, AlertCircle, Database } from 'lucide-react';

interface HeaderProps {
  hasApiKey: boolean;
  isReady: boolean;
  docCount: number;
  chunkCount: number;
  onOpenApiKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasApiKey,
  isReady,
  docCount,
  chunkCount,
  onOpenApiKeyModal,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm flex items-center justify-center">
            <FileSearch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                AI Document Search
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3 h-3" /> Gemini RAG
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Semantic Document Retrieval & Natural Language Question Answering
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Status Badge */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Database className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-medium text-slate-700">
              {isReady ? (
                <span className="text-emerald-700 font-semibold">
                  {docCount} Doc{docCount !== 1 ? 's' : ''} ({chunkCount} Chunk{chunkCount !== 1 ? 's' : ''})
                </span>
              ) : (
                <span className="text-slate-500">No Vector Index</span>
              )}
            </span>
          </div>

          {/* API Key Indicator */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              hasApiKey
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            {hasApiKey ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> API Key Ready
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Set API Key
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
