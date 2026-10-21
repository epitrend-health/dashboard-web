import { Disease, MonthlyCasePoint, ForecastingModel, DatasetItem, ImportBatch } from '../../types';
import { MOCK_DISEASES } from '../mock-data/diseases';
import { MOCK_MONTHLY_CASES, MOCK_AGGREGATED_MONTHLY } from '../mock-data/monthlyCases';
import { getForecastForDisease, ForecastDataset } from '../mock-data/forecasts';
import { MOCK_MODELS, MOCK_DISEASE_PERFORMANCE, ModelDiseasePerformance } from '../mock-data/models';
import { MOCK_DATASETS } from '../mock-data/datasets';
import { MOCK_IMPORT_BATCHES } from '../mock-data/importBatches';
import { apiClient } from './apiClient';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

/**
 * EpiTrend Service Layer
 * 
 * Mendukung mode Mock (development lokal tanpa backend)
 * dan mode Real API (mengarah ke URL backend yang didefinisikan di VITE_API_BASE_URL).
 */
export const ApiService = {
  /**
   * GET /api/diseases
   */
  async getDiseases(): Promise<Disease[]> {
    if (USE_MOCK) return Promise.resolve([...MOCK_DISEASES]);
    try {
      const data = await Promise.race([
        apiClient.get<Disease[]>('/diseases'),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500)),
      ]);
      return (data && data.length > 0) ? data : [...MOCK_DISEASES];
    } catch {
      // Otomatis fallback jika backend offline / database belum berisi
      return [...MOCK_DISEASES];
    }
  },

  /**
   * GET /api/cases
   */
  async getCases(params?: { diseaseId?: string; startMonth?: string; endMonth?: string }): Promise<MonthlyCasePoint[]> {
    if (USE_MOCK) {
      let result = [...MOCK_MONTHLY_CASES];
      if (params?.diseaseId && params.diseaseId !== 'all') {
        result = result.filter((c) => c.diseaseId === params.diseaseId);
      }
      if (params?.startMonth) {
        result = result.filter((c) => c.month >= params.startMonth!);
      }
      if (params?.endMonth) {
        result = result.filter((c) => c.month <= params.endMonth!);
      }
      return Promise.resolve(result);
    }

    const query = new URLSearchParams();
    if (params?.diseaseId) query.set('diseaseId', params.diseaseId);
    if (params?.startMonth) query.set('startMonth', params.startMonth);
    if (params?.endMonth) query.set('endMonth', params.endMonth);

    const queryString = query.toString();
    return apiClient.get<MonthlyCasePoint[]>(`/cases${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * GET /api/cases/aggregated
   */
  async getAggregatedCases() {
    if (USE_MOCK) return Promise.resolve([...MOCK_AGGREGATED_MONTHLY]);
    return apiClient.get<typeof MOCK_AGGREGATED_MONTHLY>('/cases/aggregated');
  },

  /**
   * GET /api/forecast
   */
  async getForecast(diseaseId: string = 'influenza', modelId: string = 'sarima'): Promise<ForecastDataset> {
    if (USE_MOCK) return Promise.resolve(getForecastForDisease(diseaseId, modelId));
    try {
      const data = await Promise.race([
        apiClient.get<ForecastDataset>(`/forecast?diseaseId=${encodeURIComponent(diseaseId)}&modelId=${encodeURIComponent(modelId)}`),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500)),
      ]);
      return (data && data.points && data.points.length > 0) ? data : getForecastForDisease(diseaseId, modelId);
    } catch {
      // Otomatis fallback ke data simulasi SARIMA jika backend belum aktif
      return getForecastForDisease(diseaseId, modelId);
    }
  },

  /**
   * GET /api/model/evaluations
   */
  async getModelEvaluations(): Promise<{ models: ForecastingModel[]; byDisease: ModelDiseasePerformance[] }> {
    if (USE_MOCK) {
      return Promise.resolve({
        models: [...MOCK_MODELS],
        byDisease: [...MOCK_DISEASE_PERFORMANCE],
      });
    }
    return apiClient.get<{ models: ForecastingModel[]; byDisease: ModelDiseasePerformance[] }>('/model/evaluations');
  },

  /**
   * GET /api/datasets
   */
  async getDatasets(): Promise<DatasetItem[]> {
    if (USE_MOCK) return Promise.resolve([...MOCK_DATASETS]);
    return apiClient.get<DatasetItem[]>('/datasets');
  },

  /**
   * GET /api/imports/history
   */
  async getImportHistory(): Promise<ImportBatch[]> {
    if (USE_MOCK) return Promise.resolve([...MOCK_IMPORT_BATCHES]);
    return apiClient.get<ImportBatch[]>('/imports/history');
  },

  /**
   * GET /api/imports/{batch_id}
   */
  async getImportBatchById(batchId: string): Promise<ImportBatch | null> {
    if (USE_MOCK) {
      const found = MOCK_IMPORT_BATCHES.find((b) => b.id === batchId);
      return Promise.resolve(found || null);
    }
    return apiClient.get<ImportBatch>(`/imports/${encodeURIComponent(batchId)}`);
  },

  /**
   * POST /api/imports/{batch_id}/commit
   */
  async commitImportBatch(payload: {
    batchId: string;
    files: string[];
    recordCount: number;
  }): Promise<{ status: 'success'; batchId: string; insertedRecords: number; timestamp: string }> {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            status: 'success',
            batchId: payload.batchId,
            insertedRecords: payload.recordCount,
            timestamp: new Date().toISOString(),
          });
        }, 800);
      });
    }
    return apiClient.post<{ status: 'success'; batchId: string; insertedRecords: number; timestamp: string }>(
      `/imports/${encodeURIComponent(payload.batchId)}/commit`,
      payload
    );
  },
};
