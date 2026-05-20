import { BarcodeField } from './types';

/**
 * BARCODE_MAPPING is kept for reference but is no longer used by buildBarcodeString.
 * The barcode now uses the MH10/ANSI format (field identifiers + GS separators)
 * which matches the Python app. This table documents the old 84-char layout.
 *
 * If you need to revert to fixed-width encoding, restore the original barcodeService.ts.
 */
export const BARCODE_MAPPING: BarcodeField[] = [
  { name: 'FIXED_K',    length: 1,  location: 1  },
  { name: 'FIXED_CHARS',length: 2,  location: 2  },
  { name: 'PO_BARCODE', length: 10, location: 4  },
  { name: 'ROW_NUM',    length: 4,  location: 14 },
  { name: 'NUMERATOR',  length: 4,  location: 18 },
  { name: 'PN',         length: 24, location: 22 },
  { name: 'BATCH',      length: 12, location: 46 },
  { name: 'SN',         length: 18, location: 58 },
  { name: 'DATE_CODE',  length: 4,  location: 76 },
  { name: 'QTY',        length: 5,  location: 80 },
];

// Aligned with Python app defaults (fixedChars / rowNum match python_app.py INITIAL_LABEL_DATA)
export const INITIAL_LABEL_DATA = {
  pn:         '123-456-789',
  cat:        'CAT-99-001 REV A',
  sub:        'IAI BOARD V1',
  qtyReq:     '100',
  qtySup:     '100',
  dateCode:   '2512',
  kit:        'KIT-PMP-X',
  po:         '8822',
  batch:      '',        // empty = omit from barcode
  sn:         '',        // empty = omit from barcode
  fixedChars: 'CL',    // aligned with Python app
  rowNum:     '00010',  // aligned with Python app
  numerator:  '1',
};
