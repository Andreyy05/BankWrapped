import { Transaction } from '../types';

export const DEMO_TRANSACTIONS: Transaction[] = [
  // 2024-10-01 (Úterý)
  {
    id: 'tx-2024-10-01-1',
    date: '2024-10-01',
    amountMinor: -4500, // 45 Kč
    currency: 'CZK',
    rawMerchant: 'Platba kartou Albert 8214 Praha 6',
    cleanedMerchant: 'Albert',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-01-2',
    date: '2024-10-01',
    amountMinor: -8900, // 89 Kč
    currency: 'CZK',
    rawMerchant: 'Platba kartou Costa Coffee Dejvice',
    cleanedMerchant: 'Costa Coffee',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-01-3',
    date: '2024-10-01',
    amountMinor: -42000, // 420 Kč
    currency: 'CZK',
    rawMerchant: 'Nákup kartou Rohlik.cz s.r.o.',
    cleanedMerchant: 'Rohlik.cz',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-02 (Středa)
  {
    id: 'tx-2024-10-02-1',
    date: '2024-10-02',
    amountMinor: -3000, // 30 Kč
    currency: 'CZK',
    rawMerchant: 'DPP jizdenka 30 min SMS',
    cleanedMerchant: 'DPP',
    category: 'transport',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-02-2',
    date: '2024-10-02',
    amountMinor: -21500, // 215 Kč
    currency: 'CZK',
    rawMerchant: 'Bistro Karlin obedove menu',
    cleanedMerchant: 'Bistro Karlin',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-03 (Čtvrtek)
  {
    id: 'tx-2024-10-03-1',
    date: '2024-10-03',
    amountMinor: -8500, // 85 Kč
    currency: 'CZK',
    rawMerchant: 'Billa Korunni svacina',
    cleanedMerchant: 'Billa',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-03-2',
    date: '2024-10-03',
    amountMinor: -125000, // 1 250 Kč
    currency: 'CZK',
    rawMerchant: 'Platba kartou Benzina Orlen Pruhonice',
    cleanedMerchant: 'Orlen Benzina',
    category: 'transport',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-04 (Pátek) - Předplatné Netflix
  {
    id: 'tx-2024-10-04-1',
    date: '2024-10-04',
    amountMinor: -37900, // 379 Kč (Subscription #1)
    currency: 'CZK',
    rawMerchant: 'Netflix.com Amsterdam NL 849204',
    cleanedMerchant: 'Netflix',
    category: 'entertainment_subs',
    categorySource: 'rule_builtin',
    isSubscription: true,
  },
  {
    id: 'tx-2024-10-04-2',
    date: '2024-10-04',
    amountMinor: -48000, // 480 Kč
    currency: 'CZK',
    rawMerchant: 'Wolt Cesko s.r.o. vecere',
    cleanedMerchant: 'Wolt',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-04-3',
    date: '2024-10-04',
    amountMinor: -4000, // 40 Kč
    currency: 'CZK',
    rawMerchant: 'Wolt dýško kuryrovi',
    cleanedMerchant: 'Wolt',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-05 (Sobota - NEJDRAŽŠÍ DEN V MĚSÍCI: celkem 37 490 Kč)
  {
    id: 'tx-2024-10-05-1',
    date: '2024-10-05',
    amountMinor: -2350000, // 23 500 Kč (Nájem a služby)
    currency: 'CZK',
    rawMerchant: 'Trvaly prikaz: Najem bytu a energie 10/2024',
    cleanedMerchant: 'Pronájem bytu',
    category: 'housing_utilities',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-05-2',
    date: '2024-10-05',
    amountMinor: -1399000, // 13 990 Kč (Monitor na home office)
    currency: 'CZK',
    rawMerchant: 'Alza.cz a.s. Holesovice nakup',
    cleanedMerchant: 'Alza.cz',
    category: 'shopping',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-06 (Neděle - Víkend)
  {
    id: 'tx-2024-10-06-1',
    date: '2024-10-06',
    amountMinor: -185000, // 1 850 Kč
    currency: 'CZK',
    rawMerchant: 'Kaufland Praha Vypich tydenni nakup',
    cleanedMerchant: 'Kaufland',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-06-2',
    date: '2024-10-06',
    amountMinor: -7500, // 75 Kč
    currency: 'CZK',
    rawMerchant: 'Kavarna Misto espresso',
    cleanedMerchant: 'Kavarna Misto',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-07 (Pondělí)
  {
    id: 'tx-2024-10-07-1',
    date: '2024-10-07',
    amountMinor: -4200, // 42 Kč
    currency: 'CZK',
    rawMerchant: 'DPP jizdenka 90 min',
    cleanedMerchant: 'DPP',
    category: 'transport',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-07-2',
    date: '2024-10-07',
    amountMinor: -19500, // 195 Kč
    currency: 'CZK',
    rawMerchant: 'KFC Evropska menu',
    cleanedMerchant: 'KFC',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-08 (Úterý)
  {
    id: 'tx-2024-10-08-1',
    date: '2024-10-08',
    amountMinor: -9900, // 99 Kč
    currency: 'CZK',
    rawMerchant: 'Starbucks coffee Praha',
    cleanedMerchant: 'Starbucks',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-08-2',
    date: '2024-10-08',
    amountMinor: -34000, // 340 Kč
    currency: 'CZK',
    rawMerchant: 'Lidl Ceska republika v.o.s.',
    cleanedMerchant: 'Lidl',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-09 (Středa)
  {
    id: 'tx-2024-10-09-1',
    date: '2024-10-09',
    amountMinor: -12500, // 125 Kč
    currency: 'CZK',
    rawMerchant: 'Lekarna Dr. Max pastilky',
    cleanedMerchant: 'Dr. Max',
    category: 'health',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-09-2',
    date: '2024-10-09',
    amountMinor: -55000, // 550 Kč
    currency: 'CZK',
    rawMerchant: 'O2 Czech Republic a.s. pausal',
    cleanedMerchant: 'O2',
    category: 'housing_utilities',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-10 (Čtvrtek - VÝPLATA)
  {
    id: 'tx-2024-10-10-1',
    date: '2024-10-10',
    amountMinor: 6250000, // +62 500 Kč (VÝPLATA)
    currency: 'CZK',
    rawMerchant: 'Mzda za 09/2024 ACME Technologies s.r.o.',
    cleanedMerchant: 'ACME Technologies - Mzda',
    category: 'income',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-10-2',
    date: '2024-10-10',
    amountMinor: -24500, // 245 Kč
    currency: 'CZK',
    rawMerchant: 'Restaurace Lokal Dlouha',
    cleanedMerchant: 'Restaurace Lokal',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-11 (Pátek - PŘEVOD NA VLASTNÍ ÚČET)
  {
    id: 'tx-2024-10-11-1',
    date: '2024-10-11',
    amountMinor: -1500000, // -15 000 Kč (Převod mezi vlastními účty)
    currency: 'CZK',
    rawMerchant: 'Prevod na vlastni sporici ucet Air Bank',
    cleanedMerchant: 'Vlastní spořicí účet',
    category: 'transfer',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-11-2',
    date: '2024-10-11',
    amountMinor: -11900, // 119 Kč
    currency: 'CZK',
    rawMerchant: 'Costa Coffee Smichov cappuccino',
    cleanedMerchant: 'Costa Coffee',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-12 (Sobota - Víkend + Předplatné Spotify)
  {
    id: 'tx-2024-10-12-1',
    date: '2024-10-12',
    amountMinor: -16900, // 169 Kč (Subscription #2)
    currency: 'CZK',
    rawMerchant: 'Spotify AB Stockholm SE 29381',
    cleanedMerchant: 'Spotify',
    category: 'entertainment_subs',
    categorySource: 'rule_builtin',
    isSubscription: true,
  },
  {
    id: 'tx-2024-10-12-2',
    date: '2024-10-12',
    amountMinor: -65000, // 650 Kč
    currency: 'CZK',
    rawMerchant: 'Restaurace Kolkovna obed pro dva',
    cleanedMerchant: 'Restaurace Kolkovna',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-12-3',
    date: '2024-10-12',
    amountMinor: -4900, // 49 Kč
    currency: 'CZK',
    rawMerchant: 'Trafika Relay noviny a casopis',
    cleanedMerchant: 'Relay',
    category: 'shopping',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-13 (Neděle - Víkend)
  {
    id: 'tx-2024-10-13-1',
    date: '2024-10-13',
    amountMinor: -112000, // 1 120 Kč
    currency: 'CZK',
    rawMerchant: 'IKEA Ceska republika Zlicin',
    cleanedMerchant: 'IKEA',
    category: 'shopping',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-13-2',
    date: '2024-10-13',
    amountMinor: -5000, // 50 Kč
    currency: 'CZK',
    rawMerchant: 'Parkovaci automat Praha 5',
    cleanedMerchant: 'Parkovani',
    category: 'transport',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-14 (Pondělí)
  {
    id: 'tx-2024-10-14-1',
    date: '2024-10-14',
    amountMinor: -6500, // 65 Kč
    currency: 'CZK',
    rawMerchant: 'Rohlik.cz pecivo a mleko',
    cleanedMerchant: 'Rohlik.cz',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-14-2',
    date: '2024-10-14',
    amountMinor: -21000, // 210 Kč
    currency: 'CZK',
    rawMerchant: 'Bistro u sadu obed',
    cleanedMerchant: 'Bistro u sadu',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-15 (Úterý)
  {
    id: 'tx-2024-10-15-1',
    date: '2024-10-15',
    amountMinor: -6500, // 65 Kč
    currency: 'CZK',
    rawMerchant: 'Pekarna Kabat kvaskovy chleb',
    cleanedMerchant: 'Pekarna Kabat',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-15-2',
    date: '2024-10-15',
    amountMinor: -142000, // 1 420 Kč
    currency: 'CZK',
    rawMerchant: 'PRE Prazska energetika zaloha elektrina',
    cleanedMerchant: 'PRE',
    category: 'housing_utilities',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-16 (Středa)
  {
    id: 'tx-2024-10-16-1',
    date: '2024-10-16',
    amountMinor: -3500, // 35 Kč
    currency: 'CZK',
    rawMerchant: 'Napojovy automat Selecta kava',
    cleanedMerchant: 'Automat',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-16-2',
    date: '2024-10-16',
    amountMinor: -16800, // 168 Kč
    currency: 'CZK',
    rawMerchant: 'Uber trip Prague',
    cleanedMerchant: 'Uber',
    category: 'transport',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-17 (Čtvrtek)
  {
    id: 'tx-2024-10-17-1',
    date: '2024-10-17',
    amountMinor: -189000, // 1 890 Kč
    currency: 'CZK',
    rawMerchant: 'Zara Fashion s.r.o. nakup obleceni',
    cleanedMerchant: 'Zara',
    category: 'shopping',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-17-2',
    date: '2024-10-17',
    amountMinor: -5500, // 55 Kč
    currency: 'CZK',
    rawMerchant: 'Billa mineralni voda a zvykacky',
    cleanedMerchant: 'Billa',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-18 (Pátek - Předplatné iCloud)
  {
    id: 'tx-2024-10-18-1',
    date: '2024-10-18',
    amountMinor: -7900, // 79 Kč (Subscription #3)
    currency: 'CZK',
    rawMerchant: 'Apple.com/bill Dublin IE 200GB iCloud',
    cleanedMerchant: 'Apple iCloud',
    category: 'entertainment_subs',
    categorySource: 'rule_builtin',
    isSubscription: true,
  },
  {
    id: 'tx-2024-10-18-2',
    date: '2024-10-18',
    amountMinor: -39000, // 390 Kč
    currency: 'CZK',
    rawMerchant: 'Foodora rozvoz pizzy',
    cleanedMerchant: 'Foodora',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-19 (Sobota - REFUNDACE U ZARA)
  {
    id: 'tx-2024-10-19-1',
    date: '2024-10-19',
    amountMinor: 149900, // +1 499 Kč (REFUNDACE - kladná částka u známého obchodníka Zara)
    currency: 'CZK',
    rawMerchant: 'Platba kartou ZARA VRACENI ZBOZI REFUND',
    cleanedMerchant: 'Zara',
    category: 'shopping',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-19-2',
    date: '2024-10-19',
    amountMinor: -4900, // 49 Kč
    currency: 'CZK',
    rawMerchant: 'McDonalds Dejvice cheeseburger',
    cleanedMerchant: 'McDonalds',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-19-3',
    date: '2024-10-19',
    amountMinor: -145000, // 1 450 Kč
    currency: 'CZK',
    rawMerchant: 'Globus Cakovice velky nakup',
    cleanedMerchant: 'Globus',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-20 (Neděle - Víkend)
  {
    id: 'tx-2024-10-20-1',
    date: '2024-10-20',
    amountMinor: -11500, // 115 Kč
    currency: 'CZK',
    rawMerchant: 'Penny Market drobny nakup',
    cleanedMerchant: 'Penny Market',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-20-2',
    date: '2024-10-20',
    amountMinor: -35000, // 350 Kč
    currency: 'CZK',
    rawMerchant: 'Cinema City Slovansky dum kino listek',
    cleanedMerchant: 'Cinema City',
    category: 'entertainment_subs',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-21 (Pondělí)
  {
    id: 'tx-2024-10-21-1',
    date: '2024-10-21',
    amountMinor: -3000, // 30 Kč
    currency: 'CZK',
    rawMerchant: 'DPP SMS jizdenka',
    cleanedMerchant: 'DPP',
    category: 'transport',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-21-2',
    date: '2024-10-21',
    amountMinor: -21900, // 219 Kč
    currency: 'CZK',
    rawMerchant: 'Restaurace Kolkovna poledni menu',
    cleanedMerchant: 'Restaurace Kolkovna',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-22 (Úterý)
  {
    id: 'tx-2024-10-22-1',
    date: '2024-10-22',
    amountMinor: -8900, // 89 Kč
    currency: 'CZK',
    rawMerchant: 'Costa Coffee latte',
    cleanedMerchant: 'Costa Coffee',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-22-2',
    date: '2024-10-22',
    amountMinor: -68000, // 680 Kč
    currency: 'CZK',
    rawMerchant: 'Albert Hypermarket nakup potravin',
    cleanedMerchant: 'Albert',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-23 (Středa)
  {
    id: 'tx-2024-10-23-1',
    date: '2024-10-23',
    amountMinor: -32000, // 320 Kč
    currency: 'CZK',
    rawMerchant: 'Lekarna Benu vitaminy a kapky',
    cleanedMerchant: 'Benu Lekarna',
    category: 'health',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-23-2',
    date: '2024-10-23',
    amountMinor: -13500, // 135 Kč
    currency: 'CZK',
    rawMerchant: 'Bolt ride Praha Florenc',
    cleanedMerchant: 'Bolt',
    category: 'transport',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-24 (Čtvrtek)
  {
    id: 'tx-2024-10-24-1',
    date: '2024-10-24',
    amountMinor: -24500, // 245 Kč
    currency: 'CZK',
    rawMerchant: 'Wolt Cesko s.r.o. Pho obed',
    cleanedMerchant: 'Wolt',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-24-2',
    date: '2024-10-24',
    amountMinor: -59000, // 590 Kč
    currency: 'CZK',
    rawMerchant: 'Datart elektro drobne prislusenstvi',
    cleanedMerchant: 'Datart',
    category: 'shopping',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-25 (Pátek)
  {
    id: 'tx-2024-10-25-1',
    date: '2024-10-25',
    amountMinor: -45000, // 450 Kč
    currency: 'CZK',
    rawMerchant: 'Ceske drahy vnitrostatni jizdenka',
    cleanedMerchant: 'Ceske drahy',
    category: 'transport',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-25-2',
    date: '2024-10-25',
    amountMinor: -8500, // 85 Kč
    currency: 'CZK',
    rawMerchant: 'Kavarna v Brne cappuccino',
    cleanedMerchant: 'Kavarna',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-26 (Sobota - Víkend)
  {
    id: 'tx-2024-10-26-1',
    date: '2024-10-26',
    amountMinor: -72000, // 720 Kč
    currency: 'CZK',
    rawMerchant: 'Restaurace Brno vecere',
    cleanedMerchant: 'Restaurace',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-26-2',
    date: '2024-10-26',
    amountMinor: -4500, // 45 Kč
    currency: 'CZK',
    rawMerchant: 'Pekarna Brno kolac',
    cleanedMerchant: 'Pekarna',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-27 (Neděle - Víkend)
  {
    id: 'tx-2024-10-27-1',
    date: '2024-10-27',
    amountMinor: -45000, // 450 Kč
    currency: 'CZK',
    rawMerchant: 'Ceske drahy jizdenka zpet',
    cleanedMerchant: 'Ceske drahy',
    category: 'transport',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-27-2',
    date: '2024-10-27',
    amountMinor: -35000, // 350 Kč
    currency: 'CZK',
    rawMerchant: 'Billa Hlavni nadrazi nakup',
    cleanedMerchant: 'Billa',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-28 (Pondělí - Státní svátek)
  {
    id: 'tx-2024-10-28-1',
    date: '2024-10-28',
    amountMinor: -54000, // 540 Kč
    currency: 'CZK',
    rawMerchant: 'Wolt svatecni obed',
    cleanedMerchant: 'Wolt',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-28-2',
    date: '2024-10-28',
    amountMinor: -8900, // 89 Kč
    currency: 'CZK',
    rawMerchant: 'Costa Coffee Praha svacina',
    cleanedMerchant: 'Costa Coffee',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-29 (Úterý)
  {
    id: 'tx-2024-10-29-1',
    date: '2024-10-29',
    amountMinor: -19000, // 190 Kč
    currency: 'CZK',
    rawMerchant: 'Lidl nakup ovoce a zelenina',
    cleanedMerchant: 'Lidl',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-29-2',
    date: '2024-10-29',
    amountMinor: -3000, // 30 Kč
    currency: 'CZK',
    rawMerchant: 'DPP jizdenka',
    cleanedMerchant: 'DPP',
    category: 'transport',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-30 (Středa)
  {
    id: 'tx-2024-10-30-1',
    date: '2024-10-30',
    amountMinor: -115000, // 1 150 Kč
    currency: 'CZK',
    rawMerchant: 'Benzina Shell PHM cerpani',
    cleanedMerchant: 'Shell',
    category: 'transport',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-30-2',
    date: '2024-10-30',
    amountMinor: -21500, // 215 Kč
    currency: 'CZK',
    rawMerchant: 'Bistro Karlin obed',
    cleanedMerchant: 'Bistro Karlin',
    category: 'dining',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },

  // 2024-10-31 (Čtvrtek)
  {
    id: 'tx-2024-10-31-1',
    date: '2024-10-31',
    amountMinor: -45000, // 450 Kč
    currency: 'CZK',
    rawMerchant: 'Rohlik.cz nakup',
    cleanedMerchant: 'Rohlik.cz',
    category: 'groceries',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
  {
    id: 'tx-2024-10-31-2',
    date: '2024-10-31',
    amountMinor: -12000, // 120 Kč
    currency: 'CZK',
    rawMerchant: 'Dr. Max lekarna vitamin C',
    cleanedMerchant: 'Dr. Max',
    category: 'health',
    categorySource: 'rule_builtin',
    isSubscription: false,
  },
];

