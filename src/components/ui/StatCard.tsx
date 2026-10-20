import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  plainExplanation?: string;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
    label: string;
  };
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  plainExplanation,
  change,
  icon: Icon,
  iconBg = 'bg-slate-100',
  iconColor = 'text-slate-700',
  badgeText,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {value}
            </span>
            {subValue && (
              <span className="text-xs text-slate-500 tabular-nums font-normal">
                {subValue}
              </span>
            )}
          </div>
          {plainExplanation && (
            <p className="mt-1 text-xs text-slate-600 font-normal leading-snug">
              {plainExplanation}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {change ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-semibold tabular-nums ${
                change.trend === 'up'
                  ? 'text-rose-600'
                  : change.trend === 'down'
                  ? 'text-emerald-600'
                  : 'text-slate-600'
              }`}
            >
              {change.value}
            </span>
            <span className="text-slate-500">{change.label}</span>
          </div>
        ) : (
          <span className="text-slate-400">Baseline established</span>
        )}

        {badgeText && (
          <span className="text-[11px] font-medium text-slate-500">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
