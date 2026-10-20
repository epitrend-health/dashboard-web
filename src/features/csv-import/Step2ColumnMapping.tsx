import React, { useState } from 'react';
import {
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CsvFileToImport, ColumnMappingDefinition } from '../../types';

interface Step2ColumnMappingProps {
  files: CsvFileToImport[];
  mappings: Record<string, ColumnMappingDefinition[]>;
  onUpdateMapping: (fileId: string, targetField: string, mappedSource: string | null) => void;
}

export const Step2ColumnMapping: React.FC<Step2ColumnMappingProps> = ({
  files,
  mappings,
  onUpdateMapping,
}) => {
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || '');

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];
  const fileMappings = activeFile ? mappings[activeFile.id] || [] : [];

  const requiredFields = fileMappings.filter((m) => m.required);
  const mappedRequiredFields = requiredFields.filter((m) => m.mappedSourceField !== null);
  const isMissingRequired = mappedRequiredFields.length < requiredFields.length;

  return (
    <div className="space-y-6">
      {/* File Tabs */}
      {files.length > 1 && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {files.map((file) => {
            const mList = mappings[file.id] || [];
            const reqMissing = mList.some((m) => m.required && !m.mappedSourceField);
            const isActive = file.id === activeFile?.id;

            return (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="truncate max-w-[180px]">{file.name}</span>
                {reqMissing ? (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {activeFile && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          {/* Header Info */}
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Match Your Columns to Hospital Records
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                We automatically detected columns for <span className="font-semibold text-slate-800">{activeFile.name}</span>. Confirm the fields below.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isMissingRequired
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isMissingRequired ? 'Required field missing' : 'All key columns matched ✓'}
              </span>
            </div>
          </div>

          {/* Clean Mapping Form */}
          <div className="divide-y divide-slate-100 mt-2">
            {fileMappings.map((m) => {
              const sampleVal =
                m.mappedSourceField && activeFile.sampleRows[0]
                  ? activeFile.sampleRows[0][m.mappedSourceField]
                  : null;

              return (
                <div key={m.targetField} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{m.targetLabel}</span>
                      {m.required ? (
                        <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded font-semibold">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          Optional
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">{m.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end">
                      <select
                        value={m.mappedSourceField || ''}
                        onChange={(e) =>
                          onUpdateMapping(
                            activeFile.id,
                            m.targetField,
                            e.target.value === '' ? null : e.target.value
                          )
                        }
                        className={`w-52 px-3 py-1.5 text-xs rounded-xl border font-medium focus:outline-hidden ${
                          !m.mappedSourceField && m.required
                            ? 'border-amber-400 bg-amber-50 text-amber-900 font-semibold'
                            : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <option value="">(Not in my file / Skip)</option>
                        {activeFile.headers.map((h) => (
                          <option key={h} value={h}>
                            Column: {h}
                          </option>
                        ))}
                      </select>

                      {sampleVal && (
                        <span className="text-[10px] text-slate-400 mt-1 font-mono">
                          Example from file: &quot;{sampleVal}&quot;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
