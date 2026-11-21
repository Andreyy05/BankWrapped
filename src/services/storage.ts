import { UserCategoryRule, ColumnMapping } from '@/types';

const STORAGE_KEYS = {
  RULES: 'bankwrapped_category_rules',
  COLUMN_MAPPINGS: 'bankwrapped_column_mappings',
  THEME: 'bankwrapped_theme',
} as const;

export function getUserCategoryRules(): UserCategoryRule[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RULES);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (r): r is UserCategoryRule =>
          typeof r === 'object' &&
          r !== null &&
          typeof r.merchantKey === 'string' &&
          typeof r.categoryId === 'string' &&
          typeof r.createdAt === 'string'
      );
    }
  } catch {
    // Return empty on parse error
  }
  return [];
}

export function saveUserCategoryRule(rule: UserCategoryRule): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getUserCategoryRules();
    // Filter out existing rule for the same merchant key
    const filtered = existing.filter((r) => r.merchantKey !== rule.merchantKey);
    filtered.push(rule);
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(filtered));
  } catch {
    // Ignore storage quota or permission errors
  }
}

export function deleteUserCategoryRule(merchantKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getUserCategoryRules();
    const filtered = existing.filter((r) => r.merchantKey !== merchantKey);
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(filtered));
  } catch {
    // Ignore error
  }
}

export function clearUserCategoryRules(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.RULES);
  } catch {
    // Ignore error
  }
}

export function getSavedColumnMappings(): Record<string, ColumnMapping> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COLUMN_MAPPINGS);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, ColumnMapping>;
    }
  } catch {
    // Ignore error
  }
  return {};
}

export function saveColumnMapping(fingerprint: string, mapping: ColumnMapping): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedColumnMappings();
    current[fingerprint] = mapping;
    localStorage.setItem(STORAGE_KEYS.COLUMN_MAPPINGS, JSON.stringify(current));
  } catch {
    // Ignore error
  }
}

export function clearAllStoredData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.RULES);
    localStorage.removeItem(STORAGE_KEYS.COLUMN_MAPPINGS);
    // Preserves theme preference unless explicitly desired
  } catch {
    // Ignore error
  }
}

