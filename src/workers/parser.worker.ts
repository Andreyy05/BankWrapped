import { parseBankCsv, ParseCsvOptions } from '@/services/parser';
import { ParseResult } from '@/types';

export interface WorkerMessageData {
  csvText: string;
  options?: ParseCsvOptions;
}

export interface WorkerResponseData {
  success: boolean;
  result?: ParseResult;
  error?: string;
}

self.onmessage = (event: MessageEvent<WorkerMessageData>) => {
  try {
    const { csvText, options } = event.data;
    const result = parseBankCsv(csvText, options);
    self.postMessage({ success: true, result } satisfies WorkerResponseData);
  } catch (err) {
    self.postMessage({
      success: false,
      error: err instanceof Error ? err.message : 'Neznámá chyba při zpracování výpisu.',
    } satisfies WorkerResponseData);
  }
};

