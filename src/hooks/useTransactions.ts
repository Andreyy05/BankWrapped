import { useState, useMemo, useEffect } from 'react';
import { Transaction, CategoryId, MonthPeriod } from '@/types';
import { computeInsights } from '@/services/insights';
import { cs } from '@/i18n/cs';
import { useDebounce } from './useDebounce';

export type SortField = 'date' | 'amount';
export type SortDirection = 'asc' | 'desc';

export function useTransactions(allTransactions: Transaction[]) {
  // 1. Extract distinct available periods from data
  const availablePeriods = useMemo<MonthPeriod[]>(() => {
    const periodMap = new Map<string, MonthPeriod>();

    for (const tx of allTransactions) {
      if (!tx.date || tx.date.length < 7) continue;
      const key = tx.date.slice(0, 7); // 'YYYY-MM'
      if (!periodMap.has(key)) {
        const [yearStr, monthStr] = key.split('-');
        const year = parseInt(yearStr || '2024', 10);
        const month = parseInt(monthStr || '1', 10);
        const monthName = cs.monthNamesNominative[month] || `Měsíc ${month}`;
        periodMap.set(key, {
          key,
          year,
          month,
          label: `${monthName} ${year}`,
        });
      }
    }

    // Sort newest period first
    return Array.from(periodMap.values()).sort((a, b) => b.key.localeCompare(a.key));
  }, [allTransactions]);

  // 2. Selected period state (default to newest period if available, otherwise 'all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Sync selected period when transactions change (e.g. after import)
  useEffect(() => {
    if (availablePeriods.length > 0) {
      const first = availablePeriods[0];
      if (first) {
        setSelectedPeriod(first.key);
      }
    } else {
      setSelectedPeriod('all');
    }
  }, [availablePeriods]);

  // 3. Transactions filtered by selected period
  const periodTransactions = useMemo(() => {
    if (selectedPeriod === 'all') return allTransactions;
    return allTransactions.filter((tx) => tx.date.startsWith(selectedPeriod));
  }, [allTransactions, selectedPeriod]);

  // 4. Compute insights for active period
  const insights = useMemo(
    () => computeInsights(periodTransactions),
    [periodTransactions]
  );

  // 5. Search & Category filtering
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 250);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');

  // 6. Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 7. Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return periodTransactions
      .filter((tx) => {
        const query = debouncedSearch.toLowerCase().trim();
        const matchesSearch =
          query === '' ||
          tx.cleanedMerchant.toLowerCase().includes(query) ||
          tx.rawMerchant.toLowerCase().includes(query) ||
          (tx.note && tx.note.toLowerCase().includes(query));

        const matchesCat =
          selectedCategory === 'all' || tx.category === selectedCategory;

        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const comp = a.date.localeCompare(b.date);
          return sortDirection === 'asc' ? comp : -comp;
        } else {
          // Amount sort (haléře)
          const comp = Math.abs(a.amountMinor) - Math.abs(b.amountMinor);
          return sortDirection === 'asc' ? comp : -comp;
        }
      });
  }, [periodTransactions, debouncedSearch, selectedCategory, sortField, sortDirection]);

  // 8. Pagination (20 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriod, debouncedSearch, selectedCategory, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  return {
    availablePeriods,
    selectedPeriod,
    setSelectedPeriod,
    periodTransactions,
    insights,
    // Filter controls
    searchInput,
    setSearchInput,
    selectedCategory,
    setSelectedCategory,
    // Sort controls
    sortField,
    sortDirection,
    toggleSort,
    // Pagination & Results
    filteredTransactions,
    paginatedTransactions,
    currentPage,
    setCurrentPage,
    totalPages,
    pageSize,
    totalCount: allTransactions.length,
    periodCount: periodTransactions.length,
  };
}

