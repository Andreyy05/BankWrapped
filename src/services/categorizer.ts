import { CategoryId, CategorySource, Transaction, UserCategoryRule } from '@/types';
import { BUILTIN_CATEGORY_KEYWORDS } from '@/data/categories';

/**
 * Normalizes string for keyword matching: converts to lowercase,
 * strips diacritics (accents), and trims whitespace.
 */
export function normalizeForMatching(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Checks if a normalized keyword exists as a distinct word or term within normalized text.
 * Uses unicode-safe non-alphanumeric boundaries instead of standard \b to correctly
 * support keywords with symbols like 'h&m', 'dr max', 'rohlik.cz', or 'apple.com/bill'.
 */
export function matchesKeyword(normalizedText: string, keyword: string): boolean {
  const normKw = normalizeForMatching(keyword);
  if (!normKw || !normalizedText) return false;

  // Escape special regex characters in the keyword
  const escapedKw = normKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Require boundary before and after (start/end of string or non-alphanumeric character)
  const pattern = new RegExp(`(^|[^a-z0-9])${escapedKw}($|[^a-z0-9])`, 'i');
  return pattern.test(normalizedText);
}

export interface CategorizeResult {
  category: CategoryId;
  source: CategorySource;
  isSubscription: boolean;
}

const KNOWN_SUBSCRIPTION_KEYWORDS = [
  'netflix',
  'spotify',
  'apple.com/bill',
  'icloud',
  'google storage',
  'google one',
  'youtube premium',
  'hbo',
  'disney',
  'steam',
  'playstation',
  'chatgpt',
  'duolingo',
];

/**
 * Determines whether a transaction is likely a recurring subscription.
 * Checks against known subscription services (Netflix, Spotify, Apple, Google, HBO, etc.).
 */
export function isLikelySubscription(normalizedText: string): boolean {
  return KNOWN_SUBSCRIPTION_KEYWORDS.some((kw) => matchesKeyword(normalizedText, kw));
}

/**
 * Categorizes a transaction based on merchant and description text.
 * Priority: User rule > Built-in rule > Fallback ('other').
 */
export function categorize(
  merchantText: string,
  userRules: UserCategoryRule[] = []
): CategorizeResult {
  const normalized = normalizeForMatching(merchantText);

  // 1. User rules take highest priority
  for (const rule of userRules) {
    const normRuleKey = normalizeForMatching(rule.merchantKey);
    if (normRuleKey && matchesKeyword(normalized, normRuleKey)) {
      const isSub = isLikelySubscription(normalized);
      return {
        category: rule.categoryId,
        source: 'rule_user',
        isSubscription: isSub,
      };
    }
  }

  // 2. Built-in category rules
  const categoryKeys = Object.keys(BUILTIN_CATEGORY_KEYWORDS) as CategoryId[];
  for (const catId of categoryKeys) {
    if (catId === 'other') continue;
    const keywords = BUILTIN_CATEGORY_KEYWORDS[catId];
    for (const kw of keywords) {
      if (matchesKeyword(normalized, kw)) {
        const isSub = isLikelySubscription(normalized);
        return {
          category: catId,
          source: 'rule_builtin',
          isSubscription: isSub,
        };
      }
    }
  }

  // 3. Fallback
  return {
    category: 'other',
    source: 'fallback',
    isSubscription: isLikelySubscription(normalized),
  };
}

/**
 * Re-applies category rules to a list of transactions (e.g. after adding a new user rule).
 * Preserves manually overridden transactions (categorySource === 'manual').
 */
export function reapplyRules(
  transactions: Transaction[],
  userRules: UserCategoryRule[]
): Transaction[] {
  return transactions.map((tx) => {
    // Preserve explicit manual overrides
    if (tx.categorySource === 'manual') {
      return tx;
    }

    const { category, source, isSubscription } = categorize(
      `${tx.cleanedMerchant} ${tx.rawMerchant}`,
      userRules
    );

    return {
      ...tx,
      category,
      categorySource: source,
      isSubscription: isSubscription || tx.isSubscription,
    };
  });
}

