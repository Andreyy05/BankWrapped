import React from 'react';
import { format, parseISO } from 'date-fns';
import { cs as csLocale } from 'date-fns/locale';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FilterX,
} from 'lucide-react';
import { CategoryId, Transaction } from '@/types';
import { CATEGORIES, getCategoryDefinition } from '@/data/categories';
import { cs, formatCurrencyCzk } from '@/i18n/cs';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SortField, SortDirection } from '@/hooks/useTransactions';

interface TransactionTableProps {
  transactions: Transaction[];
  paginatedTransactions: Transaction[];
  totalFilteredCount: number;
  totalPeriodCount: number;
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedCategory: CategoryId | 'all';
  onCategoryFilterChange: (category: CategoryId | 'all') => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onToggleSort: (field: SortField) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCategoryChangeClick: (txId: string, merchantName: string, newCategory: CategoryId) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  paginatedTransactions,
  totalFilteredCount,
  totalPeriodCount,
  searchInput,
  onSearchChange,
  selectedCategory,
  onCategoryFilterChange,
  sortField,
  sortDirection,
  onToggleSort,
  currentPage,
  totalPages,
  onPageChange,
  onCategoryChangeClick,
}) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-text-tertiary opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-accent" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-accent" />
    );
  };

  return (
    <div className="space-y-3">
      {/* Search and Filters Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-text-primary">
            {cs.table.title}
          </h2>
          <p className="text-xs text-text-secondary">
            {cs.table.showingCount(totalFilteredCount, totalPeriodCount)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Input with Debounce */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder={cs.table.searchPlaceholder}
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-btn border border-border-subtle bg-bg-card text-xs text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryFilterChange(e.target.value as CategoryId | 'all')}
              className="h-9 pl-3 pr-8 rounded-btn border border-border-subtle bg-bg-card text-xs text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer hover:border-border-strong transition-colors"
            >
              <option value="all" className="bg-bg-card text-text-primary">{cs.table.allCategories}</option>
              {(Object.keys(CATEGORIES) as CategoryId[]).map((catId) => (
                <option key={catId} value={catId} className="bg-bg-card text-text-primary">
                  {CATEGORIES[catId].label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-secondary absolute right-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table Card (Desktop & Tablet) */}
      <Card className="overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-subtle/50 text-text-secondary font-medium select-none">
                {/* Date Sort Header */}
                <th
                  onClick={() => onToggleSort('date')}
                  className="py-2.5 px-4 w-32 cursor-pointer hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{cs.table.dateCol}</span>
                    {renderSortIcon('date')}
                  </div>
                </th>

                {/* Merchant Column */}
                <th className="py-2.5 px-4">{cs.table.merchantCol}</th>

                {/* Category Column */}
                <th className="py-2.5 px-4 w-52">{cs.table.categoryCol}</th>

                {/* Source Column */}
                <th className="py-2.5 px-4 w-24 text-center">{cs.table.sourceCol}</th>

                {/* Amount Sort Header */}
                <th
                  onClick={() => onToggleSort('amount')}
                  className="py-2.5 px-4 w-36 text-right cursor-pointer hover:text-text-primary transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>{cs.table.amountCol}</span>
                    {renderSortIcon('amount')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FilterX className="w-6 h-6 text-text-tertiary opacity-40" />
                      <p className="font-medium text-xs text-text-primary">{cs.table.emptyTitle}</p>
                      <p className="text-xs text-text-secondary">{cs.table.emptyDesc}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const categoryDef = getCategoryDefinition(tx.category);
                  const isIncome = tx.amountMinor > 0;
                  const isTransfer = tx.category === 'transfer';
                  const formattedDate = format(parseISO(tx.date), 'd. M. yyyy', {
                    locale: csLocale,
                  });

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-bg-subtle/50 transition-colors h-10"
                    >
                      {/* Date */}
                      <td className="py-2 px-4 whitespace-nowrap text-text-secondary tabular-nums text-xs">
                        {formattedDate}
                      </td>

                      {/* Merchant */}
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary">
                            {tx.cleanedMerchant}
                          </span>
                          {tx.isSubscription && (
                            <span className="text-[11px] py-0.5 px-1.5 rounded-btn border border-border-subtle text-text-secondary bg-bg-subtle">
                              Předplatné
                            </span>
                          )}
                        </div>
                        {tx.note && (
                          <span className="text-xs text-text-tertiary block truncate">
                            {tx.note}
                          </span>
                        )}
                      </td>

                      {/* Category Selector with colored dot and custom arrow */}
                      <td className="py-2 px-4 whitespace-nowrap">
                        <div className="relative inline-flex items-center">
                          <span
                            className="w-2 h-2 rounded-full absolute left-2.5 pointer-events-none shrink-0"
                            style={{ backgroundColor: categoryDef.color }}
                          />
                          <select
                            value={tx.category}
                            onChange={(e) =>
                              onCategoryChangeClick(
                                tx.id,
                                tx.cleanedMerchant,
                                e.target.value as CategoryId
                              )
                            }
                            className="text-xs rounded-btn pl-7 pr-7 py-1 border border-border-subtle bg-bg-card hover:bg-bg-subtle text-text-primary appearance-none transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
                          >
                            {(Object.keys(CATEGORIES) as CategoryId[]).map((catId) => (
                              <option
                                key={catId}
                                value={catId}
                                className="bg-bg-card text-text-primary"
                              >
                                {CATEGORIES[catId].label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-text-secondary absolute right-2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Category Source */}
                      <td className="py-2 px-4 text-center whitespace-nowrap">
                        <span className="text-[11px] tabular-nums text-text-tertiary">
                          {tx.categorySource === 'rule_user'
                            ? 'vlastní'
                            : tx.categorySource === 'manual'
                            ? 'ruční'
                            : 'auto'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-2 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-semibold tabular-nums text-xs ${
                            isTransfer
                              ? 'text-text-secondary'
                              : isIncome
                              ? 'text-income'
                              : 'text-text-primary'
                          }`}
                        >
                          {isIncome ? '+' : ''}
                          {formatCurrencyCzk(tx.amountMinor)}
                        </span>
                        {isTransfer && (
                          <div className="flex items-center justify-end gap-1 text-[11px] text-text-tertiary">
                            <ArrowLeftRight className="w-3 h-3" />
                            <span>převod</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-border-subtle">
          {paginatedTransactions.length === 0 ? (
            <div className="p-6 text-center text-xs text-text-secondary">
              {cs.table.emptyDesc}
            </div>
          ) : (
            paginatedTransactions.map((tx) => {
              const categoryDef = getCategoryDefinition(tx.category);
              const isIncome = tx.amountMinor > 0;
              const isTransfer = tx.category === 'transfer';

              return (
                <div key={tx.id} className="p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-medium text-xs text-text-primary">
                        {tx.cleanedMerchant}
                      </span>
                      <p className="text-xs text-text-secondary tabular-nums">
                        {tx.date}
                      </p>
                    </div>
                    <span
                      className={`tabular-nums font-semibold text-xs ${
                        isTransfer
                          ? 'text-text-secondary'
                          : isIncome
                          ? 'text-income'
                          : 'text-text-primary'
                      }`}
                    >
                      {isIncome ? '+' : ''}
                      {formatCurrencyCzk(tx.amountMinor)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="relative inline-flex items-center">
                      <span
                        className="w-2 h-2 rounded-full absolute left-2.5 pointer-events-none shrink-0"
                        style={{ backgroundColor: categoryDef.color }}
                      />
                      <select
                        value={tx.category}
                        onChange={(e) =>
                          onCategoryChangeClick(
                            tx.id,
                            tx.cleanedMerchant,
                            e.target.value as CategoryId
                          )
                        }
                        className="text-xs rounded-btn pl-7 pr-7 py-1 border border-border-subtle bg-bg-card text-text-primary appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        {(Object.keys(CATEGORIES) as CategoryId[]).map((catId) => (
                          <option key={catId} value={catId} className="bg-bg-card text-text-primary">
                            {CATEGORIES[catId].label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-text-secondary absolute right-2 pointer-events-none" />
                    </div>

                    <span className="text-[11px] text-text-tertiary">
                      {tx.categorySource}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-subtle bg-bg-card">
            <span className="text-xs text-text-secondary tabular-nums">
              {cs.table.pageOf(currentPage, totalPages)}
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="gap-1 h-8 px-2 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{cs.table.paginationPrev}</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="gap-1 h-8 px-2 text-xs"
              >
                <span className="hidden sm:inline">{cs.table.paginationNext}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
