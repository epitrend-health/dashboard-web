import { CsvFileToImport, ColumnMappingDefinition, ValidationErrorItem } from '../../types';

export interface WizardPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  files: CsvFileToImport[];
  mappings: Record<string, ColumnMappingDefinition[]>;
  validationResults: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicateCandidates: number;
    missingValues: number;
    invalidDates: number;
    unknownCodes: number;
    errors: ValidationErrorItem[];
  };
}

export const TARGET_STANDARD_SCHEMAS: Record<string, { field: string; label: string; required: boolean; type: string; desc: string }[]> = {
  'Monthly Cases': [
    { field: 'period', label: 'Reporting Period (YYYY-MM)', required: true, type: 'Date (ISO Month)', desc: 'Standardized monthly period string' },
    { field: 'disease_code', label: 'Disease Code (ICD-10)', required: true, type: 'String (Code)', desc: 'ICD-10 or clinical code identifier' },
    { field: 'disease_name', label: 'Disease Name / Label', required: false, type: 'String', desc: 'Canonical clinical condition name' },
    { field: 'monthly_cases', label: 'Monthly Confirmed Cases', required: true, type: 'Integer (>= 0)', desc: 'Aggregate count of laboratory confirmed cases' },
    { field: 'inpatient_admissions', label: 'Inpatient Admissions', required: false, type: 'Integer', desc: 'Hospitalized cases resulting from condition' },
    { field: 'facility_id', label: 'Hospital Facility ID', required: false, type: 'String', desc: 'Hospital unit or facility code' },
  ],
  'Encounters': [
    { field: 'encounter_id', label: 'Encounter Identifier', required: true, type: 'UUID / String', desc: 'Unique admission or outpatient visit token' },
    { field: 'patient_token', label: 'De-identified Patient Token', required: true, type: 'String', desc: 'Anonymized master patient index key' },
    { field: 'admission_date', label: 'Admission / Visit Date', required: true, type: 'Datetime (ISO 8601)', desc: 'Initial registration timestamp' },
    { field: 'discharge_date', label: 'Discharge Date', required: false, type: 'Datetime (ISO 8601)', desc: 'Encounter conclusion timestamp' },
    { field: 'department', label: 'Clinical Service Department', required: false, type: 'String', desc: 'Emergency, ICU, Pediatrics, Inpatient' },
    { field: 'primary_dx_code', label: 'Primary Diagnosis Code', required: true, type: 'String (ICD-10)', desc: 'Attending primary ICD-10 diagnosis' },
  ],
  'Conditions / Diagnoses': [
    { field: 'dx_record_id', label: 'Diagnosis Record ID', required: true, type: 'String', desc: 'Unique clinical condition record index' },
    { field: 'encounter_id', label: 'Associated Encounter ID', required: true, type: 'String', desc: 'Linked patient visit token' },
    { field: 'icd10_code', label: 'ICD-10-CM Code', required: true, type: 'String (ICD-10)', desc: 'Standard clinical diagnosis code' },
    { field: 'diagnosis_type', label: 'Diagnosis Category', required: false, type: 'Enum', desc: 'Admitting, Working, Final, Secondary' },
    { field: 'onset_date', label: 'Reported Symptom Onset Date', required: false, type: 'Date', desc: 'Initial clinical presentation date' },
  ],
  'Lab Observations': [
    { field: 'specimen_id', label: 'Lab Specimen Identifier', required: true, type: 'String', desc: 'Unique specimen accession number' },
    { field: 'test_code', label: 'LOINC / Panel Code', required: true, type: 'String', desc: 'Standardized LOINC laboratory procedure code' },
    { field: 'test_name', label: 'Diagnostic Assay Name', required: false, type: 'String', desc: 'e.g. Multiplex RT-PCR Viral Panel' },
    { field: 'result_value', label: 'Qualitative / Quantitative Result', required: true, type: 'String', desc: 'Positive, Negative, Detected, or Numerical' },
    { field: 'collected_at', label: 'Collection Timestamp', required: true, type: 'Datetime', desc: 'Sample collection date and time' },
  ],
};

export const WIZARD_PRESETS: WizardPreset[] = [
  {
    id: 'clean_monthly',
    name: 'Scenario A: Clean Monthly Aggregate (High Quality)',
    badge: '100% Valid',
    description: 'A well-formatted CSV of monthly influenza and RSV aggregates ready for instant ingestion.',
    files: [
      {
        id: 'file-clean-1',
        name: 'st_jude_respiratory_monthly_2026.csv',
        sizeKb: 24,
        datasetType: 'Monthly Cases',
        headers: ['PERIOD_DATE', 'ICD10_ID', 'CONDITION_NAME', 'TOTAL_CONFIRMED', 'INPATIENT_CNT'],
        sampleRows: [
          { PERIOD_DATE: '2026-08', ICD10_ID: 'J09-J11', CONDITION_NAME: 'Influenza Type A/B', TOTAL_CONFIRMED: '142', INPATIENT_CNT: '18' },
          { PERIOD_DATE: '2026-08', ICD10_ID: 'B97.4', CONDITION_NAME: 'RSV', TOTAL_CONFIRMED: '86', INPATIENT_CNT: '12' },
          { PERIOD_DATE: '2026-09', ICD10_ID: 'J09-J11', CONDITION_NAME: 'Influenza Type A/B', TOTAL_CONFIRMED: '210', INPATIENT_CNT: '29' },
          { PERIOD_DATE: '2026-09', ICD10_ID: 'B97.4', CONDITION_NAME: 'RSV', TOTAL_CONFIRMED: '144', INPATIENT_CNT: '22' },
        ],
        totalRows: 240,
        status: 'ready',
      },
    ],
    mappings: {
      'file-clean-1': [
        { targetField: 'period', targetLabel: 'Reporting Period (YYYY-MM)', required: true, dataType: 'Date', description: 'Monthly period', mappedSourceField: 'PERIOD_DATE' },
        { targetField: 'disease_code', targetLabel: 'Disease Code (ICD-10)', required: true, dataType: 'String', description: 'ICD-10 code', mappedSourceField: 'ICD10_ID' },
        { targetField: 'disease_name', targetLabel: 'Disease Name / Label', required: false, dataType: 'String', description: 'Condition name', mappedSourceField: 'CONDITION_NAME' },
        { targetField: 'monthly_cases', targetLabel: 'Monthly Confirmed Cases', required: true, dataType: 'Integer', description: 'Case count', mappedSourceField: 'TOTAL_CONFIRMED' },
        { targetField: 'inpatient_admissions', targetLabel: 'Inpatient Admissions', required: false, dataType: 'Integer', description: 'Hospitalized', mappedSourceField: 'INPATIENT_CNT' },
        { targetField: 'facility_id', targetLabel: 'Hospital Facility ID', required: false, dataType: 'String', description: 'Facility unit', mappedSourceField: null },
      ],
    },
    validationResults: {
      totalRows: 240,
      validRows: 240,
      invalidRows: 0,
      duplicateCandidates: 0,
      missingValues: 0,
      invalidDates: 0,
      unknownCodes: 0,
      errors: [],
    },
  },
  {
    id: 'warnings_encounters',
    name: 'Scenario B: Realistic Multi-File with Duplicates & Warnings',
    badge: 'Warnings & Duplicates',
    description: 'Two hospital clinical files containing 4 duplicate records, 2 missing optional values, and 1 date format warning.',
    files: [
      {
        id: 'file-enc-1',
        name: 'ed_triage_encounters_aug_sep.csv',
        sizeKb: 340,
        datasetType: 'Encounters',
        headers: ['VISIT_NUM', 'PATIENT_ID', 'ADM_TIME', 'DISCH_TIME', 'SERVICE_UNIT', 'PRIMARY_ICD'],
        sampleRows: [
          { VISIT_NUM: 'ENC-88192', PATIENT_ID: 'PT-9941', ADM_TIME: '2026-08-14 08:30:00', DISCH_TIME: '2026-08-15 14:00:00', SERVICE_UNIT: 'Emergency', PRIMARY_ICD: 'J09.X2' },
          { VISIT_NUM: 'ENC-88193', PATIENT_ID: 'PT-7720', ADM_TIME: '2026-08-14 09:15:00', DISCH_TIME: '2026-08-16 11:20:00', SERVICE_UNIT: 'Pediatric ICU', PRIMARY_ICD: 'B97.4' },
          { VISIT_NUM: 'ENC-88194', PATIENT_ID: 'PT-4029', ADM_TIME: '2026-08-14 11:45:00', DISCH_TIME: '', SERVICE_UNIT: 'Emergency', PRIMARY_ICD: 'U07.1' },
          { VISIT_NUM: 'ENC-88192', PATIENT_ID: 'PT-9941', ADM_TIME: '2026-08-14 08:30:00', DISCH_TIME: '2026-08-15 14:30:00', SERVICE_UNIT: 'Emergency', PRIMARY_ICD: 'J09.X2' }, // duplicate
        ],
        totalRows: 1250,
        status: 'ready',
      },
      {
        id: 'file-dx-2',
        name: 'secondary_diagnoses_audit.csv',
        sizeKb: 180,
        datasetType: 'Conditions / Diagnoses',
        headers: ['DX_ID', 'VISIT_LINK', 'ICD10', 'DX_CAT', 'ONSET'],
        sampleRows: [
          { DX_ID: 'DX-1002', VISIT_LINK: 'ENC-88192', ICD10: 'J18.9', DX_CAT: 'Secondary', ONSET: '2026-08-12' },
          { DX_ID: 'DX-1003', VISIT_LINK: 'ENC-88193', ICD10: 'J20.9', DX_CAT: 'Secondary', ONSET: '2026-08-13' },
          { DX_ID: 'DX-1004', VISIT_LINK: 'ENC-88194', ICD10: 'Z20.822', DX_CAT: 'Exposure', ONSET: '2026-08-10' },
        ],
        totalRows: 880,
        status: 'ready',
      },
    ],
    mappings: {
      'file-enc-1': [
        { targetField: 'encounter_id', targetLabel: 'Encounter Identifier', required: true, dataType: 'String', description: 'Encounter token', mappedSourceField: 'VISIT_NUM' },
        { targetField: 'patient_token', targetLabel: 'De-identified Patient Token', required: true, dataType: 'String', description: 'Master patient ID', mappedSourceField: 'PATIENT_ID' },
        { targetField: 'admission_date', targetLabel: 'Admission / Visit Date', required: true, dataType: 'Datetime', description: 'Registration timestamp', mappedSourceField: 'ADM_TIME' },
        { targetField: 'discharge_date', targetLabel: 'Discharge Date', required: false, dataType: 'Datetime', description: 'Departure timestamp', mappedSourceField: 'DISCH_TIME' },
        { targetField: 'department', targetLabel: 'Clinical Service Department', required: false, dataType: 'String', description: 'Department code', mappedSourceField: 'SERVICE_UNIT' },
        { targetField: 'primary_dx_code', targetLabel: 'Primary Diagnosis Code', required: true, dataType: 'String', description: 'Primary diagnosis', mappedSourceField: 'PRIMARY_ICD' },
      ],
      'file-dx-2': [
        { targetField: 'dx_record_id', targetLabel: 'Diagnosis Record ID', required: true, dataType: 'String', description: 'Diagnosis index', mappedSourceField: 'DX_ID' },
        { targetField: 'encounter_id', targetLabel: 'Associated Encounter ID', required: true, dataType: 'String', description: 'Linked encounter', mappedSourceField: 'VISIT_LINK' },
        { targetField: 'icd10_code', targetLabel: 'ICD-10-CM Code', required: true, dataType: 'String', description: 'ICD-10 diagnosis', mappedSourceField: 'ICD10' },
        { targetField: 'diagnosis_type', targetLabel: 'Diagnosis Category', required: false, dataType: 'Enum', description: 'Type of diagnosis', mappedSourceField: 'DX_CAT' },
        { targetField: 'onset_date', targetLabel: 'Reported Symptom Onset Date', required: false, dataType: 'Date', description: 'Onset date', mappedSourceField: 'ONSET' },
      ],
    },
    validationResults: {
      totalRows: 2130,
      validRows: 2118,
      invalidRows: 12,
      duplicateCandidates: 4,
      missingValues: 5,
      invalidDates: 2,
      unknownCodes: 1,
      errors: [
        {
          rowNumber: 4,
          column: 'VISIT_NUM',
          value: 'ENC-88192',
          severity: 'Warning',
          message: 'Potential duplicate encounter token. Timestamp is 30 mins later than row 1.',
          suggestedAction: 'Will merge during staging by selecting latest revision.',
        },
        {
          rowNumber: 17,
          column: 'DISCH_TIME',
          value: '',
          severity: 'Info',
          message: 'Discharge timestamp is blank. Patient may currently be an active inpatient.',
          suggestedAction: 'Record accepted with open status.',
        },
        {
          rowNumber: 42,
          column: 'PRIMARY_ICD',
          value: 'J09.X-UNKNOWN',
          severity: 'Error',
          message: 'Invalid ICD-10 formatting: non-standard trailing suffix.',
          suggestedAction: 'Row will be isolated to quarantine rejection bucket.',
        },
        {
          rowNumber: 104,
          column: 'ADM_TIME',
          value: '08/32/2026 14:00',
          severity: 'Error',
          message: 'Invalid calendar date: Day 32 does not exist.',
          suggestedAction: 'Reject row pending manual revision.',
        },
      ],
    },
  },
  {
    id: 'conflicts_unmapped',
    name: 'Scenario C: Unmapped Columns & Conflicting Historical Counts',
    badge: 'Requires Mapping & Conflict Review',
    description: 'Demonstrates handling legacy column names and alerting the user when imported cases conflict with an existing closed month.',
    files: [
      {
        id: 'file-legacy-1',
        name: 'legacy_outpatient_surveillance_q3.csv',
        sizeKb: 85,
        datasetType: 'Monthly Cases',
        headers: ['RAW_MONTH', 'DIAG_CODE', 'TALLY_NUM', 'CLINIC_SITE'],
        sampleRows: [
          { RAW_MONTH: '2026-07', DIAG_CODE: 'U07.1', TALLY_NUM: '385', CLINIC_SITE: 'West Wing Outpatient' },
          { RAW_MONTH: '2026-08', DIAG_CODE: 'U07.1', TALLY_NUM: '410', CLINIC_SITE: 'West Wing Outpatient' },
          { RAW_MONTH: '2026-09', DIAG_CODE: 'U07.1', TALLY_NUM: '290', CLINIC_SITE: 'West Wing Outpatient' },
        ],
        totalRows: 90,
        status: 'ready',
      },
    ],
    mappings: {
      'file-legacy-1': [
        { targetField: 'period', targetLabel: 'Reporting Period (YYYY-MM)', required: true, dataType: 'Date', description: 'Monthly period', mappedSourceField: 'RAW_MONTH' },
        { targetField: 'disease_code', targetLabel: 'Disease Code (ICD-10)', required: true, dataType: 'String', description: 'ICD-10 code', mappedSourceField: 'DIAG_CODE' },
        { targetField: 'disease_name', targetLabel: 'Disease Name / Label', required: false, dataType: 'String', description: 'Condition name', mappedSourceField: null },
        { targetField: 'monthly_cases', targetLabel: 'Monthly Confirmed Cases', required: true, dataType: 'Integer', description: 'Case count', mappedSourceField: 'TALLY_NUM' },
        { targetField: 'inpatient_admissions', targetLabel: 'Inpatient Admissions', required: false, dataType: 'Integer', description: 'Hospitalized', mappedSourceField: null },
        { targetField: 'facility_id', targetLabel: 'Hospital Facility ID', required: false, dataType: 'String', description: 'Facility unit', mappedSourceField: 'CLINIC_SITE' },
      ],
    },
    validationResults: {
      totalRows: 90,
      validRows: 88,
      invalidRows: 2,
      duplicateCandidates: 3,
      missingValues: 0,
      invalidDates: 0,
      unknownCodes: 0,
      errors: [
        {
          rowNumber: 1,
          column: 'monthly_cases',
          value: '385 (existing: 350)',
          severity: 'Warning',
          message: 'Conflict with closed period Jul 2026. Imported count differs from currently validated baseline by +35 cases.',
          suggestedAction: 'Requires supervisor confirmation to overwrite baseline archive.',
        },
        {
          rowNumber: 52,
          column: 'TALLY_NUM',
          value: '-4',
          severity: 'Error',
          message: 'Negative monthly case count is physically impossible for cumulative surveillance.',
          suggestedAction: 'Reject row.',
        },
      ],
    },
  },
];
