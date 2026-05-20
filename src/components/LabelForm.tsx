
import React, { useMemo } from 'react';
import { LabelData } from '../types';
import { validateLabelData } from '../services/barcodeService';

interface Props {
  data: LabelData;
  onChange: (newData: LabelData) => void;
}

const LabelForm: React.FC<Props> = ({ data, onChange }) => {
  const errors = useMemo(() => validateLabelData(data), [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  const getInputClass = (fieldName: string) => {
    const hasError = !!errors[fieldName];
    return `w-full px-3 py-2 border rounded-lg focus:ring-2 transition-all outline-none text-sm font-medium ${
      hasError 
        ? "border-red-500 bg-red-50 focus:ring-red-200" 
        : "border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/30"
    }`;
  };

  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1";
  const errorClass = "text-[10px] text-red-600 mt-1 font-medium";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      {/* Identification Column */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
          <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-[10px] font-bold">1</div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Part Identification</h4>
        </div>
        
        <div>
          <label className={labelClass}>PL / Part Number <span className="text-indigo-400 ml-1">Len 24</span></label>
          <input type="text" name="pn" value={data.pn} onChange={handleChange} className={getInputClass('pn')} maxLength={24} placeholder="e.g. 123-456-789" />
          {errors.pn && <p className={errorClass}>{errors.pn}</p>}
        </div>

        <div>
          <label className={labelClass}>IAI Catalog / Revision</label>
          <input type="text" name="cat" value={data.cat} onChange={handleChange} className={getInputClass('cat')} placeholder="CAT-99-001 REV A" />
        </div>

        <div>
          <label className={labelClass}>Manufacturer / Subtitle (SUB)</label>
          <input type="text" name="sub" value={data.sub} onChange={handleChange} className={getInputClass('sub')} placeholder="e.g. Colint Electronics" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Qty Required</label>
            <input type="text" name="qtyReq" value={data.qtyReq} onChange={handleChange} className={getInputClass('qtyReq')} placeholder="100" />
          </div>
          <div>
            <label className={labelClass}>Qty Supplied <span className="text-indigo-400 ml-1">Len 5</span></label>
            <input type="text" name="qtySup" value={data.qtySup} onChange={handleChange} className={getInputClass('qtySup')} maxLength={5} placeholder="100" />
            {errors.qtySup && <p className={errorClass}>{errors.qtySup}</p>}
          </div>
        </div>
      </div>

      {/* Tracking Column */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
          <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center text-[10px] font-bold">2</div>
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Barcode Tracking Data</h4>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1">
            <label className={labelClass}>Fixed</label>
            <input type="text" name="fixedChars" value={data.fixedChars} onChange={handleChange} className={getInputClass('fixedChars')} maxLength={2} placeholder="CO" />
          </div>
          <div className="col-span-3">
            <label className={labelClass}>P.O. Number <span className="text-indigo-400 ml-1">Len 10</span></label>
            <input type="text" name="po" value={data.po} onChange={handleChange} className={getInputClass('po')} maxLength={10} placeholder="8822" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Line (Row) <span className="text-indigo-400 ml-1">Len 4</span></label>
            <input type="text" name="rowNum" value={data.rowNum} onChange={handleChange} className={getInputClass('rowNum')} maxLength={4} placeholder="1" />
          </div>
          <div>
            <label className={labelClass}>Numerator <span className="text-indigo-400 ml-1">Len 4</span></label>
            <input type="text" name="numerator" value={data.numerator} onChange={handleChange} className={getInputClass('numerator')} maxLength={4} placeholder="1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className={labelClass}>Batch No <span className="text-indigo-400 ml-1 text-[8px] italic tracking-normal">(Optional, '0' = Empty)</span></label>
            <input type="text" name="batch" value={data.batch} onChange={handleChange} className={`${getInputClass('batch')} bg-amber-50/20`} maxLength={12} />
            {errors.batch && <p className={errorClass}>{errors.batch}</p>}
          </div>
          <div>
            <label className={labelClass}>Serial No <span className="text-indigo-400 ml-1 text-[8px] italic tracking-normal">(Optional, '0' = Empty)</span></label>
            <input type="text" name="sn" value={data.sn} onChange={handleChange} className={`${getInputClass('sn')} bg-indigo-50/20 ring-1 ring-indigo-100`} maxLength={18} />
            {errors.sn && <p className={errorClass}>{errors.sn}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date Code <span className="text-indigo-400 ml-1">YYWW</span></label>
            <input type="text" name="dateCode" value={data.dateCode} onChange={handleChange} className={getInputClass('dateCode')} maxLength={4} placeholder="2501" />
            {errors.dateCode && <p className={errorClass}>{errors.dateCode}</p>}
          </div>
          <div>
            <label className={labelClass}>Mfg P/N (KIT)</label>
            <input type="text" name="kit" value={data.kit} onChange={handleChange} className={getInputClass('kit')} placeholder="KIT-PMP-X" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelForm;
