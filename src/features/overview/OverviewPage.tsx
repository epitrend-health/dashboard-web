import React, { useState } from 'react';
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
import { MOCK_DISEASES } from '../../lib/mock-data/diseases';
import { getForecastForDisease } from '../../lib/mock-data/forecasts';
import { MultiDiseaseForecastChart } from '../../components/charts/MultiDiseaseForecastChart';
import { NavigationTab } from '../../types';

interface OverviewPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [selectedDisease, setSelectedDisease] = useState<string>('all');

  const forecastData = getForecastForDisease(selectedDisease, 'sarima');

  // Last 12 months + next 4 months for clean, uncluttered visualization
  const chartPoints = [
    ...forecastData.points.filter((p) => !p.isForecast).slice(-10).map((pt) => ({
      displayMonth: pt.displayMonth,
      observedCases: pt.observed,
      forecastCases: null,
      connectedForecast: pt.month === '2026-09' ? pt.observed : null,
      isForecast: false,
    })),
    ...forecastData.points.filter((p) => p.isForecast).slice(0, 4).map((pt) => ({
      displayMonth: pt.displayMonth,
      observedCases: null,
      forecastCases: pt.forecast,
      connectedForecast: pt.forecast,
      isForecast: true,
    })),
  ];

  const topDiseases = [
    { name: 'Flu (Influenza)', cases: 9420, pct: 85, trend: '+14% musim dingin' },
    { name: 'COVID-19', cases: 7890, pct: 70, trend: 'Stabil' },
    { name: 'RSV (Infeksi Paru)', cases: 4980, pct: 45, trend: '+22% meningkat' },
    { name: 'Norovirus (Sakit Perut)', cases: 3410, pct: 30, trend: 'Normal' },
  ];

  return (
    <div className="space-y-8">
      {/* 4 Clean Minimalist Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Kasus Bulan Ini (Oktober 2026)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              1,140
            </span>
            <span className="text-xs text-slate-500 font-normal">pasien</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Volume pasien dalam batas normal
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Prediksi Bulan Depan (November 2026)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-teal-700 tabular-nums">
              ~1,280
            </span>
            <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
              +12%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Kenaikan musiman wajar jelang akhir tahun
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Penyakit Terbanyak Saat Ini
          </span>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate block">
              Flu (Influenza)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Mencakup ~28% dari total kunjungan
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">
            Total Rekam Kasus Terdata
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              34,820
            </span>
            <span className="text-xs text-slate-500 font-normal">kasus</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-2 block">
            ✓ 100% data terverifikasi
          </span>
        </div>
      </div>

      {/* 1 Clean Minimalist Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tren Jumlah Pasien & Prediksi Mendatang
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Data kunjungan pasien per bulan dan perkiraan untuk bulan depan
            </p>
          </div>

          <select
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-hidden"
          >
            <option value="all">Semua Penyakit (Total)</option>
            {MOCK_DISEASES.slice(0, 5).map((d) => (
              <option key={d.id} value={d.id}>
                {d.commonName || d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clean Chart Legend */}
        <div className="flex items-center gap-6 py-3 text-xs text-slate-500 border-b border-slate-50 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-slate-900 rounded-full" />
            <span className="font-medium text-slate-700">Data Riwayat Pasien</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 border-t-2 border-dashed border-teal-600" />
            <span className="font-medium text-teal-800">Perkiraan Kasus Mendatang</span>
          </div>
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
                x="Sep 2026"
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

      {/* Diagram Gabungan: Prediksi Kenaikan Semua Penyakit Sekaligus */}
      <MultiDiseaseForecastChart
        onSelectDisease={() => onNavigate('forecast')}
      />

      {/* Clean Minimalist Disease List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">
            Daftar Penyakit Utama di Rumah Sakit
          </h4>
          <button
            onClick={() => onNavigate('forecast')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900"
          >
            Lihat Prediksi Lengkap →
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {topDiseases.map((d) => (
            <div key={d.name} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-slate-900 block truncate">{d.name}</span>
                <span className="text-[11px] text-slate-400">{d.cases.toLocaleString()} pasien tercatat</span>
              </div>

              <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                <div
                  className="h-full bg-slate-900 rounded-full"
                  style={{ width: `${d.pct}%` }}
                />
              </div>

              <span className="text-[11px] font-medium text-slate-500 shrink-0">
                {d.trend}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        EpiTrend · Sistem Pemantauan Penyakit St. Jude Hospital
      </footer>
    </div>
  );
};
