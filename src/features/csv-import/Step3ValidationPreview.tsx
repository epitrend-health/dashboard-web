import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Filter,
  Eye,
  Check,
} from 'lucide-react';
import { ValidationErrorItem } from '../../types';

interface Step3ValidationPreviewProps {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateCandidates: number;
  missingValues: number;
  invalidDates: number;
  unknownCodes: number;
  errors: ValidationErrorItem[];
}

export const Step3ValidationPreview: React.FC<Step3ValidationPreviewProps> = ({
  totalRows,
  validRows,
  invalidRows,
  duplicateCandidates,
  errors,
}) => {
  const isClean = invalidRows === 0 && duplicateCandidates === 0;

  return (
    <div className="space-y-6">
      {/* Friendly Reassuring Status Banner */}
      <div
        className={`p-6 rounded-2xl border shadow-xs ${
          isClean
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            : invalidRows > 0
            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
            : 'bg-teal-50/70 border-teal-200 text-teal-950'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-2.5 rounded-2xl shrink-0 ${
              isClean
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isClean ? <CheckCircle2 className="w-6 h-6" /> : <Info className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isClean
                ? 'File Check Complete: All Records Look Great!'
                : `${validRows.toLocaleString()} Records Ready to Save`}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-xl">
              {isClean
                ? `We checked all ${totalRows} rows in your file. The dates, illness codes, and patient counts match our hospital format perfectly.`
                : `We found ${validRows.toLocaleString()} valid patient rows ready for the hospital database. ${
                    duplicateCandidates > 0
                      ? `${duplicateCandidates} duplicate rows will be cleanly merged. `
                      : ''
                  }${invalidRows > 0 ? `${invalidRows} row(s) with formatting issues will be set aside so they don't cause errors.` : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Clear, Non-Overwhelming Stat Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Rows Checked</span>
          <div className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
            {totalRows.toLocaleString()}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">From your uploaded file</span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs bg-emerald-50/30">
          <span className="text-xs font-semibold text-emerald-800">Ready to Ingest</span>
          <div className="mt-1.5 text-2xl font-bold text-emerald-700 tabular-nums">
            {validRows.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600 mt-1 block">Verified hospital records</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Duplicate or Flagged Rows</span>
          <div className="mt-1.5 text-2xl font-bold text-slate-700 tabular-nums">
            {duplicateCandidates + invalidRows}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Handled safely by the system</span>
        </div>
      </div>

      {/* Flagged Rows Notice (If Any) */}
      {errors.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">Notes & Warnings (Handled Automatically)</h4>
            <p className="text-xs text-slate-500">
              The system protects your database by resolving these automatically:
            </p>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {errors.map((err, idx) => (
              <div key={idx} className="py-3 flex items-start gap-3 text-xs">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 mt-0.5 ${
                    err.severity === 'Error'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  Row {err.rowNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800">{err.message}</div>
                  <div className="text-[11px] text-teal-700 mt-0.5">
                    👉 Action taken: {err.suggestedAction || 'Skipped to prevent database errors'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
