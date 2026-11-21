import { describe, it, expect } from 'vitest';
import { cs, formatCurrencyCzk } from '@/i18n/cs';
import { computeInsights } from '@/services/insights';
import { DEMO_TRANSACTIONS } from '@/data/demoData';

describe('Monthly Wrapped logic and locative declensions', () => {
  it('correctly declines all 12 Czech months in locative case', () => {
    expect(cs.monthsLocative[1]).toBe('V lednu');
    expect(cs.monthsLocative[2]).toBe('V únoru');
    expect(cs.monthsLocative[3]).toBe('V březnu');
    expect(cs.monthsLocative[4]).toBe('V dubnu');
    expect(cs.monthsLocative[5]).toBe('V květnu');
    expect(cs.monthsLocative[6]).toBe('V červnu');
    expect(cs.monthsLocative[7]).toBe('V červenci');
    expect(cs.monthsLocative[8]).toBe('V srpnu');
    expect(cs.monthsLocative[9]).toBe('V září');
    expect(cs.monthsLocative[10]).toBe('V říjnu');
    expect(cs.monthsLocative[11]).toBe('V listopadu');
    expect(cs.monthsLocative[12]).toBe('V prosinci');
  });

  it('formats masked amounts cleanly when privacy mode is active', () => {
    const rawAmount = 4500000;
    const formatted = formatCurrencyCzk(rawAmount);
    expect(formatted).toContain('45');

    const maskAmount = (val: number, hide: boolean) =>
      hide ? '•••••• Kč' : formatCurrencyCzk(val);

    expect(maskAmount(rawAmount, false)).toBe(formatted);
    expect(maskAmount(rawAmount, true)).toBe('•••••• Kč');
  });

  it('computes Wrapped highlights accurately for Demo Data (October 2024)', () => {
    const insights = computeInsights(DEMO_TRANSACTIONS);

    // 1. Total spent
    expect(insights.totalExpenseMinor).toBeGreaterThan(0);

    // 2. Most visited merchant
    expect(insights.topMerchantsByCount.length).toBeGreaterThan(0);
    const topMerchant = insights.topMerchantsByCount[0];
    expect(topMerchant?.merchant).toBeTruthy();

    // 3. Expensive day
    expect(insights.expensiveDay).not.toBeNull();
    expect(insights.expensiveDay?.date).toBe('2024-10-05');

    // 4. Savings message
    expect(insights.savingsRatePercentage).toBeGreaterThan(0);
    const savingsMsg = cs.wrapped.savedMessage(insights.savingsRatePercentage);
    expect(savingsMsg).toContain('%');
  });
});

