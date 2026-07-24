import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2, Sparkles, File } from 'lucide-react';

interface UploadSectionProps {
  onIngest: (files: File[]) => Promise<void>;
  isIngesting: boolean;
  statusMessage?: string;
  errorMessage?: string;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onIngest,
  isIngesting,
  statusMessage,
  errorMessage,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => {
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        return ['.pdf', '.txt', '.docx', '.md', '.json', '.csv'].includes(ext);
      });
      setSelectedFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIngestClick = async () => {
    if (selectedFiles.length === 0) return;
    await onIngest(selectedFiles);
    setSelectedFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Upload Documents
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="px-2 py-0.5 bg-slate-100 rounded-md">PDF</span>
          <span className="px-2 py-0.5 bg-slate-100 rounded-md">TXT</span>
          <span className="px-2 py-0.5 bg-slate-100 rounded-md">DOCX</span>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 scale-[1.005]'
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.docx,.md,.json"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3 border border-indigo-100">
          <FileText className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800">
          Click to browse or drop files here
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Supports PDF, TXT, DOCX, Markdown, and text files up to 20MB
        </p>
      </div>

      {/* Selected Files Queue */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Selected Files ({selectedFiles.length})
          </p>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <File className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">
                    {file.name}
                  </span>
                  <span className="text-slate-400 shrink-0">
                    ({formatFileSize(file.size)})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleIngestClick}
            disabled={isIngesting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isIngesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Ingesting & Creating Vector Store...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Ingest Documents ({selectedFiles.length})
              </>
            )}
          </button>
        </div>
      )}

      {/* Success Notification */}
      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
