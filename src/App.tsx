import { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Moon,
  Sun,
  RotateCcw,
  Building2,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { Transaction, CategoryId, ParseResult, UserCategoryRule, BankProfile, MonthPeriod } from '@/types';
import { DEMO_TRANSACTIONS } from '@/data/demoData';
import { cs, formatCurrencyCzk } from '@/i18n/cs';
import { useTheme } from '@/hooks/useTheme';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { CsvDropzone } from '@/components/import/CsvDropzone';
import { RuleOverrideModal } from '@/components/dashboard/RuleOverrideModal';
import { PeriodSelector } from '@/components/dashboard/PeriodSelector';
import { CategoryDonutChart } from '@/components/dashboard/CategoryDonutChart';
import { DailySpendingChart } from '@/components/dashboard/DailySpendingChart';
import { InsightsGrid } from '@/components/dashboard/InsightsGrid';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { MonthlyWrappedModal } from '@/components/wrapped/MonthlyWrappedModal';
import {
  getUserCategoryRules,
  saveUserCategoryRule,
  clearAllStoredData,
} from '@/services/storage';
import { reapplyRules } from '@/services/categorizer';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(DEMO_TRANSACTIONS);
  const [detectedBank, setDetectedBank] = useState<BankProfile | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [userRules, setUserRules] = useState<UserCategoryRule[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hook for filtering, insights, sorting, pagination
  const {
    availablePeriods,
    selectedPeriod,
    setSelectedPeriod,
    periodTransactions,
    insights,
    searchInput,
    setSearchInput,
    selectedCategory,
    setSelectedCategory,
    sortField,
    sortDirection,
    toggleSort,
    filteredTransactions,
    paginatedTransactions,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    periodCount,
  } = useTransactions(allTransactions);

  // Modal state for category override rule
  const [pendingOverride, setPendingOverride] = useState<{
    txId: string;
    merchantName: string;
    newCategory: CategoryId;
  } | null>(null);

  // Modal state for 9:16 Monthly Wrapped card
  const [showWrappedModal, setShowWrappedModal] = useState<boolean>(false);

  // Active MonthPeriod for Wrapped
  const activePeriodObj: MonthPeriod = useMemo(() => {
    const match = availablePeriods.find((p) => p.key === selectedPeriod);
    if (match) return match;
    if (availablePeriods[0]) return availablePeriods[0];
    return {
      key: '2024-10',
      year: 2024,
      month: 10,
      label: 'Říjen 2024',
    };
  }, [availablePeriods, selectedPeriod]);

  // Load saved rules on mount
  useEffect(() => {
    const rules = getUserCategoryRules();
    setUserRules(rules);
    if (rules.length > 0) {
      setAllTransactions((prev) => reapplyRules(prev, rules));
    }
  }, []);

  const handleLoadDemo = () => {
    setDetectedBank(null);
    setAllTransactions(reapplyRules(DEMO_TRANSACTIONS, userRules));
    setShowImport(false);
  };

  const handleClear = () => {
    if (window.confirm(cs.app.clearConfirm)) {
      setAllTransactions([]);
      setDetectedBank(null);
      clearAllStoredData();
      setUserRules([]);
    }
  };

  const handleCsvParsed = (result: ParseResult) => {
    setDetectedBank(result.detectedBank);
    setAllTransactions(result.transactions);
    setShowImport(false);
  };

  // Inline category change handler
  const handleCategoryChangeClick = (txId: string, merchantName: string, newCategory: CategoryId) => {
    setPendingOverride({
      txId,
      merchantName,
      newCategory,
    });
  };

  // Apply to ONLY this single transaction
  const handleConfirmOnlyThis = () => {
    if (!pendingOverride) return;
    const { txId, newCategory } = pendingOverride;

    setAllTransactions((prev) =>
      prev.map((tx) =>
        tx.id === txId
          ? {
              ...tx,
              category: newCategory,
              categorySource: 'manual',
            }
          : tx
      )
    );
    setPendingOverride(null);
  };

  // Apply to ALL current & future transactions of this merchant
  const handleConfirmAll = () => {
    if (!pendingOverride) return;
    const { merchantName, newCategory } = pendingOverride;

    const newRule: UserCategoryRule = {
      merchantKey: merchantName,
      categoryId: newCategory,
      createdAt: new Date().toISOString(),
    };

    saveUserCategoryRule(newRule);
    const updatedRules = [...userRules.filter((r) => r.merchantKey !== merchantName), newRule];
    setUserRules(updatedRules);

    // Reapply to all transactions
    setAllTransactions((prev) => reapplyRules(prev, updatedRules));
    setPendingOverride(null);
  };

  // Check for foreign currencies in current period
  const foreignCurrencyCount = periodTransactions.filter((t) => t.currency !== 'CZK').length;
  const transferCount = periodTransactions.filter((t) => t.category === 'transfer').length;

  return (
    <div className="min-h-screen bg-bg-app text-text-primary flex flex-col font-sans transition-colors duration-150">
      {/* Top Header */}
      <header
        style={{ backgroundColor: 'var(--bg-card)' }}
        className={`sticky top-0 z-40 w-full border-b transition-all duration-150 ${
          isScrolled
            ? 'border-border-strong shadow-sm'
            : 'border-border-subtle'
        }`}
      >
        <div className="max-w-content mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-btn bg-accent flex items-center justify-center text-accent-foreground font-semibold text-xs select-none">
              BW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight text-text-primary">
                  {cs.app.title}
                </h1>
                <Badge
                  variant="outline"
                  className="hidden md:inline-flex text-[11px]"
                >
                  <ShieldCheck className="w-3 h-3 text-income" />
                  {cs.app.privacyBadge}
                </Badge>
                {detectedBank && (
                  <Badge variant="secondary" className="hidden lg:inline-flex gap-1 text-[11px]">
                    <Building2 className="w-3 h-3 text-text-secondary" />
                    {detectedBank.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Period selector dropdown */}
            {availablePeriods.length > 0 && (
              <PeriodSelector
                periods={availablePeriods}
                selectedPeriod={selectedPeriod}
                onSelectPeriod={setSelectedPeriod}
              />
            )}

            {/* Monthly Wrapped Trigger Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowWrappedModal(true)}
            >
              <span>{cs.wrapped.openButton}</span>
            </Button>

            <Button
              variant={showImport ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowImport(!showImport)}
              className="gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{cs.app.newImport}</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLoadDemo}
              title="Obnovit demo data"
              className="hidden md:inline-flex"
            >
              {cs.app.demoButton}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              title={cs.app.clearAll}
              className="text-text-secondary hover:text-danger"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline ml-1">{cs.app.clearAll}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? cs.app.themeLight : cs.app.themeDark}
              className="rounded-btn h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-text-secondary" />
              ) : (
                <Moon className="w-4 h-4 text-text-secondary" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-content w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* CSV Import Dropzone toggle */}
        {showImport && (
          <div className="animate-in fade-in duration-150">
            <CsvDropzone onParsed={handleCsvParsed} userRules={userRules} />
          </div>
        )}

        {/* Currency warning if foreign transactions exist */}
        {foreignCurrencyCount > 0 && (
          <div className="flex items-center gap-2 p-2.5 text-xs rounded-btn bg-warning-subtle text-warning border border-warning/20">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{cs.kpi.foreignCurrenciesWarning(foreignCurrencyCount, 'CZK')}</span>
          </div>
        )}

        {/* KPI Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs font-medium text-text-secondary">
                {cs.kpi.totalExpense}
              </span>
              <div className="text-xl font-semibold tabular-nums text-text-primary">
                {formatCurrencyCzk(insights.totalExpenseMinor)}
              </div>
              <p className="text-xs text-text-secondary pt-0.5">
                {cs.kpi.transfersExcludedNote}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs font-medium text-text-secondary">
                {cs.kpi.totalIncome}
              </span>
              <div className="text-xl font-semibold tabular-nums text-income">
                +{formatCurrencyCzk(insights.totalIncomeMinor)}
              </div>
              <p className="text-xs text-text-secondary pt-0.5">
                Zahrnuje mzdu a další příjmy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs font-medium text-text-secondary">
                {cs.kpi.netBalance}
              </span>
              <div
                className={`text-xl font-semibold tabular-nums ${
                  insights.netBalanceMinor >= 0 ? 'text-income' : 'text-danger'
                }`}
              >
                {insights.netBalanceMinor >= 0 ? '+' : ''}
                {formatCurrencyCzk(insights.netBalanceMinor)}
              </div>
              <p className="text-xs text-text-secondary pt-0.5">
                {insights.netBalanceMinor >= 0 ? cs.kpi.saved : cs.kpi.deficit} (Míra úspor{' '}
                {insights.savingsRatePercentage} %)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs font-medium text-text-secondary">
                Počet transakcí
              </span>
              <div className="text-xl font-semibold tabular-nums text-text-primary">
                {periodCount}
              </div>
              <p className="text-xs text-text-secondary pt-0.5">
                {totalCount > periodCount ? `Z celkových ${totalCount} • ` : ''}
                Včetně {transferCount} převodů
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <CategoryDonutChart
            transactions={periodTransactions}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
          <DailySpendingChart
            transactions={periodTransactions}
            expensiveDay={insights.expensiveDay}
          />
        </div>

        {/* Insights Cards Grid */}
        <InsightsGrid cards={insights.cards} />

        {/* Transactions Table Section */}
        <TransactionTable
          transactions={periodTransactions}
          paginatedTransactions={paginatedTransactions}
          totalFilteredCount={filteredTransactions.length}
          totalPeriodCount={periodCount}
          searchInput={searchInput}
          onSearchChange={setSearchInput}
          selectedCategory={selectedCategory}
          onCategoryFilterChange={setSelectedCategory}
          sortField={sortField}
          sortDirection={sortDirection}
          onToggleSort={toggleSort}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onCategoryChangeClick={handleCategoryChangeClick}
        />

        {/* Category Override Rule Modal */}
        {pendingOverride && (
          <RuleOverrideModal
            isOpen={true}
            merchantName={pendingOverride.merchantName}
            targetCategory={pendingOverride.newCategory}
            onConfirmOnlyThis={handleConfirmOnlyThis}
            onConfirmAll={handleConfirmAll}
            onCancel={() => setPendingOverride(null)}
          />
        )}

        {/* 9:16 Monthly Wrapped Modal */}
        <MonthlyWrappedModal
          isOpen={showWrappedModal}
          onClose={() => setShowWrappedModal(false)}
          period={activePeriodObj}
          insights={insights}
          transactions={periodTransactions}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-12 py-6 text-xs text-text-secondary">
        <div className="max-w-content mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>BankWrapped • Všechna data zůstávají lokálně ve vašem prohlížeči.</p>
          <div className="flex items-center gap-4 text-xs text-text-tertiary">
            <span>Bez cookies</span>
            <span>Bez telemetrie</span>
            <span>Lokální fonty</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
