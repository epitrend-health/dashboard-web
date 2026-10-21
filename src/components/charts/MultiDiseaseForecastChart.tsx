import React, { useState, useEffect, useMemo } from 'react';
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
import { ApiService } from '../../lib/services/apiMock';
import { Disease } from '../../types';

interface DiseaseConfig {
  id: string;
  code: string;
  name: string;
  shortName: string;
  color: string;
  category: string;
  defaultVisible: boolean;
  baseCases: number;
  maxFuture: number;
  peakMonth: string;
  pctChange: number;
  isRising: boolean;
  isFalling: boolean;
  points: any[];
}

const PALETTE = [
  '#e11d48', // Rose
  '#0d9488', // Teal
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#0284c7', // Sky
  '#ec4899', // Pink
];

interface MultiDiseaseForecastChartProps {
  onSelectDisease?: (diseaseId: string) => void;
}

export const MultiDiseaseForecastChart: React.FC<MultiDiseaseForecastChartProps> = ({
  onSelectDisease,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [horizonMonths, setHorizonMonths] = useState<6 | 12>(6);
  const [loading, setLoading] = useState<boolean>(true);
  const [diseaseForecasts, setDiseaseForecasts] = useState<DiseaseConfig[]>([]);
  const [visibleDiseases, setVisibleDiseases] = useState<Record<string, boolean>>({});

  // 1. Ambil penyakit langsung dari database Supabase melalui API
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const rawDiseases = await ApiService.getDiseases();
        const topDiseases = (rawDiseases || []).slice(0, 6);

        // Ambil forecast per penyakit secara paralel dari endpoint API Supabase
        const results = await Promise.all(
          topDiseases.map(async (d, idx) => {
            try {
              const fc = await ApiService.getForecast(d.code || d.id, 'sarima');
              const points = fc?.points || [];
              const histPts = points.filter((p) => !p.isForecast);
              const futurePts = points.filter((p) => p.isForecast);
              const horizonPts = futurePts.slice(0, horizonMonths);

              const lastObs = histPts.length > 0 ? histPts[histPts.length - 1] : null;
              const baseCases = lastObs ? (lastObs.observed || lastObs.forecast || 1) : 1;
              const maxFuture = horizonPts.length > 0 ? Math.max(...horizonPts.map((p) => p.forecast || 0)) : baseCases;
              const peakPoint = horizonPts.find((p) => (p.forecast || 0) === maxFuture);
              const pctChange = Math.round(((maxFuture - baseCases) / (baseCases || 1)) * 100);

              const shortName = d.name.length > 20 ? d.name.substring(0, 18) + '...' : d.name;

              return {
                id: d.code || d.id,
                code: d.code || d.id,
                name: d.name,
                shortName,
                color: PALETTE[idx % PALETTE.length],
                category: d.category || 'Clinical Conditions',
                defaultVisible: true,
                baseCases,
                maxFuture,
                peakMonth: peakPoint?.displayMonth || (horizonPts[0]?.displayMonth || 'Upcoming'),
                pctChange,
                isRising: pctChange > 15,
                isFalling: pctChange < -15,
                points,
              } as DiseaseConfig;
            } catch (err) {
              console.warn(`Gagal memuat forecast untuk ${d.name}:`, err);
              return null;
            }
          })
        );

        const validConfigs = results.filter(Boolean) as DiseaseConfig[];
        setDiseaseForecasts(validConfigs);

        const initialVisible: Record<string, boolean> = {};
        validConfigs.forEach((c) => {
          initialVisible[c.id] = true;
        });
        setVisibleDiseases(initialVisible);
      } catch (err) {
        console.error('Gagal mengambil daftar penyakit real time:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [horizonMonths]);

  // Ekstrak daftar kategori unik dari data database
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    diseaseForecasts.forEach((d) => {
      if (d.category) cats.add(d.category);
    });
    return Array.from(cats);
  }, [diseaseForecasts]);

  // Bangun timeline bulan secara dinamis dari titik-titik data riil database
  const chartData = useMemo(() => {
    if (diseaseForecasts.length === 0) return [];

    // Ambil semua bulan unik dari data forecast
    const monthMap = new Map<string, { displayMonth: string; isForecast: boolean }>();
    diseaseForecasts.forEach((df) => {
      // Ambil 6 riwayat terakhir + n bulan masa depan
      const hist = df.points.filter((p) => !p.isForecast).slice(-6);
      const fut = df.points.filter((p) => p.isForecast).slice(0, horizonMonths);
      [...hist, ...fut].forEach((p) => {
        if (!monthMap.has(p.month)) {
          monthMap.set(p.month, {
            displayMonth: p.displayMonth,
            isForecast: Boolean(p.isForecast),
          });
        }
      });
    });

    const sortedMonths = Array.from(monthMap.keys()).sort();

    return sortedMonths.map((m) => {
      const meta = monthMap.get(m)!;
      const row: Record<string, any> = {
        month: m,
        displayMonth: meta.displayMonth,
        isForecast: meta.isForecast,
      };

      diseaseForecasts.forEach((df) => {
        const pt = df.points.find((p) => p.month === m);
        if (pt) {
          row[df.id] = pt.isForecast ? pt.forecast : (pt.observed ?? pt.forecast);
        }
      });

      return row;
    });
  }, [diseaseForecasts, horizonMonths]);

  const toggleDisease = (id: string) => {
    setVisibleDiseases((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter penyakit berdasarkan kategori database yang dipilih
  const displayedDiseases = useMemo(() => {
    return diseaseForecasts.filter((d) => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'rising_only') return d.isRising;
      return d.category.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [diseaseForecasts, selectedCategory]);

  return (
    <div className="space-y-4">
      {/* Header & Controls Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                <Layers className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Diagram Gabungan Multi-Penyakit (Database Supabase)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Perbandingan tren penyakit aktif dari rekam medis database riil dan proyeksi lonjakannya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Kategori Dinamis dari Database */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Kategori
              </button>

              <button
                onClick={() => setSelectedCategory('rising_only')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  selectedCategory === 'rising_only'
                    ? 'bg-white text-rose-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                <span>Hanya Lonjakan</span>
              </button>

              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedCategory === cat
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Jangkauan Proyeksi */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setHorizonMonths(6)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  horizonMonths === 6
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                6 Bulan
              </button>
              <button
                onClick={() => setHorizonMonths(12)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  horizonMonths === 12
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                12 Bulan
              </button>
            </div>
          </div>
        </div>

        {/* Legend Interaktif: Toggle penyakit dinamis */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Penyakit Terpantau:
          </span>
          {diseaseForecasts.map((d) => {
            const isVisible = visibleDiseases[d.id];
            return (
              <button
                key={d.id}
                onClick={() => toggleDisease(d.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isVisible
                    ? 'bg-white text-slate-800 border-slate-200 shadow-xs'
                    : 'bg-slate-50 text-slate-400 border-dashed border-slate-200 line-through'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: isVisible ? d.color : '#cbd5e1' }}
                />
                <span>{d.shortName}</span>
                <span className="text-[10px] text-slate-400 font-mono">({d.category})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        {loading ? (
          <div className="h-80 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
            <span className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span>Menghitung tren dan proyeksi dari database...</span>
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="displayMonth" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1.5 shadow-xl max-w-xs border border-slate-800">
                          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
                            <span>{label}</span>
                            <span className="text-[10px] text-teal-400 font-mono">Real DB</span>
                          </div>
                          <div className="space-y-1">
                            {payload.map((item: any) => {
                              const config = diseaseForecasts.find((d) => d.id === item.dataKey);
                              if (!config) return null;
                              return (
                                <div key={item.dataKey} className="flex items-center justify-between text-[11px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-300">{config.shortName}:</span>
                                  </div>
                                  <span className="font-bold text-white tabular-nums">
                                    {Math.round(item.value)} kasus
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
                      dot={{ r: 3, fill: df.color }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
