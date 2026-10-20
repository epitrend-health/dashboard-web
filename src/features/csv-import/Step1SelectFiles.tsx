import React, { useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  Sparkles,
  CheckCircle2,
  Info,
  Check,
} from 'lucide-react';
import { CsvFileToImport } from '../../types';
import { WIZARD_PRESETS, WizardPreset } from '../../lib/mock-data/wizardPresets';

interface Step1SelectFilesProps {
  files: CsvFileToImport[];
  onAddFile: (file: CsvFileToImport) => void;
  onRemoveFile: (fileId: string) => void;
  onUpdateFileType: (fileId: string, type: CsvFileToImport['datasetType']) => void;
  onLoadPreset: (preset: WizardPreset) => void;
  activePresetId: string | null;
}

export const Step1SelectFiles: React.FC<Step1SelectFilesProps> = ({
  files,
  onAddFile,
  onRemoveFile,
  onUpdateFileType,
  onLoadPreset,
  activePresetId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const datasetTypes: CsvFileToImport['datasetType'][] = [
    'Monthly Cases',
    'Encounters',
    'Conditions / Diagnoses',
    'Lab Observations',
  ];

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploaded = Array.from(e.target.files);

    uploaded.forEach((f, idx) => {
      const newFile: CsvFileToImport = {
        id: `custom-${Date.now()}-${idx}`,
        name: f.name,
        sizeKb: Math.max(12, Math.round(f.size / 1024)),
        datasetType: 'Monthly Cases',
        headers: ['PERIOD', 'DIAGNOSIS_CODE', 'CASE_COUNT', 'FACILITY'],
        sampleRows: [
          { PERIOD: '2026-08', DIAGNOSIS_CODE: 'J09.X', CASE_COUNT: '185', FACILITY: 'St. Jude' },
          { PERIOD: '2026-09', DIAGNOSIS_CODE: 'J09.X', CASE_COUNT: '220', FACILITY: 'St. Jude' },
        ],
        totalRows: 420,
        status: 'ready',
      };
      onAddFile(newFile);
    });
  };

  return (
    <div className="space-y-6">
      {/* 1-Click Sample File Helper for Easy Testing */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Testing this prototype?
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Load a pre-formatted hospital sample file with 1 click:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {WIZARD_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onLoadPreset(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  <span>{preset.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Big Friendly Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 text-center cursor-pointer bg-white transition-all group"
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".csv,.txt"
          onChange={handleSimulatedFileUpload}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">
          Drop your hospital CSV spreadsheet here
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Or <span className="text-teal-700 font-semibold underline">browse files from your computer</span>
        </p>
        <span className="inline-block mt-3 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
          Standard hospital formats supported (.csv)
        </span>
      </div>

      {/* Selected Files in Ingestion Queue */}
      {files.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                File Ready to Ingest ({files.length})
              </h4>
              <p className="text-xs text-slate-500">
                The file below will be checked and formatted in the next step.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {files.map((file) => (
              <div key={file.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-teal-700" />
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-slate-900 truncate block text-xs">{file.name}</span>
                    <span className="text-[11px] text-slate-400">
                      {file.sizeKb} KB · {file.totalRows.toLocaleString()} rows detected
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 sm:self-auto self-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 text-xs">Type:</span>
                    <select
                      value={file.datasetType}
                      onChange={(e) =>
                        onUpdateFileType(file.id, e.target.value as CsvFileToImport['datasetType'])
                      }
                      className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 focus:outline-hidden"
                    >
                      {datasetTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
