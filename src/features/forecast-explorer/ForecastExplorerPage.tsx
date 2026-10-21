import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ApiService } from '../../lib/services/apiMock';
import { MultiDiseaseForecastChart } from '../../components/charts/MultiDiseaseForecastChart';
import { Disease } from '../../types';

export const ForecastExplorerPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'combined' | 'single'>('combined');
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('all');
  const [horizonMonths, setHorizonMonths] = useState<number>(6); // 3, 6, 12
  const [cutoffDate, setCutoffDate] = useState<string>(''); // e.g., '2021-01'
  const [diseasesList, setDiseasesList] = useState<Disease[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [modelMeta, setModelMeta] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Ambil daftar penyakit dari database
  useEffect(() => {
    async function loadDiseases() {
      try {
        const list = await ApiService.getDiseases();
        if (list && list.length > 0) {
          setDiseasesList(list);
          if (selectedDiseaseId === 'all' || !selectedDiseaseId) {
            setSelectedDiseaseId(list[0].code || list[0].id);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat list penyakit:', err);
      }
    }
    loadDiseases();
  }, []);

  // Ambil forecast dari backend Python SARIMA
  useEffect(() => {
    async function fetchForecast() {
      if (!selectedDiseaseId) return;
      setLoading(true);
      try {
        const res = await ApiService.getForecast(selectedDiseaseId, 'sarima', cutoffDate || undefined);
        if (res && res.points) {
          setModelMeta(res.metadata);

          const hist = res.points.filter((p) => !p.isForecast).slice(-8);
          const fut = res.points.filter((p) => p.isForecast).slice(0, horizonMonths);
          const lastObserved = hist.length > 0 ? hist[hist.length - 1] : null;

          const points = [
            ...hist.map((p) => ({
              displayMonth: p.displayMonth,
              actual: p.observed,
              forecast: null,
              connected: p.month === lastObserved?.month ? p.observed : null,
            })),
            ...fut.map((p) => ({
              displayMonth: p.displayMonth,
              actual: null,
              forecast: p.forecast,
              connected: p.forecast,
            })),
          ];
          setChartData(points);
        }
      } catch (err) {
        console.warn('Gagal memuat forecast Python:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchForecast();
  }, [selectedDiseaseId, horizonMonths, cutoffDate]);

  const selectedDisease = diseasesList.find((d) => (d.code || d.id) === selectedDiseaseId) || diseasesList[0];

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
            Diagram Gabungan
          </button>
          <button
            onClick={() => setViewMode('single')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'single'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Fokus Satu Penyakit
          </button>
        </div>

        {/* Engine status indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{modelMeta?.modelVersion || 'Python SARIMAX Engine'}</span>
        </div>
      </div>

      {viewMode === 'combined' ? (
        <MultiDiseaseForecastChart />
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Pilih Penyakit:</span>
              <select
                value={selectedDiseaseId}
                onChange={(e) => setSelectedDiseaseId(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 font-semibold focus:outline-hidden"
              >
                {diseasesList.map((d) => {
                  const val = d.code || d.id;
                  return (
                    <option key={val} value={val}>
                      {d.name} ({d.code})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Batas Bulan Riwayat:</span>
              <input
                type="month"
                value={cutoffDate}
                onChange={(e) => setCutoffDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
              {cutoffDate && (
                <button
                  type="button"
                  onClick={() => setCutoffDate('')}
                  className="text-[11px] text-teal-700 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 mr-1">Jangkauan Proyeksi:</span>
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => setHorizonMonths(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    horizonMonths === m
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {m} Bulan
                </button>
              ))}
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Proyeksi {selectedDisease?.name || 'Penyakit'} ({horizonMonths} Bulan ke Depan)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dihitung oleh pemodelan ekonometrika statsmodels SARIMAX
                </p>
              </div>
              {loading && <span className="text-xs text-teal-600 animate-pulse">Menghitung model...</span>}
            </div>

            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                  <XAxis dataKey="displayMonth" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1 shadow-lg">
                            <div className="text-slate-400">{pt.displayMonth}</div>
                            {pt.actual !== null && (
                              <div className="font-bold text-white">Aktual: {pt.actual.toLocaleString()} pasien</div>
                            )}
                            {pt.forecast !== null && (
                              <div className="font-bold text-teal-300">Prediksi: ~{pt.forecast.toLocaleString()} pasien</div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="actual" stroke="#0f172a" strokeWidth={2.4} dot={{ r: 3, fill: '#0f172a' }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="connected" stroke="#0d9488" strokeWidth={2.4} strokeDasharray="4 4" dot={{ r: 3.5, fill: '#0d9488' }} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
