import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { MonthPeriod } from '@/types';
import { cs } from '@/i18n/cs';

interface PeriodSelectorProps {
  periods: MonthPeriod[];
  selectedPeriod: string;
  onSelectPeriod: (periodKey: string) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periods,
  selectedPeriod,
  onSelectPeriod,
}) => {
  if (periods.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 h-9 rounded-btn border border-border-subtle bg-bg-card text-xs font-medium text-text-primary select-none">
        <Calendar className="w-3.5 h-3.5 text-text-secondary" />
        <span>{periods[0]?.label || cs.app.allPeriods}</span>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <Calendar className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 pointer-events-none" />
      <select
        value={selectedPeriod}
        onChange={(e) => onSelectPeriod(e.target.value)}
        className="h-9 pl-8 pr-7 rounded-btn border border-border-subtle bg-bg-card text-xs font-medium text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer hover:border-border-strong transition-colors"
      >
        <option value="all" className="bg-bg-card text-text-primary">{cs.app.allPeriods}</option>
        {periods.map((p) => (
          <option key={p.key} value={p.key} className="bg-bg-card text-text-primary">
            {p.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2 pointer-events-none" />
    </div>
  );
};
