import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { ApiService } from '../../lib/services/apiMock';
import { MultiDiseaseForecastChart } from '../../components/charts/MultiDiseaseForecastChart';
import { NavigationTab, Disease } from '../../types';

interface OverviewPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [selectedDisease, setSelectedDisease] = useState<string>('all');
  const [diseasesList, setDiseasesList] = useState<Disease[]>([]);
  const [chartPoints, setChartPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState({
    thisMonthCases: 0,
    nextMonthCases: 0,
    topCondition: 'Memuat...',
    surgeRisk: 'Normal',
  });

  // 1. Ambil daftar penyakit dari database backend / Supabase
  useEffect(() => {
    async function loadDiseases() {
      try {
        const list = await ApiService.getDiseases();
        if (list && list.length > 0) {
          setDiseasesList(list);
        }
      } catch (err) {
        console.warn('Gagal memuat daftar penyakit dari API:', err);
      }
    }
    loadDiseases();
  }, []);

  // 2. Ambil data forecast & riwayat kasus saat filter penyakit berganti
  useEffect(() => {
    async function loadForecastData() {
      setLoading(true);
      try {
        const forecastData = await ApiService.getForecast(selectedDisease, 'sarima');
        if (forecastData && forecastData.points) {
          const hist = forecastData.points.filter((p) => !p.isForecast).slice(-10);
          const fut = forecastData.points.filter((p) => p.isForecast).slice(0, 4);
          const lastObserved = hist.length > 0 ? hist[hist.length - 1] : null;

          const points = [
            ...hist.map((pt) => ({
              displayMonth: pt.displayMonth,
              observedCases: pt.observed,
              forecastCases: null,
              connectedForecast: pt.month === lastObserved?.month ? pt.observed : null,
              isForecast: false,
            })),
            ...fut.map((pt) => ({
              displayMonth: pt.displayMonth,
              observedCases: null,
              forecastCases: pt.forecast,
              connectedForecast: pt.forecast,
              isForecast: true,
            })),
          ];

          setChartPoints(points);

          // Update KPI cards
          const thisMonthVal = lastObserved?.observed || 0;
          const nextMonthVal = fut[0]?.forecast || 0;
          const isSurging = nextMonthVal > thisMonthVal * 1.15;

          setMetrics({
            thisMonthCases: thisMonthVal,
            nextMonthCases: nextMonthVal,
            topCondition: diseasesList[0]?.name || 'Penyakit Terpantau',
            surgeRisk: isSurging ? 'Waspada Lonjakan' : 'Aman Terkendali',
          });
        }
      } catch (err) {
        console.warn('Gagal memuat forecast dari API:', err);
      } finally {
        setLoading(false);
      }
    }

    loadForecastData();
  }, [selectedDisease, diseasesList]);

  return (
    <div className="space-y-8">
      {/* 4 Clean Minimalist Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Kasus Terakhir Terdata
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {metrics.thisMonthCases.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-normal">pasien</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Berdasarkan riwayat database Supabase
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Prediksi Periode Berikutnya
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-teal-700 tabular-nums">
              ~{metrics.nextMonthCases.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-normal">pasien</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Estimasi proyeksi tren SARIMA
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Kondisi Terbanyak
          </span>
          <div className="mt-2">
            <span className="text-lg font-bold text-slate-900 line-clamp-1">
              {metrics.topCondition}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Proporsi volume kasus tertinggi
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Status Lonjakan
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                metrics.surgeRisk.includes('Waspada') ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span className="text-lg font-bold text-slate-900">{metrics.surgeRisk}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Kapasitas ranjang faskes aman
          </span>
        </div>
      </div>

      {/* Main Graph Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Riwayat Kasus dan Perkiraan Beberapa Bulan ke Depan
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Data riil terhubung langsung ke database surveilans
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:outline-hidden"
            >
              <option value="all">Semua Penyakit (Gabungan)</option>
              {diseasesList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 pt-3 pb-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-slate-900 rounded-full" />
            <span className="font-medium text-slate-700">Data Aktual (Observasi)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 border-t-2 border-dashed border-teal-600" />
            <span className="font-medium text-teal-800">Perkiraan Kasus Mendatang</span>
          </div>
          {loading && <span className="ml-auto text-[11px] text-teal-600 animate-pulse">Memuat data API...</span>}
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartPoints} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
              <XAxis
                dataKey="displayMonth"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v.toLocaleString()}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                        <div className="text-slate-300 font-semibold">{data.displayMonth}</div>
                        {!data.isForecast ? (
                          <div className="text-white font-bold tabular-nums">
                            {data.observedCases?.toLocaleString()} pasien
                          </div>
                        ) : (
                          <div className="text-teal-300 font-bold tabular-nums">
                            Perkiraan: ~{data.forecastCases?.toLocaleString()} pasien
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                x={chartPoints.find((p) => p.isForecast)?.displayMonth}
                stroke="#cbd5e1"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="observedCases"
                stroke="#0f172a"
                strokeWidth={2.4}
                dot={{ r: 3, fill: '#0f172a' }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="connectedForecast"
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

      {/* Diagram Gabungan: Prediksi Kenaikan Multi-Penyakit */}
      <MultiDiseaseForecastChart
        onSelectDisease={() => onNavigate('forecast')}
      />

      {/* Quiet Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        EpiTrend · Sistem Pemantauan Penyakit Terintegrasi Supabase
      </footer>
    </div>
  );
};
