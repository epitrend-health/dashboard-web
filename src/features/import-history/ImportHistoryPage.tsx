import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { MOCK_IMPORT_BATCHES } from '../../lib/mock-data/importBatches';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DisclaimerBanner } from '../../components/ui/DisclaimerBanner';
import { BatchDetailDrawer } from './BatchDetailDrawer';
import { ImportBatch, NavigationTab } from '../../types';

interface ImportHistoryPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const ImportHistoryPage: React.FC<ImportHistoryPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeDrawerBatch, setActiveDrawerBatch] = useState<ImportBatch | null>(null);

  const filteredBatches = useMemo(() => {
    return MOCK_IMPORT_BATCHES.filter((b) => {
      const matchSearch =
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.targetDatasetType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = selectedStatus === 'all' || b.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, selectedStatus]);

  return (
    <div className="space-y-6">
      <DisclaimerBanner customMessage="Import audit history tracks provenance, validation error summaries, and row-level transformation logs for hospital regulatory compliance." />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Total Import Batches
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {MOCK_IMPORT_BATCHES.length}
            </span>
            <span className="text-xs text-slate-500">recorded sessions</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Full provenance retained</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Cumulative Records Ingested
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">44,220</span>
            <span className="text-xs text-emerald-600 font-semibold">99.9% acceptance</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">23 rows quarantined</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Audit Ledger State
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-lg font-bold text-slate-900">Compliant</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">HIPAA / De-identification Verified</span>
        </div>
      </div>

      {/* Main Batches Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ingestion Audit Log</h3>
            <p className="text-xs text-slate-500">Historical records of all hospital file ingestion jobs</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search batch ID or uploader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-56 bg-slate-50 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value="all">All Batches</option>
              <option value="Completed">Completed</option>
              <option value="Completed with Warnings">Completed with Warnings</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Batch Transaction ID</th>
                <th className="py-2.5 px-3">Ingested Target</th>
                <th className="py-2.5 px-3">Uploaded By</th>
                <th className="py-2.5 px-3 text-right">Files</th>
                <th className="py-2.5 px-3 text-right">Committed Records</th>
                <th className="py-2.5 px-3 text-right">Rejections</th>
                <th className="py-2.5 px-3">Batch Status</th>
                <th className="py-2.5 px-3 text-right">Audit Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => setActiveDrawerBatch(b)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-slate-900 group-hover:text-teal-700">
                      {b.id}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">{b.timestamp}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800">{b.targetDatasetType}</span>
                  </td>

                  <td className="py-3 px-3 text-slate-600">{b.uploadedBy}</td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    {b.fileCount}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                    {b.validRecords.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-500">
                    {b.rejectedRecords > 0 ? (
                      <span className="text-rose-600 font-medium">{b.rejectedRecords}</span>
                    ) : (
                      '0'
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <StatusBadge status={b.status} />
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDrawerBatch(b);
                      }}
                      className="px-2.5 py-1 text-xs text-teal-700 hover:text-teal-900 font-medium bg-slate-50 hover:bg-slate-100 rounded border border-slate-200"
                    >
                      Inspect →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredBatches.length} of {MOCK_IMPORT_BATCHES.length} batches</span>
          <button
            onClick={() => onNavigate('csv-import')}
            className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
          >
            Launch New CSV Import Wizard →
          </button>
        </div>
      </div>

      {/* Detail Slide-Over Drawer */}
      <BatchDetailDrawer
        batch={activeDrawerBatch}
        onClose={() => setActiveDrawerBatch(null)}
      />
    </div>
  );
};
