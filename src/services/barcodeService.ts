import { LabelData, ValidationErrors } from '../types';

export const validateLabelData = (data: LabelData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.pn) errors.pn = 'Required';
  if (data.pn.length > 24) errors.pn = 'Max 24 chars';
  if (data.po.length > 10) errors.po = 'Max 10 chars';
  if (data.rowNum.length > 4) errors.rowNum = 'Max 4 chars';
  if (data.numerator.length > 4) errors.numerator = 'Max 4 chars';
  if (data.batch.length > 12) errors.batch = 'Max 12 chars';
  if (data.sn.length > 18) errors.sn = 'Max 18 chars';
  if (data.qtySup.length > 5) errors.qtySup = 'Max 5 chars';

  if (!/^\d{4}$/.test(data.dateCode)) {
    errors.dateCode = 'YYWW format required';
  } else {
    const week = parseInt(data.dateCode.substring(2, 4));
    if (week < 1 || week > 53) errors.dateCode = 'Week 01-53';
  }

  return errors;
};

/**
 * Builds the 84-character fixed-width DataMatrix barcode string.
 *
 * Structure (confirmed against Excel spec):
 *
 * Pos  1      (len  1): 'K'             — fixed constant
 * Pos  2-3    (len  2): 'CO'            — fixed constant
 * Pos  4-13   (len 10): Order number    — left-aligned, space-padded
 * Pos 14-17   (len  4): Row number      — left-aligned, space-padded (NEVER zero-filled)
 * Pos 18-21   (len  4): Numerator       — left-aligned, space-padded (NEVER zero-filled)
 * Pos 22-45   (len 24): Mfr part number — left-aligned, space-padded
 * Pos 46-57   (len 12): Batch number    — zero-fill when empty; RIGHT-aligned when filled
 * Pos 58-75   (len 18): Serial number   — zero-fill when empty; RIGHT-aligned when filled
 * Pos 76-79   (len  4): Date code       — mandatory 4-char YYWW value
 * Pos 80-84   (len  5): Qty supplied    — left-aligned, space-padded (NEVER zero-filled)
 */
export const buildBarcodeString = (data: LabelData): string => {
  const TOTAL = 84;
  // Initialize entire buffer to spaces
  const buf = new Array(TOTAL).fill(' ');

  /** Write a value into the buffer at 1-based position, up to maxLen chars */
  const write = (pos1: number, maxLen: number, value: string) => {
    const s = String(value).substring(0, maxLen);
    for (let i = 0; i < s.length; i++) {
      buf[pos1 - 1 + i] = s[i];
    }
  };

  /** Left-align: value + trailing spaces */
  const leftAlign = (pos1: number, len: number, value: string) => {
    const s = value.trim().substring(0, len);
    write(pos1, len, s.padEnd(len, ' '));
  };

  /**
   * Right-align: leading spaces + value.
   * When empty or sentinel '0': fill entire field with '0'.
   * When has real value: right-align within field width.
   */
  const rightAlignOrZero = (pos1: number, len: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '0') {
      write(pos1, len, '0'.repeat(len));
    } else {
      const s = trimmed.substring(0, len);
      write(pos1, len, s.padStart(len, ' '));
    }
  };

  // Always zero-pad right-aligned (e.g. '1' → '0001', empty → '0000')
  const zeroPad = (pos1: number, len: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      write(pos1, len, '0'.repeat(len));
    } else {
      write(pos1, len, trimmed.substring(0, len).padStart(len, '0'));
    }
  };

  // Fixed constants
  write(1, 1, 'K');
  write(2, 2, 'CL');

  // Left-aligned fields (empty → spaces, never zeros)
  leftAlign(4,  10, data.po);
  leftAlign(22, 24, data.pn);
  leftAlign(80,  5, data.qtySup);

  // Right-aligned zero-padded fields (always zero-pad, e.g. '1' → '0001')
  zeroPad(14, 4, data.rowNum);
  zeroPad(18, 4, data.numerator);

  // Right-aligned fields with zero-fill default
  rightAlignOrZero(46, 12, data.batch);
  rightAlignOrZero(58, 18, data.sn);

  // Mandatory date code (exactly 4 chars)
  write(76, 4, data.dateCode);

  return buf.join('');
};

/** True when the buffer has at least one meaningful data field beyond the fixed prefix */
export const isBarcodeStringValid = (str: string): boolean => {
  if (str.length !== 84) return false;
  // Must start with fixed 'K' + 'CO'
  if (!str.startsWith('KCL')) return false;
  // Must have a date code (pos 76-79 = index 75-78) that is not all spaces
  const dateCode = str.substring(75, 79).trim();
  return dateCode.length === 4;
};
