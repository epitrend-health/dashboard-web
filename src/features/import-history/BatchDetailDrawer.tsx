import React from 'react';
import {
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Download,
  Calendar,
  User,
  Layers,
} from 'lucide-react';
import { ImportBatch } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface BatchDetailDrawerProps {
  batch: ImportBatch | null;
  onClose: () => void;
}

export const BatchDetailDrawer: React.FC<BatchDetailDrawerProps> = ({ batch, onClose }) => {
  if (!batch) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-left">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900">{batch.id}</span>
              <StatusBadge status={batch.status} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mt-1">Batch Ingestion Audit Log</h3>
            <p className="text-xs text-slate-500">{batch.targetDatasetType} · Staged at {batch.timestamp}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Audit Metadata Box */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Uploaded By
              </span>
              <div className="mt-1 font-semibold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{batch.uploadedBy}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Total Rows Evaluated
              </span>
              <div className="mt-1 font-bold text-slate-900 tabular-nums">
                {batch.totalRecords.toLocaleString()} rows
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Committed Records
              </span>
              <div className="mt-1 font-bold text-emerald-700 tabular-nums">
                {batch.validRecords.toLocaleString()} valid
              </div>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Rejections / Duplicates
              </span>
              <div className="mt-1 font-bold text-slate-700 tabular-nums">
                {batch.rejectedRecords} rej / {batch.skippedDuplicates} dup
              </div>
            </div>
          </div>

          {/* Files Processed In Batch */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Files in Batch ({batch.files.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {batch.files.map((file, idx) => (
                <div key={idx} className="p-3.5 bg-white flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileSpreadsheet className="w-4 h-4 text-slate-400 shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 truncate">{file.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {file.size} · {file.rows.toLocaleString()} rows parsed
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        file.status === 'Success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : file.status === 'Warning'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {file.validRows.toLocaleString()} Valid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Notes & Transformation Trail */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Validation & Normalization Trail
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              {batch.validationNotes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-600 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => alert(`Simulated downloading comprehensive audit package for ${batch.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Ledger</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
