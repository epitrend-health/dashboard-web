import React from 'react';
import {
  CheckCircle2,
  FileCheck2,
  Download,
  ArrowRight,
  Database,
  History,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface Step5ImportResultsProps {
  batchId: string;
  timestamp: string;
  processedFilesCount: number;
  importedRecords: number;
  rejectedRecords: number;
  skippedDuplicates: number;
  onNavigate: (tab: NavigationTab) => void;
  onStartNewImport: () => void;
}

export const Step5ImportResults: React.FC<Step5ImportResultsProps> = ({
  batchId,
  timestamp,
  processedFilesCount,
  importedRecords,
  rejectedRecords,
  skippedDuplicates,
  onNavigate,
  onStartNewImport,
}) => {
  return (
    <div className="space-y-6">
      {/* Cheerful Success Card */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 text-emerald-950 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Success
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {importedRecords.toLocaleString()} Records Successfully Added!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Your hospital disease trends and future forecasts have been updated automatically.
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-mono bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
            Batch: {batchId}
          </span>
        </div>
      </div>

      {/* 3 Clear Stat Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Files Saved</span>
          <div className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
            {processedFilesCount} file
          </div>
          <span className="text-xs text-emerald-600 mt-1 block">Successfully saved</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Patient Rows Added</span>
          <div className="mt-1.5 text-2xl font-bold text-emerald-700 tabular-nums">
            {importedRecords.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Live in hospital records</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Duplicates Cleared</span>
          <div className="mt-1.5 text-2xl font-bold text-slate-700 tabular-nums">
            {skippedDuplicates}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Merged automatically</span>
        </div>
      </div>

      {/* Where to Go Next */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
          What would you like to do next?
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          You can inspect the updated charts or upload another file:
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Go to Overview Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('trends')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            <span>See Disease Trends</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onStartNewImport}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Upload Another File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
