import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, Archive } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Completed' | 'Completed with Warnings' | 'Failed' | 'In Review' | 'Active' | 'Validated' | 'Needs Normalization' | 'Archived' | 'Success' | 'Warning' | 'Error';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'Completed':
    case 'Active':
    case 'Validated':
    case 'Success':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{status}</span>
        </span>
      );

    case 'Completed with Warnings':
    case 'Warning':
    case 'Needs Normalization':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{status}</span>
        </span>
      );

    case 'Failed':
    case 'Error':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/60">
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{status}</span>
        </span>
      );

    case 'In Review':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200/60">
          <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>{status}</span>
        </span>
      );

    case 'Archived':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <Archive className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{status}</span>
        </span>
      );
  }
};
