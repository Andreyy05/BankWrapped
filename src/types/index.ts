/**
 * Supported budget & spending categories in BankWrapped.
 */
export type CategoryId =
  | 'groceries'
  | 'dining'
  | 'transport'
  | 'housing_utilities'
  | 'entertainment_subs'
  | 'shopping'
  | 'health'
  | 'income'
  | 'transfer'
  | 'other';

/**
 * Origin source of category assignment.
 */
export type CategorySource = 'rule_builtin' | 'rule_user' | 'manual' | 'fallback';

/**
 * Normalized transaction model.
 * All monetary amounts are integers in minor units (haléře/cents) to prevent floating-point drift.
 */
export interface Transaction {
  /** Stable hash composed of date, amount, raw merchant and duplicate index */
  id: string;
  /** ISO date string: YYYY-MM-DD */
  date: string;
  /** Integer in minor currency units (haléře); negative for expenses, positive for income */
  amountMinor: number;
  /** ISO 4217 currency code, typically CZK */
  currency: string;
  /** Raw statement descriptor as provided by the bank */
  rawMerchant: string;
  /** Cleaned merchant display name */
  cleanedMerchant: string;
  /** Assigned category */
  category: CategoryId;
  /** Origin source of the category assignment */
  categorySource: CategorySource;
  /** Whether this payment matches recurring subscription criteria */
  isSubscription: boolean;
  /** Optional payment note or user comment */
  note?: string;
  /** Optional bank account identifier */
  accountId?: string;
}

export interface UserCategoryRule {
  merchantKey: string; // Lowercase, trimmed, diacritics-removed pattern
  categoryId: CategoryId;
  createdAt: string; // ISO timestamp
}

export type BankId = 'airbank' | 'csob' | 'csas' | 'fio' | 'revolut' | 'generic';

export interface BankProfile {
  id: BankId;
  name: string;
  delimiter: string;
  decimalSeparator: ',' | '.';
  dateFormat: string;
  isExperimental?: boolean;
}

export interface ColumnMapping {
  dateCol: string;
  amountCol: string;
  merchantCol: string;
  noteCol?: string;
  currencyCol?: string;
  dateFormat: string;
  decimalSeparator: ',' | '.';
}

export interface ParseError {
  row: number;
  message: string;
  raw?: string;
}

export interface CurrencyStats {
  mainCurrency: string;
  currencyCounts: Record<string, number>;
  excludedCurrenciesCount: number;
}

export interface ParseResult {
  transactions: Transaction[];
  errors: ParseError[];
  detectedBank: BankProfile | null;
  currencyStats: CurrencyStats;
}

export interface ExpensiveDayInfo {
  date: string;
  totalExpenseMinor: number;
  topTransaction: Transaction | null;
}

export interface TopMerchant {
  merchant: string;
  count: number;
  totalMinor: number;
}

export interface SubscriptionGroup {
  merchant: string;
  monthlyAmountMinor: number;
  yearlyAmountMinor: number;
  transactionCount: number;
}

export interface WeekendWeekdayAnalysis {
  weekendExpenseMinor: number;
  weekdayExpenseMinor: number;
  weekendPercentage: number;
  weekdayPercentage: number;
  weekendDailyAverageMinor: number;
  weekdayDailyAverageMinor: number;
}

export interface InsightMetric {
  id: string;
  titleKey: string;
  value: string;
  detail: string;
  icon: string;
}

export interface InsightsResult {
  totalExpenseMinor: number;
  totalIncomeMinor: number;
  netBalanceMinor: number;
  savingsRatePercentage: number;
  expensiveDay: ExpensiveDayInfo | null;
  topMerchantsByCount: TopMerchant[];
  topMerchantsByAmount: TopMerchant[];
  latteFactor: {
    totalMinor: number;
    count: number;
    percentageOfExpense: number;
    thresholdMinor: number;
  };
  subscriptions: {
    items: SubscriptionGroup[];
    monthlyTotalMinor: number;
    yearlyTotalMinor: number;
  };
  weekendVsWeekday: WeekendWeekdayAnalysis;
  maxSingleExpense: Transaction | null;
  mostActiveDayOfWeek: {
    dayIndex: number; // 0 = Sunday, 1 = Monday, etc.
    dayName: string;
    transactionCount: number;
    totalMinor: number;
  } | null;
  cards: InsightMetric[];
}

export interface CategorySummary {
  categoryId: CategoryId;
  totalExpenseMinor: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthPeriod {
  year: number;
  month: number; // 1-12
  label: string;
  key: string; // 'YYYY-MM'
}

