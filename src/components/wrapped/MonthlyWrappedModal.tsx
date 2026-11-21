import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import {
  X,
  Download,
  Eye,
  EyeOff,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { CategoryId, InsightsResult, MonthPeriod, Transaction } from '@/types';
import { cs, formatCurrencyCzk } from '@/i18n/cs';
import { getCategoryDefinition } from '@/data/categories';
import { Button } from '@/components/ui/Button';

interface MonthlyWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: MonthPeriod;
  insights: InsightsResult;
  transactions: Transaction[];
}

export const MonthlyWrappedModal: React.FC<MonthlyWrappedModalProps> = ({
  isOpen,
  onClose,
  period,
  insights,
  transactions,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hideAmounts, setHideAmounts] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(0.35);

  // Calculate dynamic scale factor to fit 1080x1920 card on screen
  useEffect(() => {
    function updateScale() {
      if (!isOpen) return;
      const availableHeight = window.innerHeight * 0.78;
      const targetScale = Math.min(availableHeight / 1920, 0.42);
      setScale(Math.max(0.2, targetScale));
    }

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Month locative declension (e.g. "V říjnu", "V březnu")
  const monthLocative = cs.monthsLocative[period.month] || `V ${period.label}`;

  // Top category computation
  const categoryMap: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.category === 'transfer' || tx.category === 'income') continue;
    if (tx.amountMinor < 0) {
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + Math.abs(tx.amountMinor);
    } else {
      categoryMap[tx.category] = Math.max(0, (categoryMap[tx.category] || 0) - tx.amountMinor);
    }
  }

  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const topCategoryEntry = sortedCategories[0];
  const topCategoryDef = topCategoryEntry
    ? getCategoryDefinition(topCategoryEntry[0] as CategoryId)
    : null;
  const topCategoryPct =
    topCategoryEntry && insights.totalExpenseMinor > 0
      ? (topCategoryEntry[1] / insights.totalExpenseMinor) * 100
      : 0;

  // Most visited merchant
  const topMerchant = insights.topMerchantsByCount[0] || null;

  // Expensive day formatted date
  let expensiveDayFormatted = '';
  if (insights.expensiveDay) {
    const [y, m, d] = insights.expensiveDay.date.split('-');
    expensiveDayFormatted = `${parseInt(d || '1', 10)}. ${cs.monthNamesNominative[parseInt(m || '1', 10)]?.toLowerCase() || m} ${y}`;
  }

  // Export card as high-res PNG
  const handleDownloadPng = async () => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);

    try {
      // 1. Wait for local fonts to be fully rendered
      if (document.fonts) {
        await document.fonts.ready;
      }

      // Small tick for DOM stability
      await new Promise((resolve) => setTimeout(resolve, 80));

      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        width: 1080,
        height: 1920,
        cacheBust: true,
        style: {
          transform: 'none',
          position: 'static',
        },
      });

      // Trigger download
      const link = document.createElement('a');
      link.download = `bankwrapped-${period.year}-${String(period.month).padStart(2, '0')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export Wrapped card:', err);
      alert('Nepodařilo se vygenerovat PNG obrázek. Zkuste to prosím znovu.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wrapped-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60"
    >
      <div className="relative w-full max-w-4xl bg-bg-card border border-border-subtle rounded-card shadow-popover flex flex-col items-center p-4 sm:p-5 max-h-[96vh] overflow-hidden">
        {/* Header Controls */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-border-subtle gap-3">
          <div className="flex items-center gap-2">
            <h2 id="wrapped-title" className="text-base font-semibold text-text-primary">
              {cs.wrapped.modalTitle} ({period.label})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle hide sensitive amounts */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setHideAmounts(!hideAmounts)}
              className="gap-1.5 text-xs h-9"
            >
              {hideAmounts ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-warning" />
                  <span className="hidden sm:inline">Částky skryty</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{cs.wrapped.hideAmountsLabel}</span>
                </>
              )}
            </Button>

            {/* PNG Download Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="gap-1.5 text-xs h-9"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? cs.wrapped.downloading : cs.wrapped.downloadPng}</span>
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-btn text-text-secondary hover:bg-bg-hover transition-colors"
              aria-label="Zavřít"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scaled Preview Viewport */}
        <div className="flex-1 w-full flex items-center justify-center overflow-hidden py-3">
          <div
            style={{
              width: `${1080 * scale}px`,
              height: `${1920 * scale}px`,
            }}
            className="relative flex items-center justify-center shrink-0"
          >
            {/* Real 1080x1920 Wrapped Card rendered at 1080x1920 and scaled via transform */}
            <div
              ref={cardRef}
              style={{
                width: '1080px',
                height: '1920px',
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
              className="absolute top-0 left-0 bg-[#0B0C0F] text-[#F2F3F5] p-16 flex flex-col justify-between rounded-[24px] select-none font-sans overflow-hidden border border-[#242830]"
            >
              {/* Card Top: Branding & Period */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[8px] bg-[#2B59FF] flex items-center justify-center text-white text-xl font-semibold">
                      BW
                    </div>
                    <div>
                      <div className="text-2xl font-semibold tracking-tight text-[#F2F3F5]">
                        BANKWRAPPED
                      </div>
                      <div className="text-[#A3A9B5] text-base font-normal">
                        {period.label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#14161B] border border-[#242830] text-sm font-medium text-[#A3A9B5]">
                    <ShieldCheck className="w-4 h-4 text-[#20A78B]" />
                    <span>Lokální data</span>
                  </div>
                </div>
              </div>

              {/* Card Body: Highlights */}
              <div className="relative z-10 space-y-8 my-auto">
                {/* 1. Main Headline: Total Spent */}
                <div className="bg-[#14161B] rounded-[10px] p-10 border border-[#242830] space-y-3">
                  <div className="text-xl font-normal text-[#A3A9B5]">
                    {monthLocative} jsi utratil celkem
                  </div>
                  <div className="text-8xl font-bold tabular-nums tracking-tight text-[#F2F3F5]">
                    {hideAmounts ? '•••••• Kč' : formatCurrencyCzk(insights.totalExpenseMinor)}
                  </div>
                  {insights.savingsRatePercentage > 0 && (
                    <div className="flex items-center gap-2 text-[#20A78B] text-xl font-medium pt-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>{cs.wrapped.savedMessage(insights.savingsRatePercentage)}</span>
                    </div>
                  )}
                </div>

                {/* 2. Top Category */}
                {topCategoryDef && (
                  <div className="bg-[#14161B] rounded-[10px] p-8 border border-[#242830] flex items-center gap-6">
                    <div
                      className="w-16 h-16 rounded-[8px] shrink-0"
                      style={{ backgroundColor: topCategoryDef.color }}
                    />
                    <div className="space-y-1 flex-1">
                      <div className="text-base font-normal text-[#A3A9B5]">
                        Kategorie č. 1
                      </div>
                      <div className="text-3xl font-semibold text-[#F2F3F5]">
                        {topCategoryDef.label}
                      </div>
                      <div className="text-base text-[#A3A9B5] tabular-nums">
                        {topCategoryPct.toFixed(0)} % výdajů
                        {!hideAmounts && ` (${formatCurrencyCzk(topCategoryEntry?.[1] || 0)})`}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Top Visited Merchant */}
                {topMerchant && (
                  <div className="bg-[#14161B] rounded-[10px] p-8 border border-[#242830] flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[8px] bg-[#1B1E24] border border-[#242830] flex items-center justify-center shrink-0 text-xl font-semibold text-[#F2F3F5]">
                      {topMerchant.count}×
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="text-base font-normal text-[#A3A9B5]">
                        Nejčastější obchodník
                      </div>
                      <div className="text-3xl font-semibold text-[#F2F3F5] truncate">
                        {topMerchant.merchant}
                      </div>
                      <div className="text-base text-[#A3A9B5] tabular-nums">
                        celkem {topMerchant.count} plateb
                        {!hideAmounts && ` (${formatCurrencyCzk(topMerchant.totalMinor)})`}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Most Expensive Day */}
                {insights.expensiveDay && (
                  <div className="bg-[#14161B] rounded-[10px] p-8 border border-[#242830] flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[8px] bg-[#2D2006] border border-[#F59E0B]/30 flex items-center justify-center shrink-0 text-xl font-semibold text-[#F59E0B]">
                      TOP
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="text-base font-normal text-[#A3A9B5]">
                        Nejdražší den
                      </div>
                      <div className="text-3xl font-semibold text-[#F2F3F5]">
                        {expensiveDayFormatted}
                      </div>
                      <div className="text-base text-[#A3A9B5] tabular-nums">
                        {hideAmounts
                          ? 'Den s největším nákupem'
                          : `útrata ${formatCurrencyCzk(insights.expensiveDay.totalExpenseMinor)}`}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Subscriptions */}
                {insights.subscriptions.items.length > 0 && (
                  <div className="flex items-center justify-between px-8 py-5 rounded-[10px] bg-[#14161B] border border-[#242830] text-[#A3A9B5] text-base">
                    <span>{insights.subscriptions.items.length} aktivní předplatná</span>
                    <span className="tabular-nums font-medium text-[#F2F3F5]">
                      {hideAmounts
                        ? '••••'
                        : `${formatCurrencyCzk(insights.subscriptions.monthlyTotalMinor)} / měsíc`}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="relative z-10 pt-6 border-t border-[#242830] flex items-center justify-between text-[#6E7582] text-base">
                <span>{cs.wrapped.privacyFooter}</span>
                <span className="font-medium text-[#A3A9B5]">#BankWrapped</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
