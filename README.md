# BankWrapped

> A privacy-first personal finance insights and monthly review dashboard.
> Analyzujte bankovní výpisy lokálně přímo v prohlížeči. Žádný backend, žádné odesílání dat na servery, nulové sledování.

---

## O projektu

**BankWrapped** je webová single-page aplikace (SPA) zaměřená na moderní fintech uživatelské rozhraní a **ochranu soukromí**.

Uživatel nahraje CSV výpis ze své banky nebo vyzkouší předpřipravená demo data. Aplikace data lokálně zpracuje, zkategorizuje a spočítá přehledné statistiky, interaktivní grafy a umožní exportovat rekapitulaci měsíce jako grafickou kartu (1080×1920 px) ve formátu PNG.

---

## Záruka soukromí

- **Klientská architektura:** Veškeré zpracování, výpočty a vykreslování probíhají výhradně v paměti vašeho prohlížeče (ve Web Workeru pro velké soubory).
- **Bez síťových požadavků:** Aplikace nevolá žádná externí API, neobsahuje žádné sledovací skripty, telemetrii ani analytiku.
- **Content Security Policy (CSP):** V produkčním sestavení je vložena bezpečnostní hlavička `connect-src 'none'`, která znemožňuje prohlížeči odesílat požadavky do sítě.
- **Lokální fonty:** Používá se proměnný font Inter Variable bundlovaný přímo v projektu bez externích CDN.
- **Bez ukládání výpisů:** Surové transakce se neukládají do trvalého úložiště. Do prohlížeče se ukládají pouze vytvořená pravidla kategorií a preference motivu.

---

## Klíčové funkce

### 1. Import a bankovní profily
- Podpora formátů českých bank (Air Bank, Revolut, Česká spořitelna, ČSOB, Fio banka).
- Univerzální CSV mapovač pro přiřazení sloupců u jakéhokoliv nepodporovaného výpisu.
- Automatická detekce kódování (UTF-8, Windows-1250) a odstranění BOM.
- Web Worker pro plynulé zpracování větších souborů.

### 2. Finanční logika
- Celočíselná reprezentace částek v haléřích pro eliminaci zaokrouhlovacích chyb v plovoucí řádové čárce.
- Automatické vyřazení vnitrofiremních a vlastních převodů z výdajů i příjmů.
- Správné započtení refundací a vratek.

### 3. Pravidlová kategorizace
- 10 základních kategorií s přesným vyhledáváním slovních hranic.
- Uživatelská pravidla pro konkrétní transakci i pro celého obchodníka s lokální perzistencí.

### 4. Přehledový dashboard
- KPI karty: celkové výdaje, celkové příjmy, bilance a míra úspor.
- Donut graf kategorií s možností filtrování tabulky kliknutím.
- Graf denních výdajů s vyznačením nejnákladnějšího dne.
- Analytické metriky: nejčastější obchodníci, Latte factor (drobné výdaje), předplatná, srovnání víkendů a všedních dnů.
- Rychlá tabulka s vyhledáváním, řazením a stránkováním.

### 5. Grafická rekapitulace měsíce
- Vizuální karta 9:16 (1080×1920 px).
- Režim soukromí pro skrytí přesných částek.
- Export do PNG ve vysokém rozlišení.

---

## Použité technologie

- React 19, TypeScript
- Vite
- Tailwind CSS
- Inter Variable font
- Recharts
- PapaParse
- date-fns
- html-to-image
- Vitest

---

## Spuštění projektu

```bash
# Instalace závislostí
npm install

# Spuštění vývojového serveru
npm run dev

# Spuštění testů
npm test

# Produkční sestavení
npm run build
```
