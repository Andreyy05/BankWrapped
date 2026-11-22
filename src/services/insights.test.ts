import { describe, it, expect } from 'vitest';
import { computeInsights } from './insights';
import { DEMO_TRANSACTIONS } from '@/data/demoData';
import { Transaction } from '@/types';

describe('Insights engine (src/services/insights.ts)', () => {
  describe('Full dataset analysis (DEMO_TRANSACTIONS)', () => {
    it('computes realistic KPI metrics', () => {
      const insights = computeInsights(DEMO_TRANSACTIONS);

      expect(insights.totalIncomeMinor).toBe(6250000); // 62 500 Kč salary
      expect(insights.totalExpenseMinor).toBeGreaterThan(4000000); // > 40 000 Kč expenses
      expect(insights.netBalanceMinor).toBeGreaterThan(0); // Positive net balance
      expect(insights.savingsRatePercentage).toBeGreaterThan(0);
      expect(insights.savingsRatePercentage).toBeLessThan(100);
    });

    it('identifies 2024-10-05 as the most expensive day', () => {
      const insights = computeInsights(DEMO_TRANSACTIONS);

      expect(insights.expensiveDay).not.toBeNull();
      expect(insights.expensiveDay?.date).toBe('2024-10-05');
      // Rent 23 500 + Alza 13 990 = 37 490 Kč (3 749 000 haléřů)
      expect(insights.expensiveDay?.totalExpenseMinor).toBe(3749000);
      expect(insights.expensiveDay?.topTransaction?.amountMinor).toBe(-2350000);
    });

    it('ranks top merchants by count and amount', () => {
      const insights = computeInsights(DEMO_TRANSACTIONS);

      expect(insights.topMerchantsByCount.length).toBe(3);
      expect(insights.topMerchantsByAmount.length).toBe(3);

      // Pronájem or Alza should be top by amount
      const topAmountMerchant = insights.topMerchantsByAmount[0];
      expect(topAmountMerchant).toBeDefined();
      expect(['Pronájem bytu', 'Alza.cz']).toContain(topAmountMerchant?.merchant);

      // Merchants with multiple coffee/groceries visits
      const topCountMerchant = insights.topMerchantsByCount[0];
      expect(topCountMerchant).toBeDefined();
      expect(topCountMerchant?.count).toBeGreaterThanOrEqual(3);
    });

    it('computes Latte Factor correctly (> 15 small purchases < 150 Kč)', () => {
      const insights = computeInsights(DEMO_TRANSACTIONS);

      expect(insights.latteFactor.count).toBeGreaterThanOrEqual(15);
      expect(insights.latteFactor.totalMinor).toBeGreaterThan(0);
      expect(insights.latteFactor.percentageOfExpense).toBeGreaterThan(0);
      expect(insights.latteFactor.percentageOfExpense).toBeLessThan(50);
    });

    it('aggregates recurring subscriptions (Netflix, Spotify, iCloud)', () => {
      const insights = computeInsights(DEMO_TRANSACTIONS);

      expect(insights.subscriptions.items.length).toBe(3);
      // 379 Kč + 169 Kč + 79 Kč = 627 Kč = 62 700 haléřů
      expect(insights.subscriptions.monthlyTotalMinor).toBe(62700);
      expect(insights.subscriptions.yearlyTotalMinor).toBe(62700 * 12);
    });

    it('computes weekend vs. weekday spending and daily averages', () => {
      const insights = computeInsights(DEMO_TRANSACTIONS);

      expect(insights.weekendVsWeekday.weekendExpenseMinor).toBeGreaterThan(0);
      expect(insights.weekendVsWeekday.weekdayExpenseMinor).toBeGreaterThan(0);
      expect(insights.weekendVsWeekday.weekendPercentage + insights.weekendVsWeekday.weekdayPercentage).toBeCloseTo(100, 0);
      expect(insights.weekendVsWeekday.weekendDailyAverageMinor).toBeGreaterThan(0);
      expect(insights.weekendVsWeekday.weekdayDailyAverageMinor).toBeGreaterThan(0);
    });

    it('finds largest single expense and most active day of week', () => {
      const insights = computeInsights(DEMO_TRANSACTIONS);

      expect(insights.maxSingleExpense).not.toBeNull();
      expect(insights.maxSingleExpense?.amountMinor).toBe(-2350000); // 23 500 Kč rent
      expect(insights.mostActiveDayOfWeek).not.toBeNull();
      expect(insights.mostActiveDayOfWeek?.transactionCount).toBeGreaterThan(0);
    });

    it('generates generic cards formatted with Czech text and icons', () => {
      const insights = computeInsights(DEMO_TRANSACTIONS);

      expect(insights.cards.length).toBeGreaterThanOrEqual(6);
      const cardIds = insights.cards.map((c) => c.id);
      expect(cardIds).toContain('expensive_day');
      expect(cardIds).toContain('latte_factor');
      expect(cardIds).toContain('subscriptions');
      expect(cardIds).toContain('weekend_vs_weekday');
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('handles empty month (0 transactions) gracefully without crashing', () => {
      const insights = computeInsights([]);

      expect(insights.totalExpenseMinor).toBe(0);
      expect(insights.totalIncomeMinor).toBe(0);
      expect(insights.netBalanceMinor).toBe(0);
      expect(insights.savingsRatePercentage).toBe(0);
      expect(insights.expensiveDay).toBeNull();
      expect(insights.topMerchantsByCount).toEqual([]);
      expect(insights.topMerchantsByAmount).toEqual([]);
      expect(insights.latteFactor.count).toBe(0);
      expect(insights.latteFactor.totalMinor).toBe(0);
      expect(insights.latteFactor.percentageOfExpense).toBe(0);
      expect(insights.subscriptions.items).toEqual([]);
      expect(insights.maxSingleExpense).toBeNull();
      expect(insights.mostActiveDayOfWeek).toBeNull();
      expect(insights.cards).toEqual([]);
    });

    it('handles month with only a single expense transaction', () => {
      const singleExpense: Transaction[] = [
        {
          id: 'tx-1',
          date: '2024-10-15',
          amountMinor: -45000, // 450 Kč
          currency: 'CZK',
          rawMerchant: 'Billa supermarket',
          cleanedMerchant: 'Billa',
          category: 'groceries',
          categorySource: 'rule_builtin',
          isSubscription: false,
        },
      ];

      const insights = computeInsights(singleExpense);

      expect(insights.totalExpenseMinor).toBe(45000);
      expect(insights.totalIncomeMinor).toBe(0);
      expect(insights.netBalanceMinor).toBe(-45000);
      expect(insights.savingsRatePercentage).toBe(0);
      expect(insights.expensiveDay?.date).toBe('2024-10-15');
      expect(insights.expensiveDay?.totalExpenseMinor).toBe(45000);
      expect(insights.topMerchantsByAmount[0]?.merchant).toBe('Billa');
      expect(insights.maxSingleExpense?.id).toBe('tx-1');
    });

    it('handles month with only income transactions', () => {
      const onlyIncomes: Transaction[] = [
        {
          id: 'tx-income-1',
          date: '2024-10-10',
          amountMinor: 5000000, // 50 000 Kč
          currency: 'CZK',
          rawMerchant: 'Mzda',
          cleanedMerchant: 'Mzda',
          category: 'income',
          categorySource: 'rule_builtin',
          isSubscription: false,
        },
      ];

      const insights = computeInsights(onlyIncomes);

      expect(insights.totalExpenseMinor).toBe(0);
      expect(insights.totalIncomeMinor).toBe(5000000);
      expect(insights.netBalanceMinor).toBe(5000000);
      expect(insights.savingsRatePercentage).toBe(100); // 100% savings rate
      expect(insights.expensiveDay).toBeNull();
      expect(insights.topMerchantsByAmount).toEqual([]);
      expect(insights.maxSingleExpense).toBeNull();
    });

    it('ignores own transfers completely', () => {
      const txWithTransfer: Transaction[] = [
        {
          id: 'tx-exp',
          date: '2024-10-01',
          amountMinor: -100000, // 1 000 Kč expense
          currency: 'CZK',
          rawMerchant: 'Restaurace',
          cleanedMerchant: 'Restaurace',
          category: 'dining',
          categorySource: 'rule_builtin',
          isSubscription: false,
        },
        {
          id: 'tx-transfer',
          date: '2024-10-02',
          amountMinor: -5000000, // 50 000 Kč transfer to own savings account
          currency: 'CZK',
          rawMerchant: 'Prevod na sporici ucet',
          cleanedMerchant: 'Prevod',
          category: 'transfer',
          categorySource: 'rule_builtin',
          isSubscription: false,
        },
      ];

      const insights = computeInsights(txWithTransfer);

      // 50 000 Kč transfer must NOT be included in expenses
      expect(insights.totalExpenseMinor).toBe(100000);
      expect(insights.expensiveDay?.date).toBe('2024-10-01');
      expect(insights.expensiveDay?.totalExpenseMinor).toBe(100000);
    });

    it('subtracts merchant refunds from expenses and merchant totals', () => {
      const txWithRefund: Transaction[] = [
        {
          id: 'tx-buy',
          date: '2024-10-01',
          amountMinor: -200000, // 2 000 Kč purchase at Zara
          currency: 'CZK',
          rawMerchant: 'Zara nakup',
          cleanedMerchant: 'Zara',
          category: 'shopping',
          categorySource: 'rule_builtin',
          isSubscription: false,
        },
        {
          id: 'tx-refund',
          date: '2024-10-05',
          amountMinor: 50000, // +500 Kč refund at Zara
          currency: 'CZK',
          rawMerchant: 'Zara refund',
          cleanedMerchant: 'Zara',
          category: 'shopping',
          categorySource: 'rule_builtin',
          isSubscription: false,
        },
      ];

      const insights = computeInsights(txWithRefund);

      // Refund of 500 Kč reduces 2000 Kč expense to 1500 Kč
      expect(insights.totalExpenseMinor).toBe(150000);
      expect(insights.totalIncomeMinor).toBe(0); // Refund is NOT income
      expect(insights.topMerchantsByAmount[0]?.totalMinor).toBe(150000);
    });

    it('filters out foreign currencies when computing primary metrics', () => {
      const multiCurrency: Transaction[] = [
        {
          id: 'tx-czk',
          date: '2024-10-01',
          amountMinor: -10000, // 100 CZK
          currency: 'CZK',
          rawMerchant: 'Albert',
          cleanedMerchant: 'Albert',
          category: 'groceries',
          categorySource: 'rule_builtin',
          isSubscription: false,
        },
        {
          id: 'tx-eur',
          date: '2024-10-02',
          amountMinor: -50000, // 500 EUR (should be excluded)
          currency: 'EUR',
          rawMerchant: 'Berlin Hotel',
          cleanedMerchant: 'Berlin Hotel',
          category: 'housing_utilities',
          categorySource: 'rule_builtin',
          isSubscription: false,
        },
      ];

      const insights = computeInsights(multiCurrency, { mainCurrency: 'CZK' });

      expect(insights.totalExpenseMinor).toBe(10000);
      expect(insights.topMerchantsByAmount.length).toBe(1);
      expect(insights.topMerchantsByAmount[0]?.merchant).toBe('Albert');
    });

    it('returns zero expense and income when all transactions are transfers', () => {
      const allTransfers: Transaction[] = [
        {
          id: 'tx-t1',
          date: '2024-10-01',
          amountMinor: -500000,
          currency: 'CZK',
          rawMerchant: 'Převod mezi účty',
          cleanedMerchant: 'Převod mezi účty',
          category: 'transfer',
          categorySource: 'rule_builtin',
          isSubscription: false,
        },
        {
          id: 'tx-t2',
          date: '2024-10-01',
          amountMinor: 500000,
          currency: 'CZK',
          rawMerchant: 'Převod na spořicí účet',
          cleanedMerchant: 'Převod na spořicí účet',
          category: 'transfer',
          categorySource: 'rule_builtin',
          isSubscription: false,
        },
      ];

      const insights = computeInsights(allTransfers);
      expect(insights.totalExpenseMinor).toBe(0);
      expect(insights.totalIncomeMinor).toBe(0);
      expect(insights.netBalanceMinor).toBe(0);
      expect(insights.expensiveDay).toBeNull();
    });
  });
});

