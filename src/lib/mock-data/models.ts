import { ForecastingModel } from '../../types';

export const MOCK_MODELS: ForecastingModel[] = [
  {
    id: 'sarima',
    name: 'SARIMA (Seasonal AutoRegressive Integrated Moving Average)',
    version: 'v1.4.2 (Production)',
    family: 'Statistical',
    description: 'Auto-fitted multiplicative seasonal ARIMA(1,1,1)(1,1,0)[12] with AICc parameter selection.',
    mae: 18.4,
    wape: 6.8,
    rmse: 24.1,
    coverage80: 82.4,
    coverage95: 96.1,
    backtestWindow: 'Apr 2026 – Sep 2026 (6 months)',
    lastTrained: '2026-10-01 02:15 UTC',
    isRecommended: true,
  },
  {
    id: 'ets',
    name: 'ETS (Error-Trend-Seasonality / Holt-Winters)',
    version: 'v2.1.0',
    family: 'Statistical',
    description: 'Triple exponential smoothing with additive dampening and multiplicative seasonality.',
    mae: 22.8,
    wape: 8.4,
    rmse: 29.5,
    coverage80: 79.2,
    coverage95: 93.8,
    backtestWindow: 'Apr 2026 – Sep 2026 (6 months)',
    lastTrained: '2026-10-01 02:18 UTC',
  },
  {
    id: 'ensemble',
    name: 'Weighted Hybrid Ensemble (SARIMA + ETS)',
    version: 'v1.1.0 (Candidate)',
    family: 'Machine Learning',
    description: 'Inverse-variance weighted combination of SARIMA (65%) and ETS (35%) forecasts.',
    mae: 17.9,
    wape: 6.5,
    rmse: 23.4,
    coverage80: 83.1,
    coverage95: 96.5,
    backtestWindow: 'Apr 2026 – Sep 2026 (6 months)',
    lastTrained: '2026-10-01 02:30 UTC',
  },
  {
    id: 'snaive',
    name: 'Seasonal Naive (Benchmark)',
    version: 'v1.0.0',
    family: 'Baseline',
    description: 'Baseline persistence model setting forecast equal to the same month from previous year.',
    mae: 34.2,
    wape: 12.3,
    rmse: 42.0,
    coverage80: 71.0,
    coverage95: 88.2,
    backtestWindow: 'Apr 2026 – Sep 2026 (6 months)',
    lastTrained: '2026-10-01 02:00 UTC',
  },
  {
    id: 'prophet',
    name: 'Generalized Additive Model (Prophet)',
    version: 'v0.9.1 (Experimental)',
    family: 'Machine Learning',
    description: 'Decomposable time series model with yearly seasonality and holiday regressors.',
    mae: 27.5,
    wape: 9.9,
    rmse: 36.2,
    coverage80: 76.5,
    coverage95: 91.0,
    backtestWindow: 'Apr 2026 – Sep 2026 (6 months)',
    lastTrained: '2026-10-01 02:22 UTC',
  },
];

export interface ModelDiseasePerformance {
  diseaseId: string;
  diseaseName: string;
  category: string;
  sarimaWape: number;
  etsWape: number;
  snaiveWape: number;
  bestModel: string;
  sampleCount: number;
}

export const MOCK_DISEASE_PERFORMANCE: ModelDiseasePerformance[] = [
  {
    diseaseId: 'influenza',
    diseaseName: 'Influenza (Type A & B)',
    category: 'Respiratory',
    sarimaWape: 5.4,
    etsWape: 7.1,
    snaiveWape: 11.2,
    bestModel: 'SARIMA v1.4.2',
    sampleCount: 33,
  },
  {
    diseaseId: 'covid19',
    diseaseName: 'COVID-19 (SARS-CoV-2)',
    category: 'Respiratory',
    sarimaWape: 7.8,
    etsWape: 8.6,
    snaiveWape: 14.5,
    bestModel: 'SARIMA v1.4.2',
    sampleCount: 33,
  },
  {
    diseaseId: 'rsv',
    diseaseName: 'RSV (Respiratory Syncytial Virus)',
    category: 'Respiratory',
    sarimaWape: 6.2,
    etsWape: 7.9,
    snaiveWape: 12.8,
    bestModel: 'SARIMA v1.4.2',
    sampleCount: 33,
  },
  {
    diseaseId: 'norovirus',
    diseaseName: 'Acute Norovirus Gastroenteritis',
    category: 'Enteric',
    sarimaWape: 7.0,
    etsWape: 6.8,
    snaiveWape: 10.9,
    bestModel: 'ETS v2.1.0',
    sampleCount: 33,
  },
  {
    diseaseId: 'dengue',
    diseaseName: 'Dengue Fever',
    category: 'Vector-Borne',
    sarimaWape: 8.9,
    etsWape: 9.5,
    snaiveWape: 15.1,
    bestModel: 'SARIMA v1.4.2',
    sampleCount: 33,
  },
  {
    diseaseId: 'c_difficile',
    diseaseName: 'C. difficile Colitis',
    category: 'Nosocomial',
    sarimaWape: 4.8,
    etsWape: 5.2,
    snaiveWape: 7.9,
    bestModel: 'SARIMA v1.4.2',
    sampleCount: 33,
  },
];
