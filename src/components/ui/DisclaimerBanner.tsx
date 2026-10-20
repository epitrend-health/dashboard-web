import React from 'react';
import { Info, X } from 'lucide-react';

interface DisclaimerBannerProps {
  customMessage?: string;
  onDismiss?: () => void;
  className?: string;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  customMessage,
  onDismiss,
  className = '',
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  return (
    <div
      className={`bg-slate-50 border border-slate-200/80 rounded-lg px-4 py-3 flex items-start justify-between gap-3 text-xs text-slate-600 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-800 mr-1.5">Hospital Demo Mode:</span>
          {customMessage ||
            'This dashboard uses sample hospital numbers to demonstrate trend monitoring. No real patient data is exposed.'}
        </div>
      </div>
      {onDismiss ? (
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss();
          }}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : null}
    </div>
  );
};
