
import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { LabelData } from '../types';

interface Props {
  onImport: (data: LabelData[]) => void;
}

const ExcelImport: React.FC<Props> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws) as any[];

        const mappedData: LabelData[] = rawData.map((row, index) => ({
          pn:         String(row['P/N']           || row['pn']       || '').trim(),
          cat:        String(row['CAT']           || row['cat']      || '').trim(),
          sub:        String(row['SUB']           || row['sub']      || '').trim(),
          qtyReq:     String(row['QTY REQ.']      || row['qtyReq']  || '').trim(),
          qtySup:     String(row['QTY SUP']       || row['qtySup']  || '').trim(),
          dateCode:   String(row['D/C']           || row['dateCode']|| '2501').trim(),
          kit:        String(row['KIT']           || row['kit']     || '').trim(),
          po:         String(row['P.O.']          || row['po']      || '').trim(),
          batch:      String(row['batch number']  || row['BATCH']   || row['batch'] || '0').trim(),
          sn:         String(row['serial number'] || row['SN']      || row['sn']   || '0').trim(),
          fixedChars: 'CL',
          rowNum:     String(row['line'] || row['LINE'] || row['ROW'] || row['rowNum'] || '1').trim(),
          numerator:  String(index + 1)
        }));

        onImport(mappedData);
      } catch (err) {
        console.error("Spreadsheet import failed:", err);
        alert("Failed to parse file. Ensure headers match the template: CAT, P/N, SUB, QTY REQ., QTY SUP, D/C, KIT, P.O., batch number, serial number, FIXED, LINE, NUM");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-bold shadow-md text-sm active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Load Spreadsheet
      </button>
    </div>
  );
};

export default ExcelImport;
