import React, { useState } from 'react';
import { Settings, Key, Trash2, Database, Info, Layers, RefreshCw, FileText } from 'lucide-react';

interface SidebarProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  isReady: boolean;
  docCount: number;
  chunkCount: number;
  onClearVectorStore: () => Promise<void>;
  isClearing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  apiKey,
  onApiKeyChange,
  isReady,
  docCount,
  chunkCount,
  onClearVectorStore,
  isClearing,
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = async () => {
    await onClearVectorStore();
    setShowConfirm(false);
  };

  return (
    <aside className="w-full lg:w-80 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Settings className="w-5 h-5 text-indigo-600" />
        <h2 className="font-semibold text-slate-900 text-base font-display">
          Settings & Status
        </h2>
      </div>

      {/* API Key Section */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-indigo-600" /> Google API Key
        </label>
        <p className="text-xs text-slate-500">
          Enter your Google Gemini API key if process environment variable is not active.
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-all font-mono"
        />
        {apiKey ? (
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            ✓ Custom API Key applied to requests
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            Uses server process GEMINI_API_KEY if configured.
          </p>
        )}
      </div>

      {/* Vector Store Management */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-600" /> Vector Index
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isReady
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isReady ? 'Active' : 'Empty'}
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Documents Ingested:
            </span>
            <span className="font-semibold text-slate-900">{docCount}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Text Chunks Created:
            </span>
            <span className="font-semibold text-slate-900">{chunkCount}</span>
          </div>
        </div>

        {/* Clear Vector Store button */}
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!isReady || isClearing}
            className="w-full py-2 px-3 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Vector Store
          </button>
        ) : (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
            <p className="text-xs font-medium text-rose-800">
              Are you sure? This will remove all indexed document embeddings.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                disabled={isClearing}
                className="flex-1 py-1.5 px-2 bg-rose-600 text-white font-medium text-xs rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-1"
              >
                {isClearing ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="py-1.5 px-3 bg-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RAG Information Box */}
      <div className="mt-auto pt-3 border-t border-slate-100">
        <div className="flex items-start gap-2 bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-900">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">How RAG Works:</p>
            <ol className="list-decimal list-inside text-indigo-800 space-y-0.5 leading-relaxed">
              <li>Upload PDF, TXT, or DOCX docs</li>
              <li>Text is chunked & embedded</li>
              <li>Queries retrieve top matching excerpts</li>
              <li>Gemini synthesizes an answer</li>
            </ol>
          </div>
        </div>
      </div>
    </aside>
  );
};
