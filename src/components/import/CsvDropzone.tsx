import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cs } from '@/i18n/cs';
import { decodeFileBuffer, parseBankCsv } from '@/services/parser';
import { ColumnMapping, ParseResult, UserCategoryRule } from '@/types';
import { ColumnMappingModal } from './ColumnMappingModal';
import Papa from 'papaparse';

interface CsvDropzoneProps {
  onParsed: (result: ParseResult) => void;
  userRules?: UserCategoryRule[];
}

export const CsvDropzone: React.FC<CsvDropzoneProps> = ({ onParsed, userRules = [] }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Column mapping modal state for unrecognized CSVs
  const [unrecognizedCsv, setUnrecognizedCsv] = useState<string | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvSampleRows, setCsvSampleRows] = useState<string[][]>([]);
  const [initialMapping, setInitialMapping] = useState<ColumnMapping | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setErrorMessage(null);
      setInfoMessage(null);

      // 1. Validate file extension
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setErrorMessage(cs.import.fileErrorExtension);
        return;
      }

      // 2. Validate file size (max 10 MB)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setErrorMessage(cs.import.fileErrorSize);
        return;
      }

      try {
        const buffer = await file.arrayBuffer();
        const csvText = decodeFileBuffer(buffer);

        const parseResult = parseBankCsv(csvText, { userRules });

        // If a bank is detected or transactions were parsed directly
        if (parseResult.detectedBank || parseResult.transactions.length > 0) {
          onParsed(parseResult);
          setInfoMessage(
            `Úspěšně načteno ${parseResult.transactions.length} transakcí${
              parseResult.detectedBank ? ` (profil: ${parseResult.detectedBank.name})` : ''
            }.`
          );
        } else {
          // Trigger column mapping modal
          const preview = Papa.parse<string[]>(csvText, {
            header: false,
            preview: 6,
            skipEmptyLines: 'greedy',
          });
          const rows = preview.data;
          const headers = rows[0] || [];
          const samples = rows.slice(1);

          setUnrecognizedCsv(csvText);
          setCsvHeaders(headers);
          setCsvSampleRows(samples);
          setInitialMapping({
            dateCol: headers[0] || '',
            amountCol: headers[1] || '',
            merchantCol: headers[2] || '',
            currencyCol: undefined,
            dateFormat: 'DD.MM.YYYY',
            decimalSeparator: ',',
          });
        }
      } catch (err) {
        setErrorMessage(
          `${cs.import.parsingError} ${err instanceof Error ? err.message : 'Neznámá chyba'}`
        );
      }
    },
    [onParsed, userRules]
  );

  const handleCustomMappingConfirm = (mapping: ColumnMapping) => {
    if (!unrecognizedCsv) return;
    const result = parseBankCsv(unrecognizedCsv, {
      userRules,
      customMapping: mapping,
    });
    setUnrecognizedCsv(null);
    onParsed(result);
    setInfoMessage(`Úspěšně načteno ${result.transactions.length} transakcí.`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      void processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-card p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors select-none ${
          isDragging
            ? 'border-accent bg-accent-subtle'
            : 'border-border-strong bg-bg-card hover:border-accent hover:bg-bg-subtle/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="p-2.5 rounded-btn bg-accent-subtle text-accent mb-2.5">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h3 className="text-xs font-semibold text-text-primary mb-1">
          {cs.import.dropzoneTitle}
        </h3>
        <p className="text-xs text-text-secondary max-w-sm mb-3">
          {cs.import.dropzoneSubtitle}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <FileText className="w-3.5 h-3.5" />
          <span>{cs.import.supportedBanks}</span>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 text-xs rounded-btn bg-danger-subtle text-danger border border-danger/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success info */}
      {infoMessage && (
        <div className="flex items-center gap-2 p-2.5 text-xs rounded-btn bg-income-subtle text-income border border-income/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Column mapping modal */}
      {unrecognizedCsv && initialMapping && (
        <ColumnMappingModal
          isOpen={true}
          headers={csvHeaders}
          sampleRows={csvSampleRows}
          initialMapping={initialMapping}
          onConfirm={handleCustomMappingConfirm}
          onCancel={() => setUnrecognizedCsv(null)}
        />
      )}
    </div>
  );
};
