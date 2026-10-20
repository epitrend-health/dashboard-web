import { MonthlyCasePoint } from '../../types';

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Realistic base seasonal multipliers (12 months)
const SEASONAL_PROFILES: Record<string, number[]> = {
  influenza: [2.8, 2.6, 1.4, 0.7, 0.4, 0.3, 0.2, 0.3, 0.5, 0.9, 1.8, 2.5],
  covid19: [1.9, 1.3, 0.9, 0.8, 0.7, 1.1, 1.4, 1.3, 0.9, 0.8, 1.2, 1.8],
  rsv: [2.4, 2.0, 1.1, 0.5, 0.2, 0.1, 0.1, 0.2, 0.4, 1.2, 2.2, 2.6],
  norovirus: [1.8, 2.0, 1.6, 1.1, 0.8, 0.6, 0.5, 0.6, 0.8, 1.0, 1.4, 1.7],
  dengue: [0.3, 0.4, 0.5, 0.7, 1.1, 1.8, 2.3, 2.2, 1.9, 1.2, 0.6, 0.4],
  pertussis: [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.6, 1.5, 1.2, 0.9, 0.7],
  rotavirus: [1.2, 1.5, 2.1, 2.2, 1.7, 0.9, 0.6, 0.5, 0.6, 0.7, 0.8, 1.0],
  varicella: [0.8, 0.9, 1.3, 1.8, 2.0, 1.4, 0.9, 0.6, 0.7, 0.8, 0.9, 0.8],
  c_difficile: [1.0, 1.0, 1.1, 0.9, 1.0, 1.0, 0.9, 1.0, 1.0, 1.1, 1.0, 1.0],
  salmonellosis: [0.5, 0.6, 0.7, 0.9, 1.3, 1.9, 2.2, 2.0, 1.4, 1.0, 0.7, 0.5],
};

const BASE_VOLUME: Record<string, number> = {
  influenza: 280,
  covid19: 220,
  rsv: 150,
  norovirus: 110,
  dengue: 75,
  pertussis: 45,
  rotavirus: 55,
  varicella: 32,
  c_difficile: 72,
  salmonellosis: 50,
};

// Generate data from Jan 2024 to Sep 2026 (33 months of observed records)
export const MOCK_MONTHLY_CASES: MonthlyCasePoint[] = [];

const years = [2024, 2025, 2026];
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

for (const diseaseId of Object.keys(BASE_VOLUME)) {
  const profile = SEASONAL_PROFILES[diseaseId];
  const base = BASE_VOLUME[diseaseId];

  years.forEach((yr, yrIdx) => {
    months.forEach((m) => {
      // Cutoff at Sep 2026
      if (yr === 2026 && m > 9) return;

      const mIdx = m - 1;
      const seasonalFactor = profile[mIdx];
      // small deterministic variance for realism
      const variance = 1 + Math.sin(yr * 13 + m * 7) * 0.12;
      const yrGrowth = 1 + yrIdx * 0.04; // slight 4% annual increase in hospital catchment
      const rawCount = Math.round(base * seasonalFactor * variance * yrGrowth);

      const monthStr = `${yr}-${String(m).padStart(2, '0')}`;
      const displayStr = `${MONTH_NAMES[mIdx]} ${yr}`;

      MOCK_MONTHLY_CASES.push({
        month: monthStr,
        displayMonth: displayStr,
        year: yr,
        monthNum: m,
        monthName: MONTH_NAMES[mIdx],
        cases: Math.max(4, rawCount),
        diseaseId,
        isObserved: true,
        hospitalId: 'HOSP-01',
      });
    });
  });
}

// Aggregated totals across all diseases by month
export interface AggregatedMonthPoint {
  month: string;
  displayMonth: string;
  year: number;
  monthNum: number;
  monthName: string;
  totalCases: number;
  byCategory: Record<string, number>;
}

const monthsMap = new Map<string, AggregatedMonthPoint>();

MOCK_MONTHLY_CASES.forEach((pt) => {
  if (!monthsMap.has(pt.month)) {
    monthsMap.set(pt.month, {
      month: pt.month,
      displayMonth: pt.displayMonth,
      year: pt.year,
      monthNum: pt.monthNum,
      monthName: pt.monthName,
      totalCases: 0,
      byCategory: {},
    });
  }
  const item = monthsMap.get(pt.month)!;
  item.totalCases += pt.cases;
});

export const MOCK_AGGREGATED_MONTHLY: AggregatedMonthPoint[] = Array.from(monthsMap.values()).sort(
  (a, b) => a.month.localeCompare(b.month)
);
