import React, { useState } from 'react';
import { ColumnMapping } from '@/types';
import { cs } from '@/i18n/cs';
import { Button } from '@/components/ui/Button';
import { X, ChevronDown } from 'lucide-react';

interface ColumnMappingModalProps {
  isOpen: boolean;
  headers: string[];
  sampleRows: string[][];
  initialMapping: ColumnMapping;
  onConfirm: (mapping: ColumnMapping) => void;
  onCancel: () => void;
}

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  headers,
  sampleRows,
  initialMapping,
  onConfirm,
  onCancel,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="relative w-full max-w-xl bg-bg-card border border-border-subtle rounded-card shadow-popover p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              {cs.import.columnMapperTitle}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {cs.import.columnMapperDesc}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-btn text-text-secondary hover:bg-bg-hover transition-colors"
            aria-label="Zavřít"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Column Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-medium block mb-1 text-text-primary">
              {cs.import.colDate} *
            </label>
            <div className="relative inline-flex items-center w-full">
              <select
                value={mapping.dateCol}
                onChange={(e) => setMapping({ ...mapping, dateCol: e.target.value })}
                className="w-full h-9 pl-3 pr-8 rounded-btn border border-border-subtle bg-bg-card text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {headers.map((h) => (
                  <option key={h} value={h} className="bg-bg-card text-text-primary">
                    {h}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1 text-text-primary">
              {cs.import.colAmount} *
            </label>
            <div className="relative inline-flex items-center w-full">
              <select
                value={mapping.amountCol}
                onChange={(e) => setMapping({ ...mapping, amountCol: e.target.value })}
                className="w-full h-9 pl-3 pr-8 rounded-btn border border-border-subtle bg-bg-card text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {headers.map((h) => (
                  <option key={h} value={h} className="bg-bg-card text-text-primary">
                    {h}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1 text-text-primary">
              {cs.import.colMerchant} *
            </label>
            <div className="relative inline-flex items-center w-full">
              <select
                value={mapping.merchantCol}
                onChange={(e) => setMapping({ ...mapping, merchantCol: e.target.value })}
                className="w-full h-9 pl-3 pr-8 rounded-btn border border-border-subtle bg-bg-card text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {headers.map((h) => (
                  <option key={h} value={h} className="bg-bg-card text-text-primary">
                    {h}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1 text-text-primary">
              {cs.import.colCurrency}
            </label>
            <div className="relative inline-flex items-center w-full">
              <select
                value={mapping.currencyCol || ''}
                onChange={(e) =>
                  setMapping({ ...mapping, currencyCol: e.target.value || undefined })
                }
                className="w-full h-9 pl-3 pr-8 rounded-btn border border-border-subtle bg-bg-card text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="" className="bg-bg-card text-text-primary">(Výchozí CZK)</option>
                {headers.map((h) => (
                  <option key={h} value={h} className="bg-bg-card text-text-primary">
                    {h}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1 text-text-primary">
              {cs.import.dateFormat}
            </label>
            <div className="relative inline-flex items-center w-full">
              <select
                value={mapping.dateFormat}
                onChange={(e) => setMapping({ ...mapping, dateFormat: e.target.value })}
                className="w-full h-9 pl-3 pr-8 rounded-btn border border-border-subtle bg-bg-card text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="DD.MM.YYYY" className="bg-bg-card text-text-primary">DD.MM.YYYY (např. 05.10.2024)</option>
                <option value="DD/MM/YYYY" className="bg-bg-card text-text-primary">DD/MM/YYYY (např. 05/10/2024)</option>
                <option value="YYYY-MM-DD" className="bg-bg-card text-text-primary">YYYY-MM-DD (např. 2024-10-05)</option>
                <option value="YYYY-MM-DD HH:mm:ss" className="bg-bg-card text-text-primary">YYYY-MM-DD HH:mm:ss (Revolut)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="font-medium block mb-1 text-text-primary">
              {cs.import.decimalSep}
            </label>
            <div className="relative inline-flex items-center w-full">
              <select
                value={mapping.decimalSeparator}
                onChange={(e) =>
                  setMapping({
                    ...mapping,
                    decimalSeparator: e.target.value as ',' | '.',
                  })
                }
                className="w-full h-9 pl-3 pr-8 rounded-btn border border-border-subtle bg-bg-card text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="," className="bg-bg-card text-text-primary">Čárka (1 234,50 Kč)</option>
                <option value="." className="bg-bg-card text-text-primary">Tečka (1234.50)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Sample Preview Table */}
        <div className="space-y-1.5 pt-2">
          <p className="text-xs font-medium text-text-secondary">
            {cs.import.previewRows}
          </p>
          <div className="overflow-x-auto border border-border-subtle rounded-card">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-bg-subtle border-b border-border-subtle">
                  {headers.slice(0, 5).map((h) => (
                    <th key={h} className="p-2 whitespace-nowrap font-medium text-text-secondary">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {sampleRows.slice(0, 4).map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.slice(0, 5).map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 whitespace-nowrap text-text-secondary">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Zrušit
          </Button>
          <Button variant="primary" size="sm" onClick={() => onConfirm(mapping)}>
            {cs.import.confirmMapping}
          </Button>
        </div>
      </div>
    </div>
  );
};
