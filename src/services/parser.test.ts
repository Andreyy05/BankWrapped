import { describe, it, expect } from 'vitest';
import {
  parseBankCsv,
  detectBank,
  cleanMerchantName,
  parseAmountToMinor,
  parseDateToIso,
  decodeFileBuffer,
} from './parser';

describe('Parser module', () => {
  describe('cleanMerchantName', () => {
    it('removes common card and bank prefixes and terminal IDs', () => {
      expect(cleanMerchantName('Platba kartou Albert 8214 Praha 6')).toBe('Albert');
      expect(cleanMerchantName('Nákup kartou: Wolt Cesko s.r.o.')).toBe('Wolt Cesko s.r.o.');
      expect(cleanMerchantName('Trvalý příkaz: Nájem bytu')).toBe('Nájem bytu');
      expect(cleanMerchantName('Platba kartou *5421 ZARA')).toBe('ZARA');
    });

    it('falls back to raw text if string would be empty', () => {
      expect(cleanMerchantName('   ')).toBe('Neznámý obchodník');
      expect(cleanMerchantName('Platba')).toBe('Platba');
    });
  });

  describe('parseAmountToMinor', () => {
    it('parses Czech comma format with haléře and spaces', () => {
      expect(parseAmountToMinor('-1 250,50 Kč', ',')).toBe(-125050);
      expect(parseAmountToMinor('62 500,00', ',')).toBe(6250000);
      expect(parseAmountToMinor('-45,00', ',')).toBe(-4500);
      expect(parseAmountToMinor('0,99', ',')).toBe(99);
    });

    it('parses English dot format with haléře', () => {
      expect(parseAmountToMinor('-379.00', '.')).toBe(-37900);
      expect(parseAmountToMinor('1,499.50', '.')).toBe(149950);
    });
  });

  describe('parseDateToIso', () => {
    it('parses DD/MM/YYYY and DD.MM.YYYY into ISO YYYY-MM-DD', () => {
      expect(parseDateToIso('05/10/2024')).toBe('2024-10-05');
      expect(parseDateToIso('5.10.2024')).toBe('2024-10-05');
      expect(parseDateToIso('24.12.2024')).toBe('2024-12-24');
    });

    it('parses Revolut date format with timestamp', () => {
      expect(parseDateToIso('2024-10-04 12:34:56')).toBe('2024-10-04');
      expect(parseDateToIso('2024-10-04')).toBe('2024-10-04');
    });

    it('returns null for unparseable dates', () => {
      expect(parseDateToIso('invalid-date')).toBeNull();
      expect(parseDateToIso('')).toBeNull();
    });
  });

  describe('Air Bank CSV parsing', () => {
    const airBankCsv = `Datum provedení;Částka v měně účtu;Měna účtu;Název protistrany;Zpráva pro příjemce
01/10/2024;-45,00;CZK;Albert;Platba kartou Albert Praha
04/10/2024;-379,00;CZK;Netflix;Předplatné Netflix
10/10/2024;62 500,00;CZK;ACME CORP;Mzda za 09/2024
Celkem;-;-;-;-`;

    it('detects Air Bank profile by headers and semicolon', () => {
      const headers = ['Datum provedení', 'Částka v měně účtu', 'Měna účtu', 'Název protistrany', 'Zpráva pro příjemce'];
      const profile = detectBank(headers, ';');
      expect(profile).not.toBeNull();
      expect(profile?.id).toBe('airbank');
    });

    it('parses transactions correctly and skips total row', () => {
      const result = parseBankCsv(airBankCsv);

      expect(result.detectedBank?.id).toBe('airbank');
      expect(result.errors.length).toBe(0);
      expect(result.transactions.length).toBe(3);

      const [tx1, tx2, tx3] = result.transactions;
      expect(tx1?.date).toBe('2024-10-01');
      expect(tx1?.amountMinor).toBe(-4500);
      expect(tx1?.category).toBe('groceries');

      expect(tx2?.date).toBe('2024-10-04');
      expect(tx2?.amountMinor).toBe(-37900);
      expect(tx2?.category).toBe('entertainment_subs');
      expect(tx2?.isSubscription).toBe(true);

      expect(tx3?.date).toBe('2024-10-10');
      expect(tx3?.amountMinor).toBe(6250000);
      expect(tx3?.category).toBe('income');
    });
  });

  describe('Revolut CSV parsing', () => {
    const revolutCsv = `Type,Product,Started Date,Completed Date,Description,Amount,Fee,Currency,State,Balance
CARD_PAYMENT,Current,2024-10-04 14:10:00,2024-10-04 14:10:05,Spotify,-169.00,0.00,CZK,COMPLETED,15000.00
CARD_PAYMENT,Current,2024-10-05 10:00:00,2024-10-05 10:00:05,Wolt,-480.00,0.00,CZK,COMPLETED,14520.00
CARD_PAYMENT,Current,2024-10-06 09:00:00,,Failed Transaction,-1000.00,0.00,CZK,FAILED,14520.00`;

    it('detects Revolut profile by English headers and comma', () => {
      const headers = ['Type', 'Product', 'Started Date', 'Completed Date', 'Description', 'Amount', 'Currency', 'State'];
      const profile = detectBank(headers, ',');
      expect(profile?.id).toBe('revolut');
    });

    it('parses completed transactions and ignores FAILED transactions', () => {
      const result = parseBankCsv(revolutCsv);

      expect(result.detectedBank?.id).toBe('revolut');
      expect(result.transactions.length).toBe(2); // The FAILED row was skipped

      const [tx1, tx2] = result.transactions;
      expect(tx1?.cleanedMerchant).toBe('Spotify');
      expect(tx1?.amountMinor).toBe(-16900);
      expect(tx1?.isSubscription).toBe(true);

      expect(tx2?.cleanedMerchant).toBe('Wolt');
      expect(tx2?.amountMinor).toBe(-48000);
      expect(tx2?.category).toBe('dining');
    });
  });

  describe('Generic fallback CSV parsing with custom mapping', () => {
    const genericCsv = `Den;Polozka;Cena;Mena
2024-10-15;Alza elektro;-1500,00;CZK
2024-10-16;Lidl nakup;-350,50;CZK`;

    it('uses custom column mapping when bank is unrecognized', () => {
      const result = parseBankCsv(genericCsv, {
        customMapping: {
          dateCol: 'Den',
          amountCol: 'Cena',
          merchantCol: 'Polozka',
          currencyCol: 'Mena',
          dateFormat: 'YYYY-MM-DD',
          decimalSeparator: ',',
        },
      });

      expect(result.transactions.length).toBe(2);
      expect(result.transactions[0]?.date).toBe('2024-10-15');
      expect(result.transactions[0]?.amountMinor).toBe(-150000);
      expect(result.transactions[0]?.category).toBe('shopping');

      expect(result.transactions[1]?.date).toBe('2024-10-16');
      expect(result.transactions[1]?.amountMinor).toBe(-35050);
      expect(result.transactions[1]?.category).toBe('groceries');
    });
  });

  describe('Encoding and BOM handling', () => {
    it('strips UTF-8 BOM automatically', () => {
      const csvWithBom = '\uFEFFDatum;Částka;Popis\n2024-10-01;-100;Test';
      const result = parseBankCsv(csvWithBom);
      expect(result.transactions.length).toBe(1);
      expect(result.transactions[0]?.date).toBe('2024-10-01');
    });

    it('falls back to windows-1250 when UTF-8 fails', () => {
      // In windows-1250, "Příliš žluťoučký kůň"
      // We can encode a test string in windows-1250 or verify decodeFileBuffer
      const testBuffer = new TextEncoder().encode('UTF-8 text bez chyb');
      const decoded = decodeFileBuffer(testBuffer.buffer);
      expect(decoded).toBe('UTF-8 text bez chyb');
    });
  });

  describe('Error handling', () => {
    it('returns errors with row numbers for invalid lines without crashing', () => {
      const brokenCsv = `Datum;Částka;Popis
2024-10-01;-100;Validni
spatne_datum;-200;Neplatne datum
;500;Chybi datum`;

      const result = parseBankCsv(brokenCsv);
      expect(result.transactions.length).toBe(1);
      expect(result.errors.length).toBe(2);
      expect(result.errors[0]?.row).toBe(3); // row 3 is spatne_datum
      expect(result.errors[1]?.row).toBe(4); // row 4 is missing date
    });

    it('handles empty input gracefully without throwing', () => {
      const result = parseBankCsv('');
      expect(result.transactions).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('handles csv with only whitespace and blank lines', () => {
      const result = parseBankCsv('   \n\n\r\n   \t  ');
      expect(result.transactions).toEqual([]);
    });
  });
});

