import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Filter,
  Upload,
  Layers,
  FileText,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react';
import { MOCK_DATASETS } from '../../lib/mock-data/datasets';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DisclaimerBanner } from '../../components/ui/DisclaimerBanner';
import { DatasetItem, NavigationTab } from '../../types';

interface DataManagementPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DataManagementPage: React.FC<DataManagementPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [schemaModalDataset, setSchemaModalDataset] = useState<DatasetItem | null>(null);

  // Filter datasets
  const filteredDatasets = useMemo(() => {
    return MOCK_DATASETS.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.source.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'all' || d.type === selectedType;
      const matchStatus = selectedStatus === 'all' || d.status === selectedStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [searchQuery, selectedType, selectedStatus]);

  // Aggregate high-level stats
  const totalRecords = MOCK_DATASETS.reduce((acc, curr) => acc + curr.recordCount, 0);

  return (
    <div className="space-y-6">
      <DisclaimerBanner
        customMessage="This page lists the hospital files and tables stored in the system. All records are validated before being used in forecast calculations."
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">
            Hospital Data Catalogs
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {MOCK_DATASETS.length}
            </span>
            <span className="text-xs text-slate-500">active tables</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Monthly, lab & inpatient files</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">
            Total Ingested Records
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {totalRecords.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">+14.7k recently</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Patient cases on file</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">
            Last Successful Ingestion
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">Sep 29, 2026</span>
          </div>
          <span className="text-xs text-emerald-600 mt-1 block">All records verified</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">
            System Data Health
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-lg font-bold text-slate-900">Clean & Synced</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Zero file errors detected</span>
        </div>
      </div>

      {/* Friendly Light Explanation Callout */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Hospital Data Safety & Storage</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hospital records are kept organized by type (<strong className="text-slate-900 font-semibold">Monthly Case Counts</strong>,{' '}
              <strong className="text-slate-900 font-semibold">Patient Visits</strong>, and{' '}
              <strong className="text-slate-900 font-semibold">Lab Tests</strong>). When you upload a new spreadsheet, the system checks dates and numbers automatically before updating the charts.
            </p>
          </div>

          <button
            onClick={() => onNavigate('csv-import')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shrink-0 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New CSV File</span>
          </button>
        </div>
      </div>

      {/* Dataset Management Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ingested Dataset Repositories</h3>
            <p className="text-xs text-slate-500">Historical records powering baseline calculations and model training</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dataset or source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-52 bg-slate-50 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="all">All Dataset Types</option>
              <option value="Monthly Cases">Monthly Cases</option>
              <option value="Encounters">Encounters</option>
              <option value="Conditions / Diagnoses">Conditions / Diagnoses</option>
              <option value="Lab Observations">Lab Observations</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Validated">Validated</option>
              <option value="Needs Normalization">Needs Normalization</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Dataset Name & Provenance</th>
                <th className="py-2.5 px-3">Category Schema</th>
                <th className="py-2.5 px-3">Temporal Coverage</th>
                <th className="py-2.5 px-3 text-right">Total Records</th>
                <th className="py-2.5 px-3">Missing Values</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDatasets.map((ds) => (
                <tr key={ds.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{ds.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{ds.source}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-700">{ds.type}</span>
                    <div className="text-[10px] font-mono text-slate-400">{ds.schemaVersion}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    {ds.dateCoverage}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                    {ds.recordCount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`tabular-nums ${
                        ds.missingValuesPct > 2 ? 'text-amber-600 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {ds.missingValuesPct}% null
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={ds.status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSchemaModalDataset(ds)}
                      className="px-2.5 py-1 text-xs text-teal-700 hover:text-teal-900 font-medium bg-slate-50 hover:bg-slate-100 rounded border border-slate-200"
                    >
                      View Schema
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredDatasets.length} of {MOCK_DATASETS.length} datasets</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('import-history')}
              className="text-teal-700 hover:text-teal-900 font-medium"
            >
              View Import Audit History →
            </button>
          </div>
        </div>
      </div>

      {/* Schema Detail Modal */}
      {schemaModalDataset && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-scale-up">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{schemaModalDataset.name}</h4>
                <p className="text-xs text-slate-500">Schema Specification · {schemaModalDataset.schemaVersion}</p>
              </div>
              <button
                onClick={() => setSchemaModalDataset(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dataset Type</span>
                  <span className="font-semibold text-slate-800">{schemaModalDataset.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Stored Rows</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {schemaModalDataset.recordCount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Coverage Window</span>
                  <span className="font-mono text-slate-700">{schemaModalDataset.dateCoverage}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Origin</span>
                  <span className="text-slate-700">{schemaModalDataset.source}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-800 block mb-1">Standard Storage Schema</span>
                <p className="text-slate-500 mb-2">
                  Mapped standardized columns for {schemaModalDataset.type}:
                </p>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1">
                  <div>// Standard PostgreSQL Relational Target:</div>
                  <div className="text-teal-400">table: epi_{schemaModalDataset.type.toLowerCase().replace(/[^a-z0-9]/g, '_')}</div>
                  <div className="text-slate-400">├── period (DATE NOT NULL)</div>
                  <div className="text-slate-400">├── disease_code (VARCHAR(16) NOT NULL REFERENCES diseases)</div>
                  <div className="text-slate-400">├── count (INTEGER CHECK (count &gt;= 0))</div>
                  <div className="text-slate-400">└── ingestion_batch_id (UUID NOT NULL)</div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setSchemaModalDataset(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
