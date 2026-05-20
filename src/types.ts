
export interface LabelData {
  pn: string;
  cat: string;
  sub: string;
  qtyReq: string;
  qtySup: string;
  dateCode: string; // YYWW format
  kit: string;
  po: string;
  batch: string;
  sn: string;
  fixedChars: string;
  rowNum: string;
  numerator: string;
}

export interface BarcodeField {
  name: string;
  length: number;
  location: number; // 1-based START position in the 84-char string
}

export interface ValidationErrors {
  [key: string]: string | undefined;
}
