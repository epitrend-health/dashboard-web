import React, { useState, useEffect, useMemo } from 'react';
import {
  PackageCheck,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Layers,
  Pill,
  Info,
  Calendar,
  CheckCircle2,
  Boxes,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ApiService } from '../../lib/services/apiMock';
import { Disease } from '../../types';
import { DisclaimerBanner } from '../../components/ui/DisclaimerBanner';

export const SupplyDemandPage: React.FC = () => {
  const [diseasesList, setDiseasesList] = useState<Disease[]>([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('444814009');
  const [supplyData, setSupplyData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 1. Ambil list penyakit dari database
  useEffect(() => {
    async function loadDiseases() {
      try {
        const list = await ApiService.getDiseases();
        if (list && list.length > 0) {
          setDiseasesList(list);
        }
      } catch (err) {
        console.warn('Gagal memuat list penyakit:', err);
      }
    }
    loadDiseases();
  }, []);

  // 2. Ambil data analisis kebutuhan vs ketersediaan obat
  useEffect(() => {
    async function fetchSupplyDemand() {
      if (!selectedDiseaseId) return;
      setLoading(true);
      try {
        const res = await ApiService.getSupplyDemand(selectedDiseaseId);
        setSupplyData(res);
      } catch (err) {
        console.error('Gagal mengambil data supply-demand:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSupplyDemand();
  }, [selectedDiseaseId]);

  const timeline = supplyData?.data || [];
  const selectedDisease = diseasesList.find((d) => (d.code || d.id) === selectedDiseaseId) || {
    name: supplyData?.data[0]?.diseaseName || 'Penyakit Terpilih',
  };

  // Ringkasan metrik
  const metrics = useMemo(() => {
    if (!timeline.length) return { shortageCount: 0, surplusCount: 0, optimalCount: 0 };
    const shortageCount = timeline.filter((d: any) => d.status === 'shortage').length;
    const surplusCount = timeline.filter((d: any) => d.status === 'surplus').length;
    const optimalCount = timeline.filter((d: any) => d.status === 'optimal').length;
    return { shortageCount, surplusCount, optimalCount };
  }, [timeline]);

  return (
    <div className="space-y-6">
      <DisclaimerBanner customMessage="Analisis perbandingan kebutuhan obat dihitung riil dari volume kasus penyakit (Supabase) dikalikan standar resep obat formularium (medications.csv)." />

      {/* Control & Selector Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <Boxes className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Kebutuhan Kasus vs Ketersediaan Stok Obat
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Evaluasi risiko defisit (obat kurang saat lonjakan kasus) atau surplus (overstock saat kasus reda).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Pilih Penyakit:</span>
            <select
              value={selectedDiseaseId}
              onChange={(e) => setSelectedDiseaseId(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              {diseasesList.map((d) => (
                <option key={d.code || d.id} value={d.code || d.id}>
                  {d.name} ({d.code || d.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info Obat Utama */}
        {supplyData && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>Obat Formularium Terpantau:</span>
              <strong className="text-slate-900 font-semibold">{supplyData.medicationName}</strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Standar Alokasi Pengadaan RS:</span>
              <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                {supplyData.allocatedSupplyBaseline} {supplyData.unit} / bulan
              </span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards: Defisit vs Surplus */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bulan Defisit (Kurang Stok)</span>
            <span className="p-1 rounded-md bg-rose-50 text-rose-600">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700 tabular-nums">
            {metrics.shortageCount} <span className="text-xs font-normal text-slate-400">bulan</span>
          </div>
          <span className="text-[11px] text-rose-600 mt-1 block">Kasus melonjak melampaui kuota stok</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bulan Seimbang (Optimal)</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 tabular-nums">
            {metrics.optimalCount} <span className="text-xs font-normal text-slate-400">bulan</span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">Kebutuhan pasien terpenuhi stabil</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bulan Surplus (Stok Mengendap)</span>
            <span className="p-1 rounded-md bg-amber-50 text-amber-600">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 tabular-nums">
            {metrics.surplusCount} <span className="text-xs font-normal text-slate-400">bulan</span>
          </div>
          <span className="text-[11px] text-amber-600 mt-1 block">Kasus reda, risiko obat kedaluwarsa</span>
        </div>
      </div>

      {/* Main Chart: Kebutuhan (Bar) vs Alokasi Stok (Line) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Diagram Komparasi: Kebutuhan Resep Pasien vs Kuota Stok Tersedia
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Garis putus-putus menunjukkan ambang alokasi persediaan bulanan rumah sakit
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500" />
              <span className="text-slate-600">Kebutuhan Obat Pasien</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-teal-600" />
              <span className="text-slate-600">Kapasitas Stok Pengadaan</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full mt-4">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Menghitung komparasi logistik dari rekam medis...
            </div>
          ) : timeline.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Tidak ada data transaksi obat untuk penyakit ini.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeline} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="displayMonth" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const row = payload[0].payload;
                      const isShort = row.status === 'shortage';
                      const isSurplus = row.status === 'surplus';
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1.5 shadow-xl max-w-xs border border-slate-800">
                          <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
                            <span>{label}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                isShort
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : isSurplus
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {isShort ? 'Defisit' : isSurplus ? 'Surplus' : 'Optimal'}
                            </span>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="text-slate-300">
                              Pasien Terdata: <strong className="text-white">{row.cases} kasus</strong>
                            </div>
                            <div className="text-rose-300">
                              Kebutuhan Obat: <strong>{row.requiredDemand} {row.unit}</strong>
                            </div>
                            <div className="text-teal-300">
                              Stok Tersedia: <strong>{row.allocatedSupply} {row.unit}</strong>
                            </div>
                            <div className="pt-1 border-t border-slate-800 font-semibold text-slate-300">
                              Selisih: {row.balance > 0 ? `+${row.balance}` : row.balance} {row.unit}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="requiredDemand"
                  name="Kebutuhan Obat"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="allocatedSupply"
                  name="Stok Pengadaan RS"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#0d9488' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
