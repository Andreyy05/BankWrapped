import { CategoryId } from '../types';

export const cs = {
  app: {
    title: 'BankWrapped',
    subtitle: 'Spotify Wrapped pro tvé osobní finance',
    privacyBadge: 'Data běží pouze v prohlížeči',
    privacyTooltip: 'Vaše bankovní data se nikam neodesílají. Žádný server, žádné API, žádná analytika.',
    newImport: 'Nový import',
    demoButton: 'Vyzkoušet demo data',
    clearAll: 'Smazat vše',
    clearConfirm: 'Opravdu chcete smazat všechny načtené transakce a uložená pravidla z paměti prohlížeče?',
    themeLight: 'Světlý režim',
    themeDark: 'Tmavý režim',
    allPeriods: 'Všechna období',
  },
  categories: {
    groceries: 'Potraviny a supermarkety',
    dining: 'Restaurace, jídlo a kavárny',
    transport: 'Doprava a PHM',
    housing_utilities: 'Bydlení a energie',
    entertainment_subs: 'Předplatná a zábava',
    shopping: 'Nákupy a elektronika',
    health: 'Zdraví a lékárny',
    income: 'Příjmy a výplata',
    transfer: 'Převody mezi účty',
    other: 'Ostatní výdaje',
  } satisfies Record<CategoryId, string>,
  kpi: {
    totalExpense: 'Celkové výdaje',
    totalIncome: 'Celkové příjmy',
    netBalance: 'Čistá bilance',
    saved: 'Ušetřeno',
    deficit: 'V mínusu',
    savingsRate: 'Míra úspor',
    transfersExcludedNote: 'Převody mezi vlastními účty jsou z výdajů vyloučeny',
    foreignCurrenciesWarning: (count: number, currency: string) =>
      `${count} transakcí v jiné měně než ${currency} nebylo zahrnuto do přehledu.`,
  },
  insights: {
    title: 'Finanční postřehy',
    expensiveDay: {
      title: 'Nejdražší den v měsíci',
      detail: (date: string, amount: string, topItem?: string) =>
        `${date} se utratilo celkem ${amount}.${topItem ? ` Hlavní položka: ${topItem}.` : ''}`,
    },
    topMerchantsCount: {
      title: 'Kde tě viděli nejčastěji',
      detail: (merchant: string, count: number) =>
        `U obchodníka ${merchant} proběhlo celkem ${count} nákupů.`,
    },
    topMerchantsAmount: {
      title: 'Kam odešlo nejvíce peněz',
      detail: (merchant: string, amount: string) =>
        `${merchant} získal z tvých výdajů celkem ${amount}.`,
    },
    latteFactor: {
      title: 'Latte Factor (drobné platby)',
      detail: (count: number, amount: string, percentage: string) =>
        `${count} plateb pod 150 Kč tvoří ${amount} (${percentage} celkových výdajů).`,
    },
    subscriptions: {
      title: 'Pravidelná předplatná',
      detail: (count: number, monthly: string, yearly: string) =>
        `${count} aktivních služeb: ${monthly} měsíčně (cca ${yearly} ročně).`,
    },
    weekendVsWeekday: {
      title: 'Víkendy vs. Všední dny',
      detail: (weekendPct: number, weekendAvg: string, weekdayAvg: string) =>
        `Víkend tvoří ${weekendPct.toFixed(0)} % útrat. Průměr víkendového dne: ${weekendAvg}, všedního: ${weekdayAvg}.`,
    },
    maxSingleExpense: {
      title: 'Největší jednorázový výdaj',
      detail: (merchant: string, amount: string, date: string) =>
        `${amount} dne ${date} (${merchant}).`,
    },
    mostActiveDay: {
      title: 'Nejrušnější den v týdnu',
      detail: (dayName: string, count: number) =>
        `V ${dayName} proběhlo nejvíce plateb (${count} transakcí).`,
    },
  },
  table: {
    title: 'Seznam transakcí',
    searchPlaceholder: 'Hledat obchodníka nebo poznámku...',
    allCategories: 'Všechny kategorie',
    filterByExpense: 'Pouze výdaje',
    filterByIncome: 'Pouze příjmy',
    dateCol: 'Datum',
    merchantCol: 'Obchodník',
    categoryCol: 'Kategorie',
    amountCol: 'Částka',
    sourceCol: 'Původ',
    emptyTitle: 'Žádné transakce',
    emptyDesc: 'Pro vybrané filtry nebo období nebyly nalezeny žádné záznamy.',
    showingCount: (shown: number, total: number) => `Zobrazeno ${shown} z ${total} transakcí`,
    paginationPrev: 'Předchozí',
    paginationNext: 'Další',
    pageOf: (current: number, total: number) => `Strana ${current} z ${total}`,
  },
  rules: {
    dialogTitle: 'Nastavit trvalé pravidlo kategorie',
    dialogDesc: (merchant: string, category: string) =>
      `Přejete si kategorizovat všechny budoucí i stávající transakce od „${merchant}“ jako „${category}“?`,
    onlyThis: 'Jen tato transakce',
    allCurrentAndFuture: 'Všechny transakce',
    ruleSavedToast: (merchant: string) => `Pravidlo pro „${merchant}“ bylo uloženo.`,
  },
  wrapped: {
    openButton: 'Vygenerovat rekapitulaci měsíce',
    modalTitle: 'Tvůj měsíční Wrapped',
    downloadPng: 'Stáhnout jako PNG',
    downloading: 'Generuji PNG...',
    hideAmountsLabel: 'Skrýt přesné částky',
    spentTotal: (monthLocative: string, amount: string) => `${monthLocative} jsi utratil celkem ${amount}`,
    mostVisited: (merchant: string, count: number) => `Nejčastěji tě viděli v: ${merchant} (${count} nákupů)`,
    expensiveDay: (date: string) => `Tvůj nejdražší den byl ${date}`,
    topCategory: (category: string, pct: number) => `Kategorie č. 1: ${category} (${pct.toFixed(0)} % výdajů)`,
    savedMessage: (rate: number) => `Podařilo se ti uspořit ${rate.toFixed(0)} % svých příjmů!`,
    deficitMessage: 'Výdaje tento měsíc předčily příjmy.',
    privacyFooter: 'Soukromá analýza • Vše spočteno lokálně v prohlížeči',
  },
  monthsLocative: {
    1: 'V lednu',
    2: 'V únoru',
    3: 'V březnu',
    4: 'V dubnu',
    5: 'V květnu',
    6: 'V červnu',
    7: 'V červenci',
    8: 'V srpnu',
    9: 'V září',
    10: 'V říjnu',
    11: 'V listopadu',
    12: 'V prosinci',
  } as Record<number, string>,
  monthNamesNominative: {
    1: 'Leden',
    2: 'Únor',
    3: 'Březen',
    4: 'Duben',
    5: 'Květen',
    6: 'Červen',
    7: 'Červenec',
    8: 'Srpen',
    9: 'Září',
    10: 'Říjen',
    11: 'Listopad',
    12: 'Prosinec',
  } as Record<number, string>,
  daysOfWeek: {
    0: 'neděle',
    1: 'pondělí',
    2: 'úterý',
    3: 'středa',
    4: 'čtvrtek',
    5: 'pátek',
    6: 'sobota',
  } as Record<number, string>,
  import: {
    dropzoneTitle: 'Přetáhněte sem bankovní CSV výpis',
    dropzoneSubtitle: 'nebo klikněte a vyberte soubor z počítače (max. 10 MB)',
    supportedBanks: 'Podporuje Air Bank, Revolut, ČSOB, Českou spořitelnu, Fio a další',
    fileErrorSize: 'Soubor je větší než povolených 10 MB.',
    fileErrorExtension: 'Podporovány jsou pouze soubory s příponou .csv.',
    parsingError: 'Při parsování CSV souboru došlo k chybě:',
    columnMapperTitle: 'Přiřazení sloupců výpisu',
    columnMapperDesc: 'Rozpoznali jsme neznámý formát CSV. Zkontrolujte prosím mapování klíčových sloupců:',
    colDate: 'Sloupec pro datum',
    colAmount: 'Sloupec pro částku',
    colMerchant: 'Sloupec pro popis / obchodníka',
    colCurrency: 'Sloupec pro měnu (volitelné)',
    dateFormat: 'Formát data',
    decimalSep: 'Desetinný oddělovač',
    previewRows: 'Náhled prvních řádků:',
    confirmMapping: 'Potvrdit a načíst data',
  },
};

export function formatCurrencyCzk(amountMinor: number): string {
  const czk = amountMinor / 100;
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(czk);
}

