import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Info,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MOCK_DISEASES } from '../../lib/mock-data/diseases';
import { getForecastForDisease } from '../../lib/mock-data/forecasts';

interface DiseaseConfig {
  id: string;
  name: string;
  shortName: string;
  color: string;
  category: string;
  defaultVisible: boolean;
}

const TRACKED_DISEASES: DiseaseConfig[] = [
  {
    id: 'influenza',
    name: 'Flu (Influenza A & B)',
    shortName: 'Flu',
    color: '#e11d48', // Red / Rose
    category: 'Pernapasan',
    defaultVisible: true,
  },
  {
    id: 'rsv',
    name: 'RSV (Infeksi Paru Balita & Lansia)',
    shortName: 'RSV',
    color: '#f59e0b', // Amber / Orange
    category: 'Pernapasan',
    defaultVisible: true,
  },
  {
    id: 'covid19',
    name: 'COVID-19',
    shortName: 'COVID-19',
    color: '#6366f1', // Indigo / Purple
    category: 'Pernapasan',
    defaultVisible: true,
  },
  {
    id: 'norovirus',
    name: 'Norovirus (Muntaber / Lambung)',
    shortName: 'Norovirus',
    color: '#0d9488', // Teal
    category: 'Pencernaan',
    defaultVisible: true,
  },
  {
    id: 'dengue',
    name: 'Demam Berdarah (Dengue)',
    shortName: 'Dengue (DBD)',
    color: '#10b981', // Emerald / Green
    category: 'Nyamuk',
    defaultVisible: true,
  },
];

interface MultiDiseaseForecastChartProps {
  onSelectDisease?: (diseaseId: string) => void;
}

export const MultiDiseaseForecastChart: React.FC<MultiDiseaseForecastChartProps> = ({
  onSelectDisease,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'rising_only' | 'respiratory'>('all');
  const [horizonMonths, setHorizonMonths] = useState<6 | 12>(6);
  const [visibleDiseases, setVisibleDiseases] = useState<Record<string, boolean>>({
    influenza: true,
    rsv: true,
    covid19: true,
    norovirus: true,
    dengue: true,
  });

  // Pull real forecast points for each disease
  const diseaseForecasts = useMemo(() => {
    return TRACKED_DISEASES.map((d) => {
      const fc = getForecastForDisease(d.id, 'sarima');
      const histPt = fc.points.find((p) => p.month === '2026-09');
      const baseCases = histPt ? (histPt.observed || histPt.forecast) : 100;
      const futurePts = fc.points.filter((p) => p.isForecast);
      const horizonPts = futurePts.slice(0, horizonMonths);
      
      const maxFuture = Math.max(...horizonPts.map((p) => p.forecast));
      const peakPoint = horizonPts.find((p) => p.forecast === maxFuture);
      const pctChange = Math.round(((maxFuture - baseCases) / baseCases) * 100);
      const isRising = pctChange > 15;
      const isFalling = pctChange < -15;

      return {
        ...d,
        baseCases,
        maxFuture,
        peakMonth: peakPoint?.displayMonth || 'Nov 2026',
        pctChange,
        isRising,
        isFalling,
        points: fc.points,
      };
    });
  }, [horizonMonths]);

  // Build combined multi-line timeline chart data
  const chartData = useMemo(() => {
    // 1 historical anchor month (Sep 2026) + upcoming horizon months
    const months = [
      { month: '2026-09', displayMonth: 'Sep 2026 (Riwayat)', isForecast: false },
      { month: '2026-10', displayMonth: 'Okt 2026', isForecast: true },
      { month: '2026-11', displayMonth: 'Nov 2026', isForecast: true },
      { month: '2026-12', displayMonth: 'Des 2026', isForecast: true },
      { month: '2027-01', displayMonth: 'Jan 2027', isForecast: true },
      { month: '2027-02', displayMonth: 'Feb 2027', isForecast: true },
      { month: '2027-03', displayMonth: 'Mar 2027', isForecast: true },
      ...(horizonMonths === 12
        ? [
            { month: '2027-04', displayMonth: 'Apr 2027', isForecast: true },
            { month: '2027-05', displayMonth: 'Mei 2027', isForecast: true },
            { month: '2027-06', displayMonth: 'Jun 2027', isForecast: true },
            { month: '2027-07', displayMonth: 'Jul 2027', isForecast: true },
            { month: '2027-08', displayMonth: 'Agu 2027', isForecast: true },
            { month: '2027-09', displayMonth: 'Sep 2027', isForecast: true },
          ]
        : []),
    ];

    return months.map((m) => {
      const row: Record<string, any> = {
        month: m.month,
        displayMonth: m.displayMonth,
        isForecast: m.isForecast,
      };

      diseaseForecasts.forEach((df) => {
        const pt = df.points.find((p) => p.month === m.month);
        if (pt) {
          row[df.id] = pt.isForecast ? pt.forecast : (pt.observed || pt.forecast);
        }
      });

      return row;
    });
  }, [diseaseForecasts, horizonMonths]);

  // Toggle single disease visibility
  const toggleDisease = (id: string) => {
    setVisibleDiseases((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filtered diseases based on user filter mode
  const displayedDiseases = useMemo(() => {
    return diseaseForecasts.filter((d) => {
      if (filterMode === 'rising_only') {
        return d.isRising;
      }
      if (filterMode === 'respiratory') {
        return d.category === 'Pernapasan';
      }
      return true;
    });
  }, [diseaseForecasts, filterMode]);

  const risingDiseasesCount = diseaseForecasts.filter((d) => d.isRising).length;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header with Title and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Diagram Gabungan: Prediksi Kenaikan Semua Penyakit
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Melihat sekaligus grafik perbandingan tren kasus mendatang untuk mendeteksi penyakit yang akan melonjak (Surge).
          </p>
        </div>

        {/* View Controls: Filter & Horizon */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Quick Filter: All vs Rising Only */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Semua Penyakit
            </button>
            <button
              onClick={() => setFilterMode('rising_only')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium flex items-center gap-1.5 ${
                filterMode === 'rising_only'
                  ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200 shadow-xs'
                  : 'text-slate-500 hover:text-rose-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
              <span>Hanya yang Diprediksi Naik ({risingDiseasesCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('respiratory')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                filterMode === 'respiratory'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Saluran Napas
            </button>
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setHorizonMonths(6)}
              className={`px-2.5 py-1.5 rounded-lg transition-all font-medium ${
                horizonMonths === 6
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              6 Bulan
            </button>
            <button
              onClick={() => setHorizonMonths(12)}
              className={`px-2.5 py-1.5 rounded-lg transition-all font-medium ${
                horizonMonths === 12
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              1 Tahun
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards: Status Kenaikan Setiap Penyakit */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {diseaseForecasts.map((df) => {
          const isVisible = visibleDiseases[df.id];
          return (
            <button
              key={df.id}
              onClick={() => toggleDisease(df.id)}
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${
                isVisible
                  ? 'bg-slate-50/80 border-slate-200 shadow-xs'
                  : 'bg-white border-slate-100 opacity-50 hover:opacity-80'
              }`}
            >
              {/* Color Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: df.color }}
              />

              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-bold text-slate-900 truncate">
                  {df.shortName}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: df.color }}
                />
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-1">
                <span className="text-xs text-slate-500">Puncak:</span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">
                  ~{df.maxFuture} psn
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 truncate">{df.peakMonth}</span>
                {df.pctChange > 0 ? (
                  <span className={`font-bold flex items-center ${
                    df.pctChange > 25 ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                    +{df.pctChange}%
                  </span>
                ) : (
                  <span className="text-emerald-600 font-bold flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                    {df.pctChange}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Combined Chart */}
      <div className="space-y-3">
        {/* Chart Sub-legend and hint */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 px-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-slate-600 font-medium">Titik Awal: Sep 2026</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-t-2 border-dashed border-teal-500" />
              <span className="text-teal-700 font-medium">Prediksi Mendatang (Okt 2026 – {horizonMonths === 6 ? 'Mar 2027' : 'Sep 2027'})</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Klik kartu penyakit di atas untuk menyembunyikan/menampilkan garis
          </span>
        </div>

        {/* The Multi-Line Chart Container */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 15, left: -10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="displayMonth"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const rowData = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[200px] space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="font-bold text-slate-200">{label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            rowData.isForecast ? 'bg-teal-900/60 text-teal-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {rowData.isForecast ? 'Prediksi' : 'Data Riwayat'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {payload.map((item: any) => {
                            const config = TRACKED_DISEASES.find((d) => d.id === item.dataKey);
                            if (!config) return null;
                            return (
                              <div
                                key={item.dataKey}
                                className="flex items-center justify-between text-[11px]"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  <span className="text-slate-300">{config.shortName}:</span>
                                </div>
                                <span className="font-bold text-white tabular-nums">
                                  {Math.round(item.value)} pasien
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {/* Divider line between historical and forecast */}
              <ReferenceLine
                x="Sep 2026 (Riwayat)"
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{
                  value: 'Batas Riwayat',
                  position: 'top',
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />

              {/* Render dynamic line for each selected disease */}
              {displayedDiseases.map((df) => {
                if (!visibleDiseases[df.id]) return null;
                return (
                  <Line
                    key={df.id}
                    type="monotone"
                    dataKey={df.id}
                    name={df.shortName}
                    stroke={df.color}
                    strokeWidth={df.isRising ? 2.8 : 2}
                    strokeDasharray={df.id === 'dengue' ? '3 3' : undefined}
                    dot={{ r: 3, fill: df.color }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actionable Insights Box: Peringatan Kesiapan Rumah Sakit */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">
              Peringatan Lonjakan Kasus Mendatang (Periode Nov 2026 – Feb 2027)
            </span>
            <p className="text-slate-600 mt-0.5">
              Penyakit saluran pernapasan (<strong className="text-slate-900">Flu +121%</strong>, <strong className="text-slate-900">RSV +157%</strong>, dan <strong className="text-slate-900">COVID-19 +81%</strong>) diprediksi mengalami lonjakan bersamaan saat musim dingin. Rumah sakit disarankan menyiapkan persediaan obat flu, oksigen, dan kapasitas tempat tidur pediatrik.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Dengue (DBD) Turun -74%
          </span>
        </div>
      </div>
    </div>
  );
};
