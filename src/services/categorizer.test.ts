import { describe, it, expect } from 'vitest';
import {
  categorize,
  matchesKeyword,
  normalizeForMatching,
  reapplyRules,
} from './categorizer';
import { Transaction, UserCategoryRule } from '@/types';

describe('Categorizer module', () => {
  describe('normalizeForMatching', () => {
    it('lowercases, removes diacritics, and trims whitespace', () => {
      expect(normalizeForMatching('  Kavárna Na Rohu ☕  ')).toBe('kavarna na rohu ☕');
      expect(normalizeForMatching('Česká spořitelna')).toBe('ceska sporitelna');
      expect(normalizeForMatching('LÉKÁRNA DR. MAX')).toBe('lekarna dr. max');
    });
  });

  describe('matchesKeyword with word boundaries', () => {
    it('correctly matches isolated keywords with word boundaries', () => {
      expect(matchesKeyword('platba v albert potraviny', 'albert')).toBe(true);
      expect(matchesKeyword('albert', 'albert')).toBe(true);
      expect(matchesKeyword('nakup h&m brno', 'h&m')).toBe(true);
      expect(matchesKeyword('dr max lekarna', 'dr max')).toBe(true);
    });

    it('does NOT match substrings inside unrelated words (hm != pharmacy)', () => {
      // "hm" must not match inside "pharmacy"
      expect(matchesKeyword('central pharmacy', 'hm')).toBe(false);
      // "wolt" must not match inside "revolut"
      expect(matchesKeyword('revolut payment', 'wolt')).toBe(false);
      // "pre" must not match inside "express"
      expect(matchesKeyword('express transport', 'pre')).toBe(false);
    });
  });

  describe('categorize function and priorities', () => {
    it('categorizes built-in merchants into correct categories', () => {
      expect(categorize('Platba Albert 8214').category).toBe('groceries');
      expect(categorize('Billa supermarket').category).toBe('groceries');
      expect(categorize('Rohlik.cz nakup').category).toBe('groceries');

      expect(categorize('Wolt obed').category).toBe('dining');
      expect(categorize('Starbucks coffee').category).toBe('dining');
      expect(categorize('Kavarna v centru').category).toBe('dining');

      expect(categorize('DPP SMS jizdenka').category).toBe('transport');
      expect(categorize('Benzina cerpaci stanice').category).toBe('transport');
      expect(categorize('Ceske drahy Praha').category).toBe('transport');

      expect(categorize('Alza.cz elektronika').category).toBe('shopping');
      expect(categorize('IKEA nakup nabytku').category).toBe('shopping');

      expect(categorize('Lekarna Dr Max').category).toBe('health');
      expect(categorize('Benu lekarna').category).toBe('health');

      expect(categorize('Trvaly prikaz najem bytu').category).toBe('housing_utilities');
      expect(categorize('PRE distribuce elektriny').category).toBe('housing_utilities');

      expect(categorize('Mzda za minuly mesic').category).toBe('income');
      expect(categorize('Prevod na vlastni sporici ucet').category).toBe('transfer');
    });

    it('falls back to "other" for unknown merchants', () => {
      const result = categorize('Zahadny obchudek s.r.o.');
      expect(result.category).toBe('other');
      expect(result.source).toBe('fallback');
      expect(result.isSubscription).toBe(false);
    });

    it('flags subscription services', () => {
      const netflix = categorize('Netflix.com payment');
      expect(netflix.category).toBe('entertainment_subs');
      expect(netflix.isSubscription).toBe(true);

      const spotify = categorize('Spotify AB monthly');
      expect(spotify.category).toBe('entertainment_subs');
      expect(spotify.isSubscription).toBe(true);

      const apple = categorize('Apple.com/bill Ireland');
      expect(apple.category).toBe('entertainment_subs');
      expect(apple.isSubscription).toBe(true);
    });

    it('prioritizes user rules over built-in rules', () => {
      const userRules: UserCategoryRule[] = [
        {
          merchantKey: 'albert',
          categoryId: 'shopping', // User wants Albert categorized as shopping, not groceries
          createdAt: new Date().toISOString(),
        },
      ];

      const result = categorize('Platba v Albert Praha', userRules);
      expect(result.category).toBe('shopping');
      expect(result.source).toBe('rule_user');
    });
  });

  describe('reapplyRules', () => {
    it('recalculates categories on transactions and respects manual overrides', () => {
      const userRules: UserCategoryRule[] = [
        {
          merchantKey: 'kavarna',
          categoryId: 'entertainment_subs',
          createdAt: new Date().toISOString(),
        },
      ];

      const txList: Transaction[] = [
        {
          id: 'tx-1',
          date: '2024-10-01',
          amountMinor: -10000,
          currency: 'CZK',
          rawMerchant: 'Kavarna Misto',
          cleanedMerchant: 'Kavarna Misto',
          category: 'dining',
          categorySource: 'rule_builtin',
          isSubscription: false,
        },
        {
          id: 'tx-2',
          date: '2024-10-02',
          amountMinor: -5000,
          currency: 'CZK',
          rawMerchant: 'Kavarna Misto rano',
          cleanedMerchant: 'Kavarna Misto',
          category: 'other',
          categorySource: 'manual', // Explicitly manual
          isSubscription: false,
        },
      ];

      const updated = reapplyRules(txList, userRules);
      // tx-1 updated to user rule
      expect(updated[0]?.category).toBe('entertainment_subs');
      expect(updated[0]?.categorySource).toBe('rule_user');

      // tx-2 preserved manual category
      expect(updated[1]?.category).toBe('other');
      expect(updated[1]?.categorySource).toBe('manual');
    });
  });
});

