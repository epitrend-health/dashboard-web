import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Info,
  HelpCircle,
  TrendingDown,
  BarChart3,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MOCK_MODELS, MOCK_DISEASE_PERFORMANCE } from '../../lib/mock-data/models';
import { DisclaimerBanner } from '../../components/ui/DisclaimerBanner';

interface ModelPerformancePageProps {
  simpleMode?: boolean;
}

export const ModelPerformancePage: React.FC<ModelPerformancePageProps> = ({ simpleMode = true }) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(!simpleMode);

  // 6-Month Backtest Comparison Data (Apr 2026 to Sep 2026)
  const backtestValidationData = [
    { month: 'Apr 2026', actual: 196, predicted: 204 },
    { month: 'May 2026', actual: 112, predicted: 118 },
    { month: 'Jun 2026', actual: 84, predicted: 89 },
    { month: 'Jul 2026', actual: 56, predicted: 52 },
    { month: 'Aug 2026', actual: 84, predicted: 80 },
    { month: 'Sep 2026', actual: 140, predicted: 146 },
  ];

  return (
    <div className="space-y-6">
      <DisclaimerBanner customMessage="Accuracy evaluations are calculated by testing how well predictions matched actual past hospital records." />

      {/* Hero Plain-Language Accuracy Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/80 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Forecast Reliability Score
                </span>
                <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                  Highly Reliable
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                93.2% Accurate Predictions
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                We tested our smart forecasting model against 6 months of past hospital visits (April to September 2026). On average, predictions were within <strong>±18 patients</strong> of actual hospital counts.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shrink-0 text-xs space-y-1">
            <div className="text-slate-500 font-medium">Test Window</div>
            <div className="text-sm font-bold text-slate-900">Apr 2026 – Sep 2026</div>
            <div className="text-emerald-700 font-medium text-[11px]">6 Months Holdout Test Passed</div>
          </div>
        </div>
      </div>

      {/* How It Works in Plain English */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
        <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
          <HelpCircle className="w-4 h-4 text-teal-600" />
          <span>How we test our predictions (No confusing math needed):</span>
        </div>
        <p className="leading-relaxed">
          To prove that our forecasts can be trusted, we hide the actual patient records from the last 6 months. We ask the system to predict those months blindly, and then compare its predictions with what really happened in our hospital. The predictions matched actual patient volume almost perfectly.
        </p>
      </div>

      {/* Simple Model Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-teal-600/30 rounded-2xl p-5 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              ⭐ Recommended Model
            </span>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Top Choice
            </span>
          </div>
          <div className="mt-2 text-base font-bold text-slate-900">
            Smart Seasonal Model (SARIMA)
          </div>
          <div className="mt-2 text-2xl font-bold text-teal-700 tabular-nums">
            93.2% Accuracy
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Adapts automatically to annual winter surges and summer dips. Average error is only ~18 patients per month.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Alternative Method
            </span>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Standard
            </span>
          </div>
          <div className="mt-2 text-base font-bold text-slate-900">
            Seasonal Trend (ETS / Holt-Winters)
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800 tabular-nums">
            91.6% Accuracy
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Good for smooth, consistent illnesses like stomach bugs. Slightly less sensitive to sharp winter flu spikes.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Basic Benchmark
            </span>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Simple Guess
            </span>
          </div>
          <div className="mt-2 text-base font-bold text-slate-900">
            Same as Last Year (Naive)
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-700 tabular-nums">
            87.7% Accuracy
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Simply repeats whatever happened 12 months ago. Does not account for hospital population growth or earlier wave arrivals.
          </p>
        </div>
      </div>

      {/* Visual Proof: Past Actual vs What Was Predicted */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Visual Proof: Actual Patients vs Predicted Numbers (6-Month Test)
            </h3>
            <p className="text-xs text-slate-500">
              Notice how closely the green prediction line tracked the actual dark navy hospital records
            </p>
          </div>
          <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
            Average difference: &lt; 7%
          </span>
        </div>

        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={backtestValidationData} margin={{ top: 10, right: 20, left: 0, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [`${val} patients`, name]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="actual" name="Actual Patients Who Came" fill="#0f172a" radius={[6, 6, 0, 0]} />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Smart Model Prediction"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 4 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progressive Disclosure: Technical Details for Data Analysts */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 text-left flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Advanced Statistical Parameters (WAPE, MAE, RMSE)
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              For data analysts or auditors
            </span>
          </div>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-5 border-t border-slate-200 space-y-4 text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Model Architecture</th>
                    <th className="py-2.5 px-3 text-right">WAPE Error (%)</th>
                    <th className="py-2.5 px-3 text-right">MAE (Cases)</th>
                    <th className="py-2.5 px-3 text-right">RMSE</th>
                    <th className="py-2.5 px-3 text-right">95% CI Coverage</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_MODELS.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">{m.name}</td>
                      <td className="py-3 px-3 text-right font-bold text-teal-800">{m.wape}%</td>
                      <td className="py-3 px-3 text-right">±{m.mae}</td>
                      <td className="py-3 px-3 text-right">{m.rmse}</td>
                      <td className="py-3 px-3 text-right">{m.coverage95}%</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {m.isRecommended ? 'Selected Production' : 'Evaluated'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
