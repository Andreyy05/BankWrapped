import Papa from 'papaparse';
import {
  BankProfile,
  ColumnMapping,
  CurrencyStats,
  ParseError,
  ParseResult,
  Transaction,
  UserCategoryRule,
} from '@/types';
import { categorize } from './categorizer';

export const BANK_PROFILES: BankProfile[] = [
  {
    id: 'airbank',
    name: 'Air Bank',
    delimiter: ';',
    decimalSeparator: ',',
    dateFormat: 'DD/MM/YYYY',
  },
  {
    id: 'revolut',
    name: 'Revolut',
    delimiter: ',',
    decimalSeparator: '.',
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  {
    id: 'csob',
    name: 'ČSOB',
    delimiter: ';',
    decimalSeparator: ',',
    dateFormat: 'DD.MM.YYYY',
    isExperimental: true,
  },
  {
    id: 'csas',
    name: 'Česká spořitelna',
    delimiter: ';',
    decimalSeparator: ',',
    dateFormat: 'DD.MM.YYYY',
    isExperimental: true,
  },
  {
    id: 'fio',
    name: 'Fio banka',
    delimiter: ';',
    decimalSeparator: ',',
    dateFormat: 'DD.MM.YYYY',
    isExperimental: true,
  },
];

/**
 * Strips UTF-8 BOM from string if present.
 */
export function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

/**
 * Decodes raw file ArrayBuffer into string.
 * Tries UTF-8 first. If replacement character \uFFFD is encountered,
 * falls back to windows-1250 encoding via TextDecoder.
 */
export function decodeFileBuffer(buffer: ArrayBuffer): string {
  const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
  const utf8Text = stripBom(utf8Decoder.decode(buffer));

  if (utf8Text.includes('\uFFFD')) {
    try {
      const win1250Decoder = new TextDecoder('windows-1250');
      return stripBom(win1250Decoder.decode(buffer));
    } catch {
      // Fallback to utf8 if windows-1250 decoder is not supported
      return utf8Text;
    }
  }

  return utf8Text;
}

/**
 * Normalizes header strings for reliable fuzzy matching.
 */
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Detects bank profile based on CSV delimiter and header row.
 */
export function detectBank(headers: string[], delimiter: string): BankProfile | null {
  const normHeaders = headers.map(normalizeHeader);

  // Revolut check: comma delimiter, English headers
  if (delimiter === ',' || normHeaders.includes('starteddate') || normHeaders.includes('completeddate')) {
    const hasRevolutKeys =
      normHeaders.includes('starteddate') &&
      normHeaders.includes('description') &&
      normHeaders.includes('amount');
    if (hasRevolutKeys) {
      return BANK_PROFILES.find((p) => p.id === 'revolut') || null;
    }
  }

  // Semicolon-delimited Czech banks
  if (delimiter === ';') {
    // Air Bank: 'Datum provedení' / 'Částka v měně účtu' / 'Název protistrany'
    const isAirBank =
      normHeaders.some((h) => h.includes('datumprovedeni') || h.includes('datumzauctovani')) &&
      normHeaders.some((h) => h.includes('castkavmeneuctu') || h.includes('popisplatby'));
    if (isAirBank) {
      return BANK_PROFILES.find((p) => p.id === 'airbank') || null;
    }

    // Fio: 'Datum', 'Objem', 'Měna', 'Protiúčet' / 'Název protiúčtu'
    const isFio =
      normHeaders.includes('datum') &&
      normHeaders.includes('objem') &&
      normHeaders.some((h) => h.includes('protiucet') || h.includes('zpravaproprijemce'));
    if (isFio) {
      return BANK_PROFILES.find((p) => p.id === 'fio') || null;
    }

    // ČSOB: 'Datum zaúčtování', 'Částka', 'Měna'
    const isCsob =
      normHeaders.some((h) => h.includes('datumzauctovani') || h.includes('datum')) &&
      normHeaders.some((h) => h.includes('castka')) &&
      normHeaders.some((h) => h.includes('nazevprotiuctu') || h.includes('zpravaproprijemce'));
    if (isCsob) {
      return BANK_PROFILES.find((p) => p.id === 'csob') || null;
    }

    // Česká spořitelna (ČSAS)
    const isCsas =
      normHeaders.some((h) => h.includes('datumtransakce') || h.includes('datumzauctovani')) &&
      normHeaders.some((h) => h.includes('castka')) &&
      normHeaders.some((h) => h.includes('nazevobchodnika') || h.includes('nazevprotiuctu'));
    if (isCsas) {
      return BANK_PROFILES.find((p) => p.id === 'csas') || null;
    }
  }

  return null;
}

/**
 * Cleans raw bank transaction descriptions into readable merchant names:
 * removes card prefixes, masked numbers, terminal IDs, postal codes, and cities.
 */
export function cleanMerchantName(rawText: string): string {
  if (!rawText || rawText.trim() === '') {
    return 'Neznámý obchodník';
  }

  let cleaned = rawText.trim();

  // Remove common banking prefixes
  const prefixes = [
    /^(platba\s+kartou|nakup\s+kartou|nakup|nákup\s+kartou|nákup)\s*[-:]?\s*/i,
    /^(trvaly\s+prikaz|trvalý\s+příkaz|prikaz\s+k\s+uhrade|příkaz\s+k\s+úhradě)\s*[-:]?\s*/i,
    /^(prichozi\s+platba|příchozí\s+platba|odchozi\s+platba|odchozí\s+platba)\s*[-:]?\s*/i,
    /^(vyber\s+z\s+bankomatu|výběr\s+z\s+bankomatu|inkaso|splatka|splátka)\s*[-:]?\s*/i,
    /^(prevod\s+mezi\s+ucty|převod\s+mezi\s+účty|vnitrobankovni\s+prevod)\s*[-:]?\s*/i,
    /^(bezhotovostni\s+platba|bezhotovostní\s+platba)\s*[-:]?\s*/i,
  ];

  for (const prefix of prefixes) {
    cleaned = cleaned.replace(prefix, '');
  }

  // Remove masked card numbers: *1234, ****1234, or standalone card sequences
  cleaned = cleaned.replace(/\*{1,4}\d{4}/g, '');
  cleaned = cleaned.replace(/\bcard\s+\d{4}\b/gi, '');

  // Remove city / regional suffixes like 'Praha 6', 'Praha 1', 'Brno', etc.
  cleaned = cleaned.replace(/\b(praha|brno|ostrava|plzen|plzeň|olomouc|liberec)\s*\d*\b/gi, '');

  // Remove country indicators like 'CZ', 'NL', 'IE', 'GB', 'DE' when at the end of token
  cleaned = cleaned.replace(/\b(NL|IE|GB|DE|US|CZ)\s+\d{4,}\b/gi, '');

  // Remove terminal/transaction IDs like 8214, 849204, 5421
  cleaned = cleaned.replace(/\b\d{4,}\b/g, '');

  // Clean redundant whitespace, commas, trailing dashes
  cleaned = cleaned.replace(/[,\-:;]+$/, '').replace(/\s{2,}/g, ' ').trim();

  return cleaned.length > 0 ? cleaned : (rawText.trim() || 'Neznámý obchodník');
}

/**
 * Parses numeric monetary string into integer minor units (haléře, cents).
 * e.g. "-1 250,50 Kč" -> -125050
 */
export function parseAmountToMinor(amountStr: string, decimalSep: ',' | '.'): number {
  if (!amountStr) return 0;

  // Remove currency signs, NBSP, and whitespace
  let clean = amountStr
    .replace(/[^\d.,+\-]/g, '')
    .replace(/\u00A0|\u202F/g, '')
    .trim();

  if (decimalSep === ',') {
    // Semicolon/comma format: 1.234,50 or 1234,50
    // Remove thousands dot if followed by digits and comma
    clean = clean.replace(/\.(?=\d+,)/g, '');
    clean = clean.replace(',', '.');
  } else {
    // Dot format: 1,234.50 or 1234.50
    clean = clean.replace(/,(?=\d+\.)/g, '');
  }

  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return 0;

  return Math.round(parsed * 100);
}

/**
 * Parses date string in various bank formats into ISO 'YYYY-MM-DD'.
 * Never uses `new Date(string)` directly to prevent timezone skew.
 */
export function parseDateToIso(dateStr: string, formatHint?: string): string | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // Pattern: YYYY-MM-DD or YYYY-MM-DD HH:mm:ss (Revolut)
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1]!;
    const m = isoMatch[2]!.padStart(2, '0');
    const d = isoMatch[3]!.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Pattern: DD.MM.YYYY or DD/MM/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1]!.padStart(2, '0');
    const m = dmyMatch[2]!.padStart(2, '0');
    const y = dmyMatch[3]!;
    return `${y}-${m}-${d}`;
  }

  // Pattern with format hint check
  if (formatHint === 'DD/MM/YYYY' || formatHint === 'DD.MM.YYYY') {
    const parts = trimmed.split(/[./\s]/);
    if (parts.length >= 3) {
      const d = parts[0]!.padStart(2, '0');
      const m = parts[1]!.padStart(2, '0');
      const y = parts[2]!;
      if (y.length === 4) {
        return `${y}-${m}-${d}`;
      }
    }
  }

  return null;
}

/**
 * Generates a stable unique hash identifier for a transaction.
 */
export function generateTransactionId(
  date: string,
  amountMinor: number,
  rawMerchant: string,
  duplicateIndex: number
): string {
  const safeMerchant = rawMerchant.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  return `tx-${date}-${Math.abs(amountMinor)}-${safeMerchant}-${duplicateIndex}`;
}

export interface ParseCsvOptions {
  userRules?: UserCategoryRule[];
  forcedProfile?: BankProfile;
  customMapping?: ColumnMapping;
}

/**
 * Main CSV parser function:
 * Parses CSV text, detects bank format, normalizes rows, categorizes,
 * computes currency stats, and returns ParseResult.
 */
export function parseBankCsv(csvText: string, options: ParseCsvOptions = {}): ParseResult {
  const { userRules = [], forcedProfile, customMapping } = options;

  const rawCleanedText = stripBom(csvText.trim());

  // Determine delimiter
  let delimiter = forcedProfile?.delimiter ?? (customMapping?.decimalSeparator === ',' ? ';' : ',');
  if (!forcedProfile && !customMapping) {
    const firstLine = rawCleanedText.split(/\r\n|\n|\r/)[0] ?? '';
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    delimiter = semicolonCount >= commaCount ? ';' : ',';
  }

  const parsed = Papa.parse<Record<string, string>>(rawCleanedText, {
    header: true,
    delimiter,
    skipEmptyLines: 'greedy',
  });

  const headers = parsed.meta.fields ?? [];
  const detectedProfile = forcedProfile ?? detectBank(headers, delimiter);

  // Determine column mapping
  let mapping: ColumnMapping;
  if (customMapping) {
    mapping = customMapping;
  } else if (detectedProfile?.id === 'airbank') {
    mapping = {
      dateCol: headers.find((h) => normalizeHeader(h).includes('datumprovedeni') || normalizeHeader(h).includes('datumzauctovani')) ?? headers[0] ?? '',
      amountCol: headers.find((h) => normalizeHeader(h).includes('castkavmeneuctu') || normalizeHeader(h).includes('castka')) ?? headers[1] ?? '',
      merchantCol: headers.find((h) => normalizeHeader(h).includes('nazevprotistrany') || normalizeHeader(h).includes('popisplatby')) ?? headers[2] ?? '',
      noteCol: headers.find((h) => normalizeHeader(h).includes('zpravaproprijemce') || normalizeHeader(h).includes('poznamka')),
      currencyCol: headers.find((h) => normalizeHeader(h).includes('menauctu') || normalizeHeader(h).includes('mena')),
      dateFormat: 'DD/MM/YYYY',
      decimalSeparator: ',',
    };
  } else if (detectedProfile?.id === 'revolut') {
    mapping = {
      dateCol: headers.find((h) => normalizeHeader(h).includes('starteddate')) ?? 'Started Date',
      amountCol: headers.find((h) => normalizeHeader(h).includes('amount')) ?? 'Amount',
      merchantCol: headers.find((h) => normalizeHeader(h).includes('description')) ?? 'Description',
      noteCol: headers.find((h) => normalizeHeader(h).includes('note')),
      currencyCol: headers.find((h) => normalizeHeader(h).includes('currency')) ?? 'Currency',
      dateFormat: 'YYYY-MM-DD HH:mm:ss',
      decimalSeparator: '.',
    };
  } else if (detectedProfile?.id === 'fio') {
    mapping = {
      dateCol: headers.find((h) => normalizeHeader(h) === 'datum') ?? headers[0] ?? '',
      amountCol: headers.find((h) => normalizeHeader(h) === 'objem') ?? headers[1] ?? '',
      merchantCol: headers.find((h) => normalizeHeader(h).includes('protiucet') || normalizeHeader(h).includes('nazevprotiuctu')) ?? headers[2] ?? '',
      noteCol: headers.find((h) => normalizeHeader(h).includes('zpravaproprijemce') || normalizeHeader(h).includes('popis')),
      currencyCol: headers.find((h) => normalizeHeader(h) === 'mena'),
      dateFormat: 'DD.MM.YYYY',
      decimalSeparator: ',',
    };
  } else {
    // Generic fallback mapping based on fuzzy headers
    mapping = {
      dateCol: headers.find((h) => normalizeHeader(h).includes('datum') || normalizeHeader(h).includes('date')) ?? headers[0] ?? '',
      amountCol: headers.find((h) => normalizeHeader(h).includes('castka') || normalizeHeader(h).includes('amount') || normalizeHeader(h).includes('objem')) ?? headers[1] ?? '',
      merchantCol: headers.find((h) => normalizeHeader(h).includes('nazev') || normalizeHeader(h).includes('popis') || normalizeHeader(h).includes('description') || normalizeHeader(h).includes('merchant')) ?? headers[2] ?? '',
      noteCol: headers.find((h) => normalizeHeader(h).includes('zprava') || normalizeHeader(h).includes('note') || normalizeHeader(h).includes('poznamka')),
      currencyCol: headers.find((h) => normalizeHeader(h).includes('mena') || normalizeHeader(h).includes('currency')),
      dateFormat: 'DD.MM.YYYY',
      decimalSeparator: delimiter === ';' ? ',' : '.',
    };
  }

  const transactions: Transaction[] = [];
  const errors: ParseError[] = [];
  const currencyCounts: Record<string, number> = {};

  const duplicateCounter: Record<string, number> = {};

  parsed.data.forEach((row, idx) => {
    const rowNum = idx + 2; // +1 for 0-index, +1 for header line

    // Ignore summary rows or empty rows
    const firstVal = Object.values(row)[0] ?? '';
    if (/^(celkem|součet|zůstatek|summary|total)/i.test(firstVal.trim())) {
      return;
    }

    // Revolut: Ignore non-completed states
    if (detectedProfile?.id === 'revolut') {
      const state = row['State'] ?? row['state'] ?? '';
      if (state && state.trim().toUpperCase() !== 'COMPLETED') {
        return;
      }
    }

    const rawDate = row[mapping.dateCol];
    const rawAmount = row[mapping.amountCol];
    const rawMerchant = row[mapping.merchantCol] || 'Neznámá platba';
    const rawNote = (mapping.noteCol ? row[mapping.noteCol] : '') || '';
    const currency = (mapping.currencyCol ? row[mapping.currencyCol] : 'CZK') || 'CZK';

    if (!rawDate) {
      errors.push({
        row: rowNum,
        message: `Chybí datum ve sloupci „${mapping.dateCol}“.`,
        raw: JSON.stringify(row),
      });
      return;
    }

    const isoDate = parseDateToIso(rawDate, mapping.dateFormat);
    if (!isoDate) {
      errors.push({
        row: rowNum,
        message: `Neplatný formát data „${rawDate}“. Očekává se formát ${mapping.dateFormat}.`,
        raw: JSON.stringify(row),
      });
      return;
    }

    if (!rawAmount) {
      errors.push({
        row: rowNum,
        message: `Chybí částka ve sloupci „${mapping.amountCol}“.`,
        raw: JSON.stringify(row),
      });
      return;
    }

    const amountMinor = parseAmountToMinor(rawAmount, mapping.decimalSeparator);

    // Track currency stats
    const cleanCurrency = currency.trim().toUpperCase() || 'CZK';
    currencyCounts[cleanCurrency] = (currencyCounts[cleanCurrency] || 0) + 1;

    // Clean merchant description
    const cleanedMerchant = cleanMerchantName(rawMerchant);

    // Auto-categorize considering merchant name and note/description
    const textForCategorization = `${cleanedMerchant} ${rawMerchant} ${rawNote}`.trim();
    let { category, source, isSubscription } = categorize(
      textForCategorization,
      userRules
    );

    // If still other but positive amount, check if salary/income
    if (category === 'other' && amountMinor > 0) {
      if (/mzda|vyplata|výplata|plat\b|odmena|odměna/i.test(textForCategorization)) {
        category = 'income';
        source = 'rule_builtin';
      }
    }

    // Track duplicates for unique id
    const key = `${isoDate}-${amountMinor}-${rawMerchant}`;
    const dupIndex = (duplicateCounter[key] = (duplicateCounter[key] || 0) + 1);
    const id = generateTransactionId(isoDate, amountMinor, rawMerchant, dupIndex);

    transactions.push({
      id,
      date: isoDate,
      amountMinor,
      currency: cleanCurrency,
      rawMerchant,
      cleanedMerchant,
      category,
      categorySource: source,
      isSubscription,
      note: rawNote.trim() || undefined,
    });
  });

  // Calculate currency stats
  const currenciesSorted = Object.entries(currencyCounts).sort((a, b) => b[1] - a[1]);
  const mainCurrency = currenciesSorted[0]?.[0] || 'CZK';
  const excludedCurrenciesCount = transactions.filter((t) => t.currency !== mainCurrency).length;

  const currencyStats: CurrencyStats = {
    mainCurrency,
    currencyCounts,
    excludedCurrenciesCount,
  };

  return {
    transactions,
    errors,
    detectedBank: detectedProfile,
    currencyStats,
  };
}
