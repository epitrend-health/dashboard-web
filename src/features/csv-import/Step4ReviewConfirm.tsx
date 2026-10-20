import React from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Database,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { CsvFileToImport } from '../../types';

interface Step4ReviewConfirmProps {
  files: CsvFileToImport[];
  validRows: number;
  invalidRows: number;
  duplicateCandidates: number;
  isSimulatingCommit: boolean;
  onConfirmCommit: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export const Step4ReviewConfirm: React.FC<Step4ReviewConfirmProps> = ({
  files,
  validRows,
  invalidRows,
  duplicateCandidates,
  isSimulatingCommit,
  onConfirmCommit,
  onBack,
  onCancel,
}) => {
  return (
    <div className="space-y-6">
      {/* Friendly Confirmation Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ready to Save Records to St. Jude Hospital
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xl">
              Everything has been checked. Clicking <strong>Save Records Now</strong> will safely update the hospital disease records and refresh the forecasting charts.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          What will be added:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 font-medium block">File Being Saved:</span>
            <div className="font-semibold text-slate-900 mt-1 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <span>{files[0]?.name || 'Hospital Data File'}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {validRows.toLocaleString()} approved patient rows
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 font-medium block">Destination:</span>
            <div className="font-semibold text-slate-900 mt-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-600" />
              <span>St. Jude Hospital Surveillance Store</span>
            </div>
            <span className="text-[11px] text-emerald-700 mt-1 block">
              ✓ Ready to update future forecasts
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onCancel}
          disabled={isSimulatingCommit}
          className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            disabled={isSimulatingCommit}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
          >
            ← Back
          </button>

          <button
            onClick={onConfirmCommit}
            disabled={isSimulatingCommit}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            {isSimulatingCommit ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving to Hospital System...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Save Records Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
