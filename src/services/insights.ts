import {
  ExpensiveDayInfo,
  InsightMetric,
  InsightsResult,
  SubscriptionGroup,
  TopMerchant,
  Transaction,
  WeekendWeekdayAnalysis,
} from '@/types';
import { cs, formatCurrencyCzk } from '@/i18n/cs';

export interface ComputeInsightsOptions {
  latteThresholdMinor?: number; // Default 15 000 haléřů (150 Kč)
  mainCurrency?: string;
}

/**
 * Parses YYYY-MM-DD string into day of week index (0 = Sunday, 1 = Monday, ... 6 = Saturday)
 * using local components to avoid timezone skew.
 */
export function getDayOfWeekFromIso(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return 0;
  // Months are 0-indexed in JS Date constructor: year, monthIndex, day
  return new Date(y, m - 1, d).getDay();
}

/**
 * Pure function: Computes comprehensive fintech insights for given transactions.
 * Excludes transfers and non-main currencies.
 */
export function computeInsights(
  transactions: Transaction[],
  options: ComputeInsightsOptions = {}
): InsightsResult {
  const { latteThresholdMinor = 15000, mainCurrency } = options;

  // 1. Identify primary currency if not explicitly provided
  let effectiveCurrency = mainCurrency;
  if (!effectiveCurrency) {
    const currencyCounts: Record<string, number> = {};
    for (const tx of transactions) {
      currencyCounts[tx.currency] = (currencyCounts[tx.currency] || 0) + 1;
    }
    const sorted = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1]);
    effectiveCurrency = sorted[0]?.[0] || 'CZK';
  }

  // 2. Filter to active currency and exclude transfers
  const validTx = transactions.filter(
    (tx) => tx.currency === effectiveCurrency && tx.category !== 'transfer'
  );

  // 3. Compute KPI: Total Expenses, Incomes, Refunds
  let rawExpensesMinor = 0;
  let rawRefundsMinor = 0;
  let totalIncomeMinor = 0;

  for (const tx of validTx) {
    if (tx.amountMinor < 0) {
      rawExpensesMinor += Math.abs(tx.amountMinor);
    } else {
      if (tx.category === 'income') {
        totalIncomeMinor += tx.amountMinor;
      } else {
        // Refund: positive amount on a non-income category reduces expense
        rawRefundsMinor += tx.amountMinor;
      }
    }
  }

  // Net expenses accounting for refunds (capped at 0)
  const totalExpenseMinor = Math.max(0, rawExpensesMinor - rawRefundsMinor);
  const netBalanceMinor = totalIncomeMinor - totalExpenseMinor;
  const savingsRatePercentage =
    totalIncomeMinor > 0
      ? Math.max(0, Math.round((netBalanceMinor / totalIncomeMinor) * 100))
      : 0;

  // 4. Most Expensive Day
  const dailyExpenses: Record<string, { totalMinor: number; topTx: Transaction | null }> = {};
  for (const tx of validTx) {
    if (tx.amountMinor < 0) {
      const exp = Math.abs(tx.amountMinor);
      const existing = dailyExpenses[tx.date] || { totalMinor: 0, topTx: null };
      existing.totalMinor += exp;
      if (!existing.topTx || Math.abs(tx.amountMinor) > Math.abs(existing.topTx.amountMinor)) {
        existing.topTx = tx;
      }
      dailyExpenses[tx.date] = existing;
    } else if (tx.category !== 'income') {
      // Deduct refund from daily expense
      const existing = dailyExpenses[tx.date];
      if (existing) {
        existing.totalMinor = Math.max(0, existing.totalMinor - tx.amountMinor);
      }
    }
  }

  const sortedDays = Object.entries(dailyExpenses)
    .filter(([_, data]) => data.totalMinor > 0)
    .sort((a, b) => b[1].totalMinor - a[1].totalMinor);

  let expensiveDay: ExpensiveDayInfo | null = null;
  const topDayEntry = sortedDays[0];
  if (topDayEntry) {
    expensiveDay = {
      date: topDayEntry[0],
      totalExpenseMinor: topDayEntry[1].totalMinor,
      topTransaction: topDayEntry[1].topTx,
    };
  }

  // 5. Top Merchants (Count & Spend)
  const merchantStats: Record<string, { count: number; totalMinor: number }> = {};
  for (const tx of validTx) {
    if (tx.category === 'income') continue;

    const m = tx.cleanedMerchant || tx.rawMerchant || 'Neznámý obchodník';
    const current = merchantStats[m] || { count: 0, totalMinor: 0 };

    if (tx.amountMinor < 0) {
      current.count += 1;
      current.totalMinor += Math.abs(tx.amountMinor);
    } else {
      // Refund reduces merchant spend
      current.totalMinor = Math.max(0, current.totalMinor - tx.amountMinor);
    }
    merchantStats[m] = current;
  }

  const merchantList: TopMerchant[] = Object.entries(merchantStats)
    .filter(([_, stats]) => stats.totalMinor > 0 || stats.count > 0)
    .map(([merchant, stats]) => ({
      merchant,
      count: stats.count,
      totalMinor: stats.totalMinor,
    }));

  const topMerchantsByCount = [...merchantList]
    .sort((a, b) => b.count - a.count || b.totalMinor - a.totalMinor)
    .slice(0, 3);

  const topMerchantsByAmount = [...merchantList]
    .filter((m) => m.totalMinor > 0)
    .sort((a, b) => b.totalMinor - a.totalMinor || b.count - a.count)
    .slice(0, 3);

  // 6. Latte Factor (Small frequent purchases under threshold)
  let latteCount = 0;
  let latteTotalMinor = 0;

  for (const tx of validTx) {
    if (tx.amountMinor < 0 && Math.abs(tx.amountMinor) < latteThresholdMinor) {
      latteCount += 1;
      latteTotalMinor += Math.abs(tx.amountMinor);
    }
  }

  const lattePercentage =
    totalExpenseMinor > 0
      ? Math.round((latteTotalMinor / totalExpenseMinor) * 1000) / 10
      : 0;

  // 7. Subscriptions
  const subscriptionMerchants: Record<string, { count: number; lastAmountMinor: number }> = {};
  for (const tx of validTx) {
    if (tx.isSubscription) {
      if (tx.amountMinor < 0) {
        const m = tx.cleanedMerchant || tx.rawMerchant;
        const current = subscriptionMerchants[m] || { count: 0, lastAmountMinor: 0 };
        current.count += 1;
        current.lastAmountMinor = Math.abs(tx.amountMinor);
        subscriptionMerchants[m] = current;
      }
    }
  }

  const subscriptionItems: SubscriptionGroup[] = Object.entries(subscriptionMerchants).map(
    ([merchant, data]) => ({
      merchant,
      monthlyAmountMinor: data.lastAmountMinor,
      yearlyAmountMinor: data.lastAmountMinor * 12,
      transactionCount: data.count,
    })
  );

  const subscriptionsMonthlyTotalMinor = subscriptionItems.reduce(
    (sum, item) => sum + item.monthlyAmountMinor,
    0
  );
  const subscriptionsYearlyTotalMinor = subscriptionsMonthlyTotalMinor * 12;

  // 8. Weekend vs. Weekday Analysis
  let weekendExpenseMinor = 0;
  let weekdayExpenseMinor = 0;
  const weekendDates = new Set<string>();
  const weekdayDates = new Set<string>();

  for (const tx of validTx) {
    if (tx.amountMinor < 0) {
      const exp = Math.abs(tx.amountMinor);
      const dayOfWeek = getDayOfWeekFromIso(tx.date);
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendExpenseMinor += exp;
        weekendDates.add(tx.date);
      } else {
        weekdayExpenseMinor += exp;
        weekdayDates.add(tx.date);
      }
    }
  }

  const totalSplitExpense = weekendExpenseMinor + weekdayExpenseMinor;
  const weekendPercentage =
    totalSplitExpense > 0 ? (weekendExpenseMinor / totalSplitExpense) * 100 : 0;
  const weekdayPercentage =
    totalSplitExpense > 0 ? (weekdayExpenseMinor / totalSplitExpense) * 100 : 0;

  const weekendCount = Math.max(1, weekendDates.size);
  const weekdayCount = Math.max(1, weekdayDates.size);

  const weekendDailyAverageMinor =
    weekendDates.size > 0 ? Math.round(weekendExpenseMinor / weekendCount) : 0;
  const weekdayDailyAverageMinor =
    weekdayDates.size > 0 ? Math.round(weekdayExpenseMinor / weekdayCount) : 0;

  const weekendVsWeekday: WeekendWeekdayAnalysis = {
    weekendExpenseMinor,
    weekdayExpenseMinor,
    weekendPercentage: Math.round(weekendPercentage * 10) / 10,
    weekdayPercentage: Math.round(weekdayPercentage * 10) / 10,
    weekendDailyAverageMinor,
    weekdayDailyAverageMinor,
  };

  // 9. Largest single expense
  let maxSingleExpense: Transaction | null = null;
  for (const tx of validTx) {
    if (tx.amountMinor < 0) {
      if (!maxSingleExpense || Math.abs(tx.amountMinor) > Math.abs(maxSingleExpense.amountMinor)) {
        maxSingleExpense = tx;
      }
    }
  }

  // 10. Most active day of week (by transaction volume)
  const dayOfWeekCounts: Record<number, { count: number; totalMinor: number }> = {};
  for (const tx of validTx) {
    const day = getDayOfWeekFromIso(tx.date);
    const curr = dayOfWeekCounts[day] || { count: 0, totalMinor: 0 };
    curr.count += 1;
    curr.totalMinor += Math.abs(tx.amountMinor);
    dayOfWeekCounts[day] = curr;
  }

  const sortedDaysOfWeek = Object.entries(dayOfWeekCounts).sort(
    (a, b) => b[1].count - a[1].count
  );

  let mostActiveDayOfWeek: InsightsResult['mostActiveDayOfWeek'] = null;
  const topDayOfWeek = sortedDaysOfWeek[0];
  if (topDayOfWeek && topDayOfWeek[1].count > 0) {
    const dayIdx = Number(topDayOfWeek[0]);
    mostActiveDayOfWeek = {
      dayIndex: dayIdx,
      dayName: cs.daysOfWeek[dayIdx] || `den ${dayIdx}`,
      transactionCount: topDayOfWeek[1].count,
      totalMinor: topDayOfWeek[1].totalMinor,
    };
  }

  // 11. Generate Generic Insight Cards for UI
  const cards: InsightMetric[] = [];

  // Card: Expensive day
  if (expensiveDay) {
    const [y, m, d] = expensiveDay.date.split('-');
    const formattedDate = `${parseInt(d || '1')}. ${parseInt(m || '1')}. ${y}`;
    cards.push({
      id: 'expensive_day',
      titleKey: cs.insights.expensiveDay.title,
      value: formatCurrencyCzk(expensiveDay.totalExpenseMinor),
      detail: cs.insights.expensiveDay.detail(
        formattedDate,
        formatCurrencyCzk(expensiveDay.totalExpenseMinor),
        expensiveDay.topTransaction?.cleanedMerchant
      ),
      icon: 'Calendar',
    });
  }

  // Card: Top merchant by frequency
  if (topMerchantsByCount[0]) {
    const topFreq = topMerchantsByCount[0];
    cards.push({
      id: 'top_merchant_count',
      titleKey: cs.insights.topMerchantsCount.title,
      value: topFreq.merchant,
      detail: cs.insights.topMerchantsCount.detail(topFreq.merchant, topFreq.count),
      icon: 'ShoppingBag',
    });
  }

  // Card: Top merchant by amount
  if (topMerchantsByAmount[0]) {
    const topAmount = topMerchantsByAmount[0];
    cards.push({
      id: 'top_merchant_amount',
      titleKey: cs.insights.topMerchantsAmount.title,
      value: formatCurrencyCzk(topAmount.totalMinor),
      detail: cs.insights.topMerchantsAmount.detail(
        topAmount.merchant,
        formatCurrencyCzk(topAmount.totalMinor)
      ),
      icon: 'CreditCard',
    });
  }

  // Card: Latte Factor
  if (latteCount > 0) {
    cards.push({
      id: 'latte_factor',
      titleKey: cs.insights.latteFactor.title,
      value: formatCurrencyCzk(latteTotalMinor),
      detail: cs.insights.latteFactor.detail(
        latteCount,
        formatCurrencyCzk(latteTotalMinor),
        `${lattePercentage.toFixed(1)} %`
      ),
      icon: 'Coffee',
    });
  }

  // Card: Subscriptions
  if (subscriptionItems.length > 0) {
    cards.push({
      id: 'subscriptions',
      titleKey: cs.insights.subscriptions.title,
      value: `${formatCurrencyCzk(subscriptionsMonthlyTotalMinor)} / měsíc`,
      detail: cs.insights.subscriptions.detail(
        subscriptionItems.length,
        formatCurrencyCzk(subscriptionsMonthlyTotalMinor),
        formatCurrencyCzk(subscriptionsYearlyTotalMinor)
      ),
      icon: 'Repeat',
    });
  }

  // Card: Weekend vs Weekday
  if (totalSplitExpense > 0) {
    cards.push({
      id: 'weekend_vs_weekday',
      titleKey: cs.insights.weekendVsWeekday.title,
      value: `${weekendVsWeekday.weekendPercentage.toFixed(0)} % víkend`,
      detail: cs.insights.weekendVsWeekday.detail(
        weekendVsWeekday.weekendPercentage,
        formatCurrencyCzk(weekendVsWeekday.weekendDailyAverageMinor),
        formatCurrencyCzk(weekendVsWeekday.weekdayDailyAverageMinor)
      ),
      icon: 'Sun',
    });
  }

  // Card: Max single expense
  if (maxSingleExpense) {
    const [y, m, d] = maxSingleExpense.date.split('-');
    const formattedDate = `${parseInt(d || '1')}. ${parseInt(m || '1')}. ${y}`;
    cards.push({
      id: 'max_single_expense',
      titleKey: cs.insights.maxSingleExpense.title,
      value: formatCurrencyCzk(Math.abs(maxSingleExpense.amountMinor)),
      detail: cs.insights.maxSingleExpense.detail(
        maxSingleExpense.cleanedMerchant,
        formatCurrencyCzk(Math.abs(maxSingleExpense.amountMinor)),
        formattedDate
      ),
      icon: 'TrendingDown',
    });
  }

  // Card: Most active day of week
  if (mostActiveDayOfWeek) {
    cards.push({
      id: 'most_active_day',
      titleKey: cs.insights.mostActiveDay.title,
      value: mostActiveDayOfWeek.dayName.toUpperCase(),
      detail: cs.insights.mostActiveDay.detail(
        mostActiveDayOfWeek.dayName,
        mostActiveDayOfWeek.transactionCount
      ),
      icon: 'Activity',
    });
  }

  return {
    totalExpenseMinor,
    totalIncomeMinor,
    netBalanceMinor,
    savingsRatePercentage,
    expensiveDay,
    topMerchantsByCount,
    topMerchantsByAmount,
    latteFactor: {
      totalMinor: latteTotalMinor,
      count: latteCount,
      percentageOfExpense: lattePercentage,
      thresholdMinor: latteThresholdMinor,
    },
    subscriptions: {
      items: subscriptionItems,
      monthlyTotalMinor: subscriptionsMonthlyTotalMinor,
      yearlyTotalMinor: subscriptionsYearlyTotalMinor,
    },
    weekendVsWeekday,
    maxSingleExpense,
    mostActiveDayOfWeek,
    cards,
  };
}
