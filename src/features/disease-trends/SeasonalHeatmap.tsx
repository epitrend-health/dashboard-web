import React from 'react';
import { MONTH_NAMES } from '../../lib/mock-data/monthlyCases';

interface SeasonalHeatmapProps {
  data: {
    year: number;
    monthNum: number;
    cases: number;
  }[];
  diseaseName: string;
}

export const SeasonalHeatmap: React.FC<SeasonalHeatmapProps> = ({ data, diseaseName }) => {
  const years = [2024, 2025, 2026];

  // Find max cases for dynamic color intensity
  const maxCases = Math.max(...data.map((d) => d.cases), 1);

  // Matrix lookup: [year][monthNum] => cases
  const caseLookup: Record<number, Record<number, number | null>> = {
    2024: {},
    2025: {},
    2026: {},
  };

  data.forEach((d) => {
    if (caseLookup[d.year]) {
      caseLookup[d.year][d.monthNum] = d.cases;
    }
  });

  // Calculate intensity color (light teal to deep teal)
  const getCellColor = (cases: number | null) => {
    if (cases === null || cases === undefined) return 'bg-slate-100 text-slate-300';
    const ratio = cases / maxCases;
    if (ratio < 0.2) return 'bg-teal-50 text-teal-900 border border-teal-100';
    if (ratio < 0.4) return 'bg-teal-100 text-teal-900 border border-teal-200';
    if (ratio < 0.6) return 'bg-teal-300 text-teal-950 font-medium';
    if (ratio < 0.8) return 'bg-teal-500 text-white font-semibold';
    return 'bg-teal-700 text-white font-bold';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Heatmap Header (Months) */}
        <div className="grid grid-cols-13 gap-1.5 pb-2 text-center text-xs font-semibold text-slate-500">
          <div className="text-left font-medium text-slate-400">Year</div>
          {MONTH_NAMES.map((m) => (
            <div key={m} className="py-1">
              {m}
            </div>
          ))}
        </div>

        {/* Heatmap Rows (Years) */}
        <div className="space-y-1.5">
          {years.map((yr) => (
            <div key={yr} className="grid grid-cols-13 gap-1.5 items-center">
              <div className="text-xs font-semibold text-slate-700 tabular-nums">{yr}</div>
              {Array.from({ length: 12 }).map((_, mIdx) => {
                const monthNum = mIdx + 1;
                const cases = caseLookup[yr]?.[monthNum] ?? null;
                const isFutureIn2026 = yr === 2026 && monthNum > 9;

                return (
                  <div
                    key={monthNum}
                    title={
                      isFutureIn2026
                        ? `${MONTH_NAMES[mIdx]} 2026: Awaiting observation cutoff`
                        : `${MONTH_NAMES[mIdx]} ${yr}: ${cases ? cases.toLocaleString() : 0} cases`
                    }
                    className={`h-10 rounded-md flex flex-col items-center justify-center text-xs transition-transform hover:scale-105 cursor-pointer relative group ${
                      isFutureIn2026
                        ? 'bg-slate-50 border border-dashed border-slate-200 text-slate-300'
                        : getCellColor(cases)
                    }`}
                  >
                    {isFutureIn2026 ? (
                      <span className="text-[10px]">—</span>
                    ) : (
                      <span className="tabular-nums text-[11px] leading-tight">
                        {cases !== null ? cases : '0'}
                      </span>
                    )}

                    {/* Tooltip hover */}
                    <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap z-30 pointer-events-none">
                      {MONTH_NAMES[mIdx]} {yr}: {cases !== null ? cases.toLocaleString() : 'No data'} cases
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Heatmap Legend */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <span className="text-[11px]">Intensity represents monthly case volume for {diseaseName}</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Low Volume</span>
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-xs bg-teal-50 border border-teal-100" />
              <span className="w-3.5 h-3.5 rounded-xs bg-teal-100 border border-teal-200" />
              <span className="w-3.5 h-3.5 rounded-xs bg-teal-300" />
              <span className="w-3.5 h-3.5 rounded-xs bg-teal-500" />
              <span className="w-3.5 h-3.5 rounded-xs bg-teal-700" />
            </div>
            <span className="text-[10px] text-slate-400">Peak Surge ({maxCases.toLocaleString()} cases)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
