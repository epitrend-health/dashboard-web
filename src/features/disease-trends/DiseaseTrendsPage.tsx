import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Filter,
  TrendingUp,
  BarChart2,
  Grid,
  Search,
  Activity,
  Layers,
  Info,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ApiService } from '../../lib/services/apiMock';
import { Disease, MonthlyCasePoint } from '../../types';
import { DisclaimerBanner } from '../../components/ui/DisclaimerBanner';

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

interface DiseaseTrendsPageProps {
  simpleMode?: boolean;
}

export const DiseaseTrendsPage: React.FC<DiseaseTrendsPageProps> = ({ simpleMode = true }) => {
  const [diseasesList, setDiseasesList] = useState<Disease[]>([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'12m' | '24m' | 'all'>('all');
  const [showMovingAverage, setShowMovingAverage] = useState<boolean>(!simpleMode);
  const [activeTab, setActiveTab] = useState<'timeline' | 'yoy'>('timeline');
  const [rawCases, setRawCases] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Ambil list penyakit dari database Supabase
  useEffect(() => {
    async function loadDiseases() {
      try {
        const list = await ApiService.getDiseases();
        if (list && list.length > 0) {
          setDiseasesList(list);
          setSelectedDiseaseId(list[0].code || list[0].id);
        }
      } catch (err) {
        console.error('Gagal memuat list penyakit dari database:', err);
      }
    }
    loadDiseases();
  }, []);

  // 2. Ambil riwayat kasus penyakit terpilih dari View database
  useEffect(() => {
    async function loadCases() {
      if (!selectedDiseaseId) return;
      setLoading(true);
      try {
        const res = await ApiService.getCases({ diseaseId: selectedDiseaseId });
        setRawCases(res || []);
      } catch (err) {
        console.error('Gagal mengambil riwayat kasus:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, [selectedDiseaseId]);

  const selectedDisease = diseasesList.find((d) => (d.code || d.id) === selectedDiseaseId) || diseasesList[0] || {
    id: '',
    name: 'Memuat...',
    category: 'General',
  };

  // Filter raw case points berdasarkan time range
  const diseaseCases = useMemo(() => {
    let list = [...rawCases];
    if (timeRange === '12m') {
      list = list.slice(-12);
    } else if (timeRange === '24m') {
      list = list.slice(-24);
    }
    return list;
  }, [rawCases, timeRange]);

  // Compute 3-Month Moving Average
  const timelineChartData = useMemo(() => {
    return diseaseCases.map((pt, idx) => {
      const casesVal = Number(pt.total_cases ?? pt.cases ?? 0);
      let ma3: number | null = null;
      if (idx >= 2) {
        const c0 = Number(diseaseCases[idx].total_cases ?? diseaseCases[idx].cases ?? 0);
        const c1 = Number(diseaseCases[idx - 1].total_cases ?? diseaseCases[idx - 1].cases ?? 0);
        const c2 = Number(diseaseCases[idx - 2].total_cases ?? diseaseCases[idx - 2].cases ?? 0);
        ma3 = Math.round((c0 + c1 + c2) / 3);
      }
      return {
        month: pt.month,
        displayMonth: pt.month,
        cases: casesVal,
        movingAvg: ma3,
      };
    });
  }, [diseaseCases]);

  // Compute Year-over-Year overlay dari data database
  const yoyChartData = useMemo(() => {
    const years = Array.from(new Set(rawCases.map((c) => c.month?.split('-')[0]))).filter(Boolean).sort().slice(-3);
    
    return MONTH_NAMES.map((name, mIdx) => {
      const mStr = String(mIdx + 1).padStart(2, '0');
      const row: Record<string, any> = { monthName: name };

      years.forEach((yr) => {
        const targetMonth = `${yr}-${mStr}`;
        const found = rawCases.find((c) => c.month === targetMonth);
        row[`cases_${yr}`] = found ? Number(found.total_cases ?? found.cases) : null;
      });

      return row;
    });
  }, [rawCases]);

  // Summary statistics untuk penyakit terpilih
  const stats = useMemo(() => {
    if (!diseaseCases.length) return { max: 0, min: 0, mean: 0, peakMonth: 'N/A' };
    const values = diseaseCases.map((c) => Number(c.total_cases ?? c.cases ?? 0));
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const meanVal = Math.round(sum / values.length);
    const peakPt = diseaseCases.find((c) => Number(c.total_cases ?? c.cases ?? 0) === maxVal);

    return {
      max: maxVal,
      min: minVal,
      mean: meanVal,
      peakMonth: peakPt ? peakPt.month : 'N/A',
    };
  }, [diseaseCases]);

  return (
    <div className="space-y-6">
      <DisclaimerBanner customMessage="Analisis tren riwayat penyakit dihitung otomatis dari data rekam medis Supabase PostgreSQL." />

      {/* Disease Selector Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Pilih Penyakit dari Database
            </label>
            <select
              value={selectedDiseaseId}
              onChange={(e) => setSelectedDiseaseId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              {diseasesList.map((d) => (
                <option key={d.code || d.id} value={d.code || d.id}>
                  {d.name} ({d.category || 'Clinical'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Rentang Waktu:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setTimeRange('12m')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  timeRange === '12m' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1 Tahun Terakhir
              </button>
              <button
                onClick={() => setTimeRange('24m')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  timeRange === '24m' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2 Tahun Terakhir
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  timeRange === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Riwayat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Kategori Diagnosis</span>
          <div className="mt-1.5 text-base font-bold text-slate-900">
            {selectedDisease.category || 'Clinical Conditions'}
          </div>
          <span className="text-xs text-teal-700 mt-1 block">Klasifikasi surveilans RS</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Rata-rata Kasus Bulanan</span>
          <div className="mt-1.5 text-xl font-bold text-slate-900 tabular-nums">
            ~{stats.mean.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Baseline rekam medis bulanan</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Puncak Lonjakan Tertinggi</span>
          <div className="mt-1.5 text-xl font-bold text-rose-700 tabular-nums">
            {stats.max.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Terekam pada {stats.peakMonth}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Kasus Terendah (Off-Peak)</span>
          <div className="mt-1.5 text-xl font-bold text-emerald-700 tabular-nums">
            {stats.min.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Periode tenang</span>
        </div>
      </div>

      {/* Trend Visualization Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {selectedDisease.name} — Tren Kasus Riil Bulanan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Data terverifikasi dari View database `monthly_disease_cases`
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Garis Waktu Bulanan</span>
            </button>
            <button
              onClick={() => setActiveTab('yoy')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'yoy'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Perbandingan YoY</span>
            </button>
          </div>
        </div>

        <div className="h-80 w-full mt-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Memuat data grafik dari database...
            </div>
          ) : timelineChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Tidak ada data riwayat untuk penyakit ini di database.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="displayMonth" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-1 shadow-lg">
                          <div className="text-slate-400">{label}</div>
                          <div className="font-bold text-white">Kasus: {payload[0]?.value} pasien</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="cases" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3, fill: '#0d9488' }} isAnimationActive={false} />
                {showMovingAverage && (
                  <Line type="monotone" dataKey="movingAvg" stroke="#64748b" strokeWidth={1.8} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
