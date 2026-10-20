import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { WIZARD_PRESETS } from '../../lib/mock-data/wizardPresets';

interface CsvImportWizardProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const CsvImportWizard: React.FC<CsvImportWizardProps> = ({ onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    rows: number;
    sizeKb: number;
  } | null>({
    name: 'st_jude_respiratory_monthly_2026.csv',
    rows: 240,
    sizeKb: 24,
  });

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSample = () => {
    setSelectedFile({
      name: 'st_jude_respiratory_monthly_2026.csv',
      rows: 240,
      sizeKb: 24,
    });
    setIsSaved(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile({
        name: file.name,
        rows: 320,
        sizeKb: Math.round(file.size / 1024),
      });
      setIsSaved(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center pt-2">
        <h2 className="text-xl font-bold text-slate-900">
          Upload Data Kasus Pasien
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Unggah file spreadsheet (.csv) bulanan untuk memperbarui grafik tren dan prediksi
        </p>
      </div>

      {!isSaved ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Tarik file CSV ke sini, atau klik untuk memilih file
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              File spreadsheet standar rumah sakit (.csv)
            </p>
          </div>

          {/* Quick Sample Button */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Ingin mencoba tanpa file sendiri?</span>
            <button
              onClick={handleSelectSample}
              className="text-teal-700 font-bold hover:text-teal-900 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gunakan File Contoh (Sample File)</span>
            </button>
          </div>

          {/* File Selected Card */}
          {selectedFile && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-teal-700 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {selectedFile.rows} baris data · Siap disimpan
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 text-[11px]">
                  Format Valid ✓
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedFile && (
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan ke sistem...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Simpan Data ke Rumah Sakit</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Clean Success Card */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Data Berhasil Disimpan!
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              240 baris data pasien telah berhasil dimasukkan ke sistem. Grafik tren dan prediksi kasus sudah otomatis diperbarui.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('overview')}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>Lihat di Ringkasan (Overview)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsSaved(false);
                setSelectedFile(null);
              }}
              className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Unggah File Lain</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
