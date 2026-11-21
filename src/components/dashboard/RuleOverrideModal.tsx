import React from 'react';
import { CategoryId } from '@/types';
import { cs } from '@/i18n/cs';
import { CATEGORIES } from '@/data/categories';
import { Button } from '@/components/ui/Button';

interface RuleOverrideModalProps {
  isOpen: boolean;
  merchantName: string;
  targetCategory: CategoryId;
  onConfirmOnlyThis: () => void;
  onConfirmAll: () => void;
  onCancel: () => void;
}

export const RuleOverrideModal: React.FC<RuleOverrideModalProps> = ({
  isOpen,
  merchantName,
  targetCategory,
  onConfirmOnlyThis,
  onConfirmAll,
  onCancel,
}) => {
  if (!isOpen) return null;

  const categoryLabel = CATEGORIES[targetCategory]?.label || targetCategory;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md bg-bg-card border border-border-subtle rounded-card shadow-popover p-5 space-y-4">
        <h3 className="text-base font-semibold text-text-primary">
          {cs.rules.dialogTitle}
        </h3>

        <p className="text-xs text-text-secondary leading-relaxed">
          {cs.rules.dialogDesc(merchantName, categoryLabel)}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onCancel} className="w-full sm:w-auto">
            Zrušit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onConfirmOnlyThis}
            className="w-full sm:w-auto"
          >
            {cs.rules.onlyThis}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirmAll}
            className="w-full sm:w-auto"
          >
            {cs.rules.allCurrentAndFuture}
          </Button>
        </div>
      </div>
    </div>
  );
};
