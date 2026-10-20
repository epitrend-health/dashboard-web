import React, { useState, useMemo } from 'react';
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
import { MOCK_DISEASES } from '../../lib/mock-data/diseases';
import { MOCK_MONTHLY_CASES, MONTH_NAMES } from '../../lib/mock-data/monthlyCases';
import { SeasonalHeatmap } from './SeasonalHeatmap';
import { DisclaimerBanner } from '../../components/ui/DisclaimerBanner';

interface DiseaseTrendsPageProps {
  simpleMode?: boolean;
}

export const DiseaseTrendsPage: React.FC<DiseaseTrendsPageProps> = ({ simpleMode = true }) => {
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('influenza');
  const [timeRange, setTimeRange] = useState<'12m' | '24m' | 'all'>('all');
  const [showMovingAverage, setShowMovingAverage] = useState<boolean>(!simpleMode);
  const [activeTab, setActiveTab] = useState<'timeline' | 'heatmap' | 'yoy'>('timeline');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const selectedDisease = MOCK_DISEASES.find((d) => d.id === selectedDiseaseId) || MOCK_DISEASES[0];

  // Filter raw case points for the chosen disease
  const diseaseCases = useMemo(() => {
    let list = MOCK_MONTHLY_CASES.filter((c) => c.diseaseId === selectedDiseaseId);
    if (timeRange === '12m') {
      list = list.slice(-12);
    } else if (timeRange === '24m') {
      list = list.slice(-24);
    }
    return list;
  }, [selectedDiseaseId, timeRange]);

  // Compute 3-Month Moving Average
  const timelineChartData = useMemo(() => {
    return diseaseCases.map((pt, idx) => {
      let ma3: number | null = null;
      if (idx >= 2) {
        const windowSum = diseaseCases[idx].cases + diseaseCases[idx - 1].cases + diseaseCases[idx - 2].cases;
        ma3 = Math.round(windowSum / 3);
      }
      return {
        month: pt.month,
        displayMonth: pt.displayMonth,
        cases: pt.cases,
        movingAvg: ma3,
      };
    });
  }, [diseaseCases]);

  // Compute Year-over-Year overlay
  const yoyChartData = useMemo(() => {
    return MONTH_NAMES.map((name, mIdx) => {
      const mNum = mIdx + 1;
      const c2024 = MOCK_MONTHLY_CASES.find(
        (c) => c.diseaseId === selectedDiseaseId && c.year === 2024 && c.monthNum === mNum
      )?.cases ?? null;
      const c2025 = MOCK_MONTHLY_CASES.find(
        (c) => c.diseaseId === selectedDiseaseId && c.year === 2025 && c.monthNum === mNum
      )?.cases ?? null;
      const c2026 = MOCK_MONTHLY_CASES.find(
        (c) => c.diseaseId === selectedDiseaseId && c.year === 2026 && c.monthNum === mNum
      )?.cases ?? null;

      return {
        monthName: name,
        cases2024: c2024,
        cases2025: c2025,
        cases2026: c2026,
      };
    });
  }, [selectedDiseaseId]);

  // Summary statistics for selected disease
  const stats = useMemo(() => {
    if (!diseaseCases.length) return { max: 0, min: 0, mean: 0, peakMonth: 'N/A' };
    const values = diseaseCases.map((c) => c.cases);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const meanVal = Math.round(sum / values.length);
    const peakPt = diseaseCases.find((c) => c.cases === maxVal);

    return {
      max: maxVal,
      min: minVal,
      mean: meanVal,
      peakMonth: peakPt ? peakPt.displayMonth : 'N/A',
    };
  }, [diseaseCases]);

  return (
    <div className="space-y-6">
      <DisclaimerBanner customMessage="Historical disease trend patterns are based on sample hospital counts to illustrate yearly disease changes." />

      {/* Clean, Non-Overwhelming Disease Selector Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Choose an Illness to Explore
            </label>
            <select
              value={selectedDiseaseId}
              onChange={(e) => setSelectedDiseaseId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            >
              {MOCK_DISEASES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.commonName || d.name} ({d.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Time Window:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setTimeRange('12m')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  timeRange === '12m' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Past 1 Year
              </button>
              <button
                onClick={() => setTimeRange('24m')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  timeRange === '24m' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Past 2 Years
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  timeRange === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Records
              </button>
            </div>
          </div>
        </div>

        {/* Friendly Plain-English Explanation of Selected Illness */}
        {selectedDisease.friendlyDescription && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              <strong className="text-slate-900 font-semibold">{selectedDisease.commonName || selectedDisease.name}:</strong>{' '}
              {selectedDisease.friendlyDescription}
            </p>
          </div>
        )}
      </div>

      {/* 4 Clean Plain Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Usual Peak Season</span>
          <div className="mt-1.5 text-base font-bold text-slate-900">
            {selectedDisease.currentSeasonPeak}
          </div>
          <span className="text-xs text-teal-700 mt-1 block">Expected annual high volume</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Average Monthly Patients</span>
          <div className="mt-1.5 text-xl font-bold text-slate-900 tabular-nums">
            ~{stats.mean.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Hospital monthly baseline</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Highest Surge on Record</span>
          <div className="mt-1.5 text-xl font-bold text-rose-700 tabular-nums">
            {stats.max.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Recorded in {stats.peakMonth}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Lowest Off-Season Month</span>
          <div className="mt-1.5 text-xl font-bold text-emerald-700 tabular-nums">
            {stats.min.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Quiet period during off-peak</span>
        </div>
      </div>

      {/* Clean Trend Visualization Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {selectedDisease.commonName || selectedDisease.name} — Past Monthly Patient Trend
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hospital records from {timeRange === '12m' ? 'the past 12 months' : 'January 2024 to September 2026'}
            </p>
          </div>

          {/* Simple View Switcher */}
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
              <span>Monthly Line</span>
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'heatmap'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Month Heatmap</span>
            </button>
            {!simpleMode && (
              <button
                onClick={() => setActiveTab('yoy')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'yoy'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Year-over-Year</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: Monthly Line Chart */}
        {activeTab === 'timeline' && (
          <div className="mt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineChartData} margin={{ top: 10, right: 20, left: 0, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="displayMonth"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.toLocaleString()}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${Number(val || 0).toLocaleString()} patients`, 'Recorded Cases']}
                  />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    name="Patient Cases"
                    stroke="#0f172a"
                    strokeWidth={2.4}
                    dot={{ r: 2.5, fill: '#0f172a' }}
                    activeDot={{ r: 5, fill: '#0d9488' }}
                    isAnimationActive={false}
                  />
                  {showMovingAverage && (
                    <Line
                      type="monotone"
                      dataKey="movingAvg"
                      name="3-Month Average"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2: Seasonal Heatmap */}
        {activeTab === 'heatmap' && (
          <div className="mt-4">
            <SeasonalHeatmap
              data={diseaseCases.map((c) => ({ year: c.year, monthNum: c.monthNum, cases: c.cases }))}
              diseaseName={selectedDisease.commonName || selectedDisease.name}
            />
          </div>
        )}

        {/* TAB 3: Year-Over-Year Overlay (Detailed Mode) */}
        {activeTab === 'yoy' && (
          <div className="mt-4">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yoyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickFormatter={(v) => v.toLocaleString()} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="cases2024"
                    name="2024 Cases"
                    stroke="#94a3b8"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="cases2025"
                    name="2025 Cases"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="cases2026"
                    name="2026 Cases (YTD)"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>St. Jude Memorial Hospital Surveillance</span>
          <button
            onClick={() => setShowMovingAverage(!showMovingAverage)}
            className="text-xs text-teal-700 hover:text-teal-900 font-medium"
          >
            {showMovingAverage ? 'Hide smoothed average' : 'Show smoothed 3-month average'}
          </button>
        </div>
      </div>

      {/* Disease Directory (Clean & Friendly) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Hospital Illness Directory</h4>
            <p className="text-xs text-slate-500">Overview of all monitored conditions and their usual peak periods</p>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search illness name..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-52 bg-slate-50 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Condition / Illness</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Average Monthly Cases</th>
                <th className="py-2.5 px-3">Usual Peak Months</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_DISEASES.filter(
                (d) =>
                  d.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  (d.commonName && d.commonName.toLowerCase().includes(searchFilter.toLowerCase()))
              ).map((d) => (
                <tr
                  key={d.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    d.id === selectedDiseaseId ? 'bg-teal-50/50 font-medium' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">
                      {d.commonName || d.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal">
                      Medical: {d.name} {!simpleMode && `(${d.code})`}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{d.category}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-slate-800 font-medium">
                    ~{d.baselineMean} patients
                  </td>
                  <td className="py-3 px-3 font-medium text-teal-800">
                    {d.currentSeasonPeak}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedDiseaseId(d.id)}
                      className="px-2.5 py-1 text-xs text-teal-700 hover:text-teal-900 font-semibold rounded bg-teal-50 hover:bg-teal-100 transition-colors"
                    >
                      View Trend →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
