import { describe, it, expect } from 'vitest';
import { DEMO_TRANSACTIONS } from './demoData';

describe('DEMO_TRANSACTIONS specifications', () => {
  it('contains at least 60 transactions for one month in CZK', () => {
    expect(DEMO_TRANSACTIONS.length).toBeGreaterThanOrEqual(60);
    const nonCzk = DEMO_TRANSACTIONS.filter((tx) => tx.currency !== 'CZK');
    expect(nonCzk.length).toBe(0);

    const dates = DEMO_TRANSACTIONS.map((tx) => tx.date);
    expect(dates.every((d) => d.startsWith('2024-10-'))).toBe(true);
  });

  it('contains a salary (výplata) and at least one transfer between own accounts', () => {
    const salary = DEMO_TRANSACTIONS.find(
      (tx) => tx.category === 'income' && tx.amountMinor > 0
    );
    expect(salary).toBeDefined();
    expect(salary?.amountMinor).toBeGreaterThan(5000000); // > 50 000 CZK

    const transfer = DEMO_TRANSACTIONS.find((tx) => tx.category === 'transfer');
    expect(transfer).toBeDefined();
  });

  it('contains 3 subscriptions (Netflix, Spotify, iCloud)', () => {
    const subscriptions = DEMO_TRANSACTIONS.filter((tx) => tx.isSubscription);
    expect(subscriptions.length).toBeGreaterThanOrEqual(3);

    const merchants = subscriptions.map((tx) => tx.cleanedMerchant.toLowerCase());
    expect(merchants.some((m) => m.includes('netflix'))).toBe(true);
    expect(merchants.some((m) => m.includes('spotify'))).toBe(true);
    expect(merchants.some((m) => m.includes('icloud') || m.includes('apple'))).toBe(true);
  });

  it('contains at least 15 payments under 150 CZK (< 15 000 minor units)', () => {
    const under150 = DEMO_TRANSACTIONS.filter(
      (tx) => tx.amountMinor < 0 && Math.abs(tx.amountMinor) < 15000
    );
    expect(under150.length).toBeGreaterThanOrEqual(15);
  });

  it('contains one refund (positive amount at a merchant)', () => {
    const refund = DEMO_TRANSACTIONS.find(
      (tx) => tx.amountMinor > 0 && tx.category !== 'income' && tx.category !== 'transfer'
    );
    expect(refund).toBeDefined();
    expect(refund?.cleanedMerchant).toBe('Zara');
  });

  it('contains one significantly most expensive day', () => {
    const dailyTotals: Record<string, number> = {};
    for (const tx of DEMO_TRANSACTIONS) {
      if (tx.category === 'transfer') continue;
      if (tx.amountMinor < 0) {
        dailyTotals[tx.date] = (dailyTotals[tx.date] || 0) + Math.abs(tx.amountMinor);
      }
    }

    const sortedDays = Object.entries(dailyTotals).sort((a, b) => b[1] - a[1]);
    const [topDay, secondDay] = sortedDays;

    expect(topDay).toBeDefined();
    expect(secondDay).toBeDefined();
    // 2024-10-05 should be the most expensive day (> 30 000 CZK)
    expect(topDay?.[0]).toBe('2024-10-05');
    expect(topDay?.[1]).toBeGreaterThan(3000000);
    // Should be significantly higher than the 2nd most expensive day
    expect((topDay?.[1] ?? 0) / (secondDay?.[1] ?? 1)).toBeGreaterThan(5);
  });

  it('has a reasonable mix of weekends and weekdays', () => {
    let weekendCount = 0;
    let weekdayCount = 0;

    for (const tx of DEMO_TRANSACTIONS) {
      const day = new Date(tx.date).getDay();
      if (day === 0 || day === 6) {
        weekendCount++;
      } else {
        weekdayCount++;
      }
    }

    expect(weekendCount).toBeGreaterThan(10);
    expect(weekdayCount).toBeGreaterThan(25);
  });
});

