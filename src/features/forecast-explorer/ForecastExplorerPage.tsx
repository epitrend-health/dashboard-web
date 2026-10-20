import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { MOCK_DISEASES } from '../../lib/mock-data/diseases';
import { getForecastForDisease } from '../../lib/mock-data/forecasts';
import { MultiDiseaseForecastChart } from '../../components/charts/MultiDiseaseForecastChart';

export const ForecastExplorerPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'combined' | 'single'>('combined');
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('influenza');
  const [horizonMonths, setHorizonMonths] = useState<number>(6); // 3, 6, 12

  const selectedDisease = MOCK_DISEASES.find((d) => d.id === selectedDiseaseId) || MOCK_DISEASES[0];
  const forecastResult = getForecastForDisease(selectedDiseaseId, 'sarima');

  const futurePoints = forecastResult.points.filter((p) => p.isForecast).slice(0, horizonMonths);

  const chartData = [
    // 6 months historical baseline for context
    ...forecastResult.points.filter((p) => !p.isForecast).slice(-6).map((p) => ({
      displayMonth: p.displayMonth,
      actual: p.observed,
      forecast: null,
      connected: p.month === '2026-09' ? p.observed : null,
    })),
    ...futurePoints.map((p) => ({
      displayMonth: p.displayMonth,
      actual: null,
      forecast: p.forecast,
      connected: p.forecast,
    })),
  ];

  const getStatusBadge = (cases: number, baseline: number) => {
    if (cases > baseline * 1.35) {
      return { label: 'Puncak Musiman', color: 'bg-rose-50 text-rose-700 font-semibold' };
    }
    if (cases > baseline * 1.15) {
      return { label: 'Meningkat', color: 'bg-amber-50 text-amber-800 font-medium' };
    }
    return { label: 'Normal', color: 'bg-slate-100 text-slate-700 font-normal' };
  };

  return (
    <div className="space-y-6">
      {/* Top View Mode Switcher */}
      <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('combined')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'combined'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Diagram Gabungan (Semua Penyakit)
          </button>
          <button
            onClick={() => setViewMode('single')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'single'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Detail Per Penyakit
          </button>
        </div>

        <span className="text-[11px] text-slate-400 hidden md:inline px-3">
          {viewMode === 'combined'
            ? 'Menampilkan perbandingan sekaligus untuk melihat penyakit yang akan melonjak'
            : 'Menganalisis satu penyakit secara mendalam dengan batas perkiraan'}
        </span>
      </div>

      {/* View Mode 1: Combined All Diseases Chart */}
      {viewMode === 'combined' ? (
        <MultiDiseaseForecastChart
          onSelectDisease={(diseaseId) => {
            setSelectedDiseaseId(diseaseId);
            setViewMode('single');
          }}
        />
      ) : (
        <>
          {/* Clean Controls Header */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Prediksi Detail Kasus Mendatang
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Perkiraan jumlah pasien per bulan untuk perencanaan fasilitas rumah sakit
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedDiseaseId}
                onChange={(e) => setSelectedDiseaseId(e.target.value)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-hidden"
              >
                {MOCK_DISEASES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.commonName || d.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setHorizonMonths(3)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    horizonMonths === 3 ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  3 Bulan
                </button>
                <button
                  onClick={() => setHorizonMonths(6)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    horizonMonths === 6 ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  6 Bulan
                </button>
                <button
                  onClick={() => setHorizonMonths(12)}
                  className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    horizonMonths === 12 ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  1 Tahun
                </button>
              </div>
            </div>
          </div>

          {/* Clean Forecast Line Chart */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="pb-4 border-b border-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800">
                {selectedDisease.commonName || selectedDisease.name} ({horizonMonths} Bulan Mendatang)
              </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-slate-900 rounded-full" />
              <span>Data Riwayat</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-1 border-t-2 border-dashed border-teal-600" />
              <span className="text-teal-800 font-semibold">Prediksi</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
              <XAxis dataKey="displayMonth" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${Number(val || 0).toLocaleString()} pasien`, 'Jumlah']}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#0f172a"
                strokeWidth={2.4}
                dot={{ r: 3, fill: '#0f172a' }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="connected"
                stroke="#0d9488"
                strokeWidth={2.4}
                strokeDasharray="4 4"
                dot={{ r: 3.5, fill: '#0d9488' }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clean Minimalist Schedule Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Rincian Prediksi Bulanan
        </h3>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="py-3 px-3">Bulan</th>
                <th className="py-3 px-3 text-right">Perkiraan Pasien</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Saran Rumah Sakit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {futurePoints.map((pt) => {
                const status = getStatusBadge(pt.forecast, selectedDisease.baselineMean);
                return (
                  <tr key={pt.month} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">
                      {pt.displayMonth}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                      ~{pt.forecast.toLocaleString()} pasien
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {status.label === 'Puncak Musiman'
                        ? 'Siapkan persediaan obat & ruang isolasi tambahan'
                        : status.label === 'Meningkat'
                        ? 'Pantau stok alat swab dan rapid test'
                        : 'Kapasitas ruangan dan staf normal'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
