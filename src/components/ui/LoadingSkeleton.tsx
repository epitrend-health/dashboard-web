import React from 'react';

export const TableLoadingSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full animate-pulse divide-y divide-slate-100">
      <div className="py-3 px-4 bg-slate-50 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded w-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="py-3.5 px-4 flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className="h-3.5 bg-slate-100 rounded"
              style={{ width: `${Math.max(40, (100 / cols) * (0.7 + (cIdx % 3) * 0.2))}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const ChartLoadingSkeleton: React.FC<{ height?: string }> = ({ height = 'h-72' }) => {
  return (
    <div className={`w-full ${height} bg-slate-50 rounded-lg animate-pulse p-6 flex flex-col justify-end gap-3`}>
      <div className="flex items-end gap-2 h-full w-full">
        {Array.from({ length: 18 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-slate-200 rounded-t w-full"
            style={{ height: `${20 + (idx % 6) * 12 + Math.sin(idx) * 15}%` }}
          />
        ))}
      </div>
      <div className="h-3 bg-slate-200 rounded w-1/3" />
    </div>
  );
};
