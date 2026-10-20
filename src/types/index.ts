export type NavigationTab = 
  | 'overview'
  | 'trends'
  | 'forecast'
  | 'models'
  | 'data-management'
  | 'import-history'
  | 'csv-import'
  | 'settings';

export type DiseaseCategory = 'Respiratory' | 'Enteric / Gastrointestinal' | 'Vector-Borne' | 'Viral Exanthem' | 'Nosocomial / Bacterial';

export interface Disease {
  id: string;
  code: string; // ICD-10 code
  name: string;
  commonName?: string; // Friendly plain language name (e.g. "Flu", "Stomach Bug")
  friendlyDescription?: string; // Plain explanation for general staff
  category: DiseaseCategory;
  surveillanceLevel: 'High' | 'Standard' | 'Watch';
  currentSeasonPeak: string;
  baselineMean: number;
}

export interface MonthlyCasePoint {
  month: string; // e.g. "2024-01"
  displayMonth: string; // "Jan 2024"
  year: number;
  monthNum: number; // 1-12
  monthName: string; // "Jan"
  cases: number;
  diseaseId: string;
  isObserved: boolean;
  hospitalId: string;
}

export interface ForecastPoint {
  month: string; // "2026-10"
  displayMonth: string; // "Oct 2026"
  observed?: number;
  forecast: number;
  ci80Lower: number;
  ci80Upper: number;
  ci95Lower: number;
  ci95Upper: number;
  modelId: string;
  isForecast: boolean;
}

export interface ForecastingModel {
  id: string;
  name: string;
  version: string;
  family: 'Statistical' | 'Machine Learning' | 'Baseline';
  description: string;
  mae: number;
  wape: number; // percentage
  rmse: number;
  coverage80: number; // percentage
  coverage95: number; // percentage
  backtestWindow: string;
  lastTrained: string;
  isRecommended?: boolean;
}

export interface DatasetItem {
  id: string;
  name: string;
  type: 'Monthly Cases' | 'Patients' | 'Encounters' | 'Conditions / Diagnoses' | 'Lab Observations';
  source: string;
  dateCoverage: string;
  recordCount: number;
  lastUpdated: string;
  status: 'Validated' | 'Active' | 'Needs Normalization' | 'Archived';
  schemaVersion: string;
  missingValuesPct: number;
}

export interface ImportBatch {
  id: string;
  timestamp: string;
  uploadedBy: string;
  fileCount: number;
  totalRecords: number;
  validRecords: number;
  rejectedRecords: number;
  skippedDuplicates: number;
  status: 'Completed' | 'Completed with Warnings' | 'Failed' | 'In Review';
  targetDatasetType: string;
  files: {
    name: string;
    size: string;
    rows: number;
    validRows: number;
    errorCount: number;
    status: 'Success' | 'Warning' | 'Error';
  }[];
  validationNotes: string[];
}

export interface CsvFileToImport {
  id: string;
  name: string;
  sizeKb: number;
  datasetType: 'Monthly Cases' | 'Patients' | 'Encounters' | 'Conditions / Diagnoses' | 'Lab Observations' | 'Other / Unclassified';
  headers: string[];
  sampleRows: Record<string, string>[];
  totalRows: number;
  status: 'ready' | 'mapping' | 'validated' | 'error';
}

export interface ColumnMappingDefinition {
  targetField: string;
  targetLabel: string;
  required: boolean;
  dataType: string;
  description: string;
  mappedSourceField: string | null;
}

export interface ValidationErrorItem {
  rowNumber: number;
  column: string;
  value: string;
  severity: 'Error' | 'Warning' | 'Info';
  message: string;
  suggestedAction?: string;
}
