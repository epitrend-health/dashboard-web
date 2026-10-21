import { ForecastPoint } from '../../types';
import { MOCK_MONTHLY_CASES, MONTH_NAMES } from './monthlyCases';

// 6-12 months horizon based on dataset cutoff (Dec 2021 - May 2022)
export const FORECAST_MONTHS = [
  { month: '2021-12', displayMonth: 'Dec 2021', monthNum: 12 },
  { month: '2022-01', displayMonth: 'Jan 2022', monthNum: 1 },
  { month: '2022-02', displayMonth: 'Feb 2022', monthNum: 2 },
  { month: '2022-03', displayMonth: 'Mar 2022', monthNum: 3 },
  { month: '2022-04', displayMonth: 'Apr 2022', monthNum: 4 },
  { month: '2022-05', displayMonth: 'May 2022', monthNum: 5 },
];

export interface ForecastDataset {
  diseaseId: string;
  modelId: string;
  points: ForecastPoint[];
  metadata: {
    generationDate: string;
    cutoffDate: string;
    modelVersion: string;
    backtestWape: number;
    trainingDataPoints: number;
  };
}

export const getForecastForDisease = (diseaseId: string, modelId: string = 'sarima'): ForecastDataset => {
  // Get historical observed points for this disease
  const historical = MOCK_MONTHLY_CASES.filter(
    (c) => c.diseaseId === (diseaseId === 'all' ? 'influenza' : diseaseId)
  );

  // If 'all', compute summary total historical
  let histPoints: { month: string; displayMonth: string; cases: number }[] = [];
  if (diseaseId === 'all') {
    const map = new Map<string, { displayMonth: string; cases: number }>();
    MOCK_MONTHLY_CASES.forEach((c) => {
      if (!map.has(c.month)) {
        map.set(c.month, { displayMonth: c.displayMonth, cases: 0 });
      }
      map.get(c.month)!.cases += c.cases;
    });
    histPoints = Array.from(map.entries()).map(([month, val]) => ({
      month,
      displayMonth: val.displayMonth,
      cases: val.cases,
    }));
  } else {
    histPoints = historical.map((c) => ({
      month: c.month,
      displayMonth: c.displayMonth,
      cases: c.cases,
    }));
  }

  // Model multiplier effect on variance & mean forecast
  const modelFactors: Record<string, { meanBias: number; spread: number }> = {
    sarima: { meanBias: 1.0, spread: 0.12 },
    ets: { meanBias: 0.98, spread: 0.16 },
    snaive: { meanBias: 1.04, spread: 0.22 },
    ensemble: { meanBias: 1.01, spread: 0.10 },
  };

  const factor = modelFactors[modelId] || modelFactors['sarima'];

  // Combine observed past with future forecast
  const combined: ForecastPoint[] = [];

  // Add historical points (observed, no forecast error interval)
  histPoints.forEach((hp) => {
    combined.push({
      month: hp.month,
      displayMonth: hp.displayMonth,
      observed: hp.cases,
      forecast: hp.cases, // for continuous chart line baseline
      ci80Lower: hp.cases,
      ci80Upper: hp.cases,
      ci95Lower: hp.cases,
      ci95Upper: hp.cases,
      modelId,
      isForecast: false,
    });
  });

  // Calculate future forecasts based on matching month in 2025/2024 with trend
  FORECAST_MONTHS.forEach((fm, idx) => {
    // Find matching month from 2025 to project seasonality
    const mNum = fm.monthNum;
    const pastMatches = histPoints.filter((p) => {
      const parts = p.month.split('-');
      return parseInt(parts[1], 10) === mNum;
    });

    const lastObservedMatch = pastMatches[pastMatches.length - 1];
    const baseVal = lastObservedMatch ? lastObservedMatch.cases : 250;
    
    // Growth factor + horizon uncertainty expansion (idx increases uncertainty)
    const growth = 1.03; 
    const pointForecast = Math.round(baseVal * growth * factor.meanBias);
    
    const horizonSpread = factor.spread + idx * 0.015;
    const ci80Margin = Math.round(pointForecast * horizonSpread);
    const ci95Margin = Math.round(pointForecast * (horizonSpread * 1.55));

    combined.push({
      month: fm.month,
      displayMonth: fm.displayMonth,
      observed: undefined,
      forecast: pointForecast,
      ci80Lower: Math.max(0, pointForecast - ci80Margin),
      ci80Upper: pointForecast + ci80Margin,
      ci95Lower: Math.max(0, pointForecast - ci95Margin),
      ci95Upper: pointForecast + ci95Margin,
      modelId,
      isForecast: true,
    });
  });

  return {
    diseaseId,
    modelId,
    points: combined,
    metadata: {
      generationDate: '2021-12-01 00:00 UTC',
      cutoffDate: '2021-11-30',
      modelVersion: modelId === 'sarima' ? 'SARIMA v1.4.2' : modelId === 'ets' ? 'ETS-Triple-Exp v2.1' : 'S-Naive Baseline v1.0',
      backtestWape: modelId === 'sarima' ? 6.8 : modelId === 'ets' ? 8.4 : 12.3,
      trainingDataPoints: histPoints.length,
    },
  };
};
