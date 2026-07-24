import React from 'react';
import { Files, FileText, Layers, Calendar, HardDrive, CheckCircle } from 'lucide-react';
import { IngestedDocument } from '../types';

interface DocumentListProps {
  documents: IngestedDocument[];
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Files className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Ingested Documents ({documents.length})
          </h2>
        </div>
        <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" /> Indexed in FAISS/Vector DB
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <h3
                  className="font-semibold text-slate-900 text-sm truncate"
                  title={doc.name}
                >
                  {doc.name}
                </h3>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md shrink-0">
                {doc.type.replace('application/', '').replace('text/', '')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <strong className="text-slate-700">{doc.chunkCount}</strong> chunks
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                {formatFileSize(doc.size)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(doc.uploadedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
