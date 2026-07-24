import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileText,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { RAGSearchResult } from '../types';

interface SearchSectionProps {
  onSearch: (query: string) => Promise<void>;
  isSearching: boolean;
  searchResult: RAGSearchResult | null;
  isReady: boolean;
}

const EXAMPLE_QUESTIONS = [
  'What is the main summary of the uploaded documents?',
  'What key topics or dates are mentioned?',
  'List any action items or recommendations.',
];

export const SearchSection: React.FC<SearchSectionProps> = ({
  onSearch,
  isSearching,
  searchResult,
  isReady,
}) => {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching || !isReady) return;
    onSearch(query.trim());
  };

  const handleExampleClick = (q: string) => {
    setQuery(q);
    if (isReady) {
      onSearch(q);
    }
  };

  const handleCopy = () => {
    if (searchResult?.answer) {
      navigator.clipboard.writeText(searchResult.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Search & Ask Questions
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          RAG Pipeline
        </span>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!isReady || isSearching}
            placeholder={
              isReady
                ? 'Ask a question about your documents... (e.g. "What is the key takeaway?")'
                : 'Upload & ingest documents above before searching...'
            }
            className="w-full pl-4 pr-28 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!query.trim() || !isReady || isSearching}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg shadow-2xs transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Get Answer
              </>
            )}
          </button>
        </div>

        {/* Quick Question Prompts */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Examples:
          </span>
          {EXAMPLE_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleExampleClick(q)}
              disabled={!isReady || isSearching}
              className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </form>

      {/* RAG Answer Display */}
      {searchResult && (
        <div className="space-y-4 pt-2">
          <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50 border border-indigo-100 rounded-2xl p-5 relative shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-indigo-100/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base font-display">
                  Generated Answer
                </h3>
              </div>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg hover:border-indigo-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>

            <div className="prose prose-slate prose-sm max-w-none text-slate-800 leading-relaxed pt-1">
              <Markdown>{searchResult.answer}</Markdown>
            </div>
          </div>

          {/* Sources Section */}
          {searchResult.sourceDocs && searchResult.sourceDocs.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              <button
                type="button"
                onClick={() => setShowSources(!showSources)}
                className="w-full px-4 py-3 bg-slate-100/80 hover:bg-slate-200/60 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>
                    View Source Documents ({searchResult.sourceDocs.length} Context Chunks Used)
                  </span>
                </div>
                {showSources ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showSources && (
                <div className="p-4 space-y-3 border-t border-slate-200">
                  {searchResult.sourceDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-slate-600 pb-1.5 border-b border-slate-100">
                        <span className="font-semibold text-indigo-900 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          Source {idx + 1}: {doc.docName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono text-[10px]">
                            Chunk #{doc.chunkIndex}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                            Score: {doc.similarity}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px]">
                        {doc.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
