import { CategoryId } from '../types';

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  color: string;
  isExpense: boolean;
}

export const CATEGORIES: Record<CategoryId, CategoryDefinition> = {
  groceries: {
    id: 'groceries',
    label: 'Potraviny a supermarkety',
    color: '#0E7C66', // Pine green
    isExpense: true,
  },
  dining: {
    id: 'dining',
    label: 'Restaurace, jídlo a kavárny',
    color: '#E67E22', // Amber
    isExpense: true,
  },
  transport: {
    id: 'transport',
    label: 'Doprava a pohonné hmoty',
    color: '#2980B9', // Steel blue
    isExpense: true,
  },
  housing_utilities: {
    id: 'housing_utilities',
    label: 'Bydlení, energie a služby',
    color: '#6C5CE7', // Indigo
    isExpense: true,
  },
  entertainment_subs: {
    id: 'entertainment_subs',
    label: 'Předplatná a zábava',
    color: '#D63031', // Crimson
    isExpense: true,
  },
  shopping: {
    id: 'shopping',
    label: 'Nákupy a elektronika',
    color: '#0984E3', // Blue
    isExpense: true,
  },
  health: {
    id: 'health',
    label: 'Zdraví a lékárny',
    color: '#00B894', // Teal
    isExpense: true,
  },
  income: {
    id: 'income',
    label: 'Příjmy a výplata',
    color: '#107548', // Forest green
    isExpense: false,
  },
  transfer: {
    id: 'transfer',
    label: 'Převody mezi vlastními účty',
    color: '#636E72', // Slate
    isExpense: false,
  },
  other: {
    id: 'other',
    label: 'Ostatní výdaje',
    color: '#7F8C8D', // Neutral gray
    isExpense: true,
  },
};

export const BUILTIN_CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  groceries: [
    'albert', 'lidl', 'billa', 'kaufland', 'tesco', 'rohlik', 'kosik', 'penny', 'globus'
  ],
  dining: [
    'wolt', 'damejidlo', 'foodora', 'mcdonald', 'kfc', 'starbucks', 'costa', 'kavarna', 'bistro', 'restaurace'
  ],
  transport: [
    'bolt', 'uber', 'dpp', 'pid', 'idos', 'ceske drahy', 'regiojet', 'leo express', 'orlen', 'benzina', 'omv', 'shell'
  ],
  entertainment_subs: [
    'netflix', 'spotify', 'apple.com/bill', 'google storage', 'steam', 'playstation', 'youtube', 'hbo', 'disney'
  ],
  shopping: [
    'alza', 'mall', 'czc', 'datart', 'ikea', 'zara', 'h&m', 'zalando', 'amazon'
  ],
  health: [
    'lekarna', 'dr max', 'benu', 'poliklinika'
  ],
  housing_utilities: [
    'najem', 'cez', 'pre', 'innogy', 'vodafone', 'o2', 't-mobile'
  ],
  income: [
    'vyplata', 'mzda', 'plat', 'odmena', 'stipendium', 'preplatek'
  ],
  transfer: [
    'vlastni ucet', 'sporici ucet', 'prevod mezi ucty'
  ],
  other: [],
};

export function getCategoryDefinition(id: CategoryId): CategoryDefinition {
  return CATEGORIES[id] ?? CATEGORIES.other;
}
