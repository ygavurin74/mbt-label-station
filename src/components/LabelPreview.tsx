
import React from 'react';
import { LabelData } from '../types';
import { buildBarcodeString } from '../services/barcodeService';
import { DatamatrixBarcode } from './DatamatrixBarcode';

interface Props {
  data: LabelData;
}

const LabelPreview: React.FC<Props> = ({ data }) => {
  const barcodeString = buildBarcodeString(data);
  const trackingCode = `${data.fixedChars}${data.po}-${data.rowNum}/${data.numerator}`;

  // Helper for visual debugger
  const snPart = barcodeString.substring(57, 75); // Pos 58-75 (0-based 57-75)

  return (
    <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between w-full mb-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sticker Preview</h3>
        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">50x65mm Vertical</span>
      </div>
      
      {/* Physical Frame Simulation: 50mm x 65mm */}
      <div 
        style={{ width: '50mm', height: '65mm' }} 
        className="bg-white border border-black flex flex-col p-4 font-serif leading-tight shadow-inner overflow-hidden box-border"
      >
        {/* Header Section */}
        <div className="flex items-baseline justify-between border-b border-black pb-1 mb-2">
          <span className="font-bold text-[10px] uppercase tracking-tighter">Colint Ltd</span>
          <span className="font-bold text-[6px] uppercase opacity-60">Traceability Tag</span>
        </div>
        
        {/* Data Fields */}
        <div className="flex-1 flex flex-col gap-0.5 mt-1 overflow-hidden">
          <div className="flex items-baseline leading-tight">
            <span className="font-bold underline min-w-[2.4rem] text-[9px]">PL/PN:</span> 
            <span className="ml-1 truncate uppercase font-sans text-[9px] font-bold tracking-tight text-indigo-950">{data.pn}</span>
          </div>
          <div className="flex items-baseline leading-tight">
            <span className="font-bold underline min-w-[2.4rem] text-[8px]">IAI:</span> 
            <span className="ml-1 truncate uppercase font-sans text-[8px] font-medium">{data.cat}</span>
          </div>
          <div className="flex items-baseline leading-tight min-h-[12px]">
            {/* SUB: prefix removed */}
            <span className="uppercase font-sans text-[8px] font-medium">{data.sub}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-x-2">
            <div className="flex items-baseline leading-tight">
              <span className="font-bold underline min-w-[2.4rem] text-[8px]">P.O.:</span> 
              <span className="ml-1 truncate uppercase font-sans text-[8px]">{data.po}</span>
            </div>
            {/* D/C shifted right with pl-4 */}
            <div className="flex items-baseline leading-tight pl-4">
              <span className="font-bold underline min-w-[1.4rem] text-[8px]">D/C:</span> 
              <span className="ml-1 uppercase font-sans text-[8px] font-bold">{data.dateCode}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-2">
            <div className="flex items-baseline leading-tight">
              <span className="font-bold underline min-w-[2.4rem] text-[8px]">REQ:</span> 
              <span className="ml-1 uppercase font-sans text-[8px]">{data.qtyReq}</span>
            </div>
            <div className="flex items-baseline leading-tight pl-4">
              <span className="font-bold underline min-w-[1.4rem] text-[8px]">SUP:</span> 
              <span className="ml-1 uppercase font-sans text-[8px] font-bold">{data.qtySup}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2">
            <div className="flex items-baseline leading-tight">
              <span className="font-bold underline min-w-[2.4rem] text-[8px]">B/N:</span> 
              <span className="ml-1 truncate uppercase font-sans text-[8px] font-bold">{data.batch}</span>
            </div>
            <div className="flex items-baseline leading-tight pl-4">
              <span className="font-bold underline min-w-[1.4rem] text-[8px]">S/N:</span> 
              <span className="ml-1 truncate uppercase font-sans text-[8px] font-bold">{data.sn}</span>
            </div>
          </div>

          <div className="flex items-baseline leading-tight mt-0.5">
            <span className="font-bold underline min-w-[2.4rem] text-[8px]">KIT:</span> 
            <span className="ml-1 truncate uppercase font-sans text-[8px] font-medium">{data.kit}</span>
          </div>
        </div>

        {/* Bottom Barcode Section */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex flex-col items-center justify-center">
          <div className="w-14 h-14 max-h-[14mm] bg-white">
             <DatamatrixBarcode 
               text={barcodeString} 
               className="w-full h-full object-contain image-rendering-pixelated"
             />
          </div>
          <span className="text-[5px] text-slate-500 font-bold opacity-80 truncate w-full text-center font-mono mt-0.5">
            {trackingCode}
          </span>
        </div>
      </div>
      
      {/* 84-Char Debugger Map */}
      <div className="mt-4 p-4 bg-slate-900 rounded-xl w-full border border-slate-700 shadow-inner">
        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Data Matrix Segments (84 Chars)</h4>
        <div className="space-y-3 font-mono">
           <div className="flex flex-col">
              <span className="text-[8px] text-indigo-400 font-bold mb-1 uppercase">Full Content Buffer:</span>
              <div className="text-[10px] text-white break-all leading-tight bg-slate-800 p-2 rounded border border-slate-700 select-all">
                {barcodeString}
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-3 text-[9px]">
              <div className="flex flex-col p-2 bg-slate-800/50 rounded border border-indigo-900/30">
                 <span className="text-indigo-400 font-bold uppercase mb-1">SN (Loc 58)</span>
                 <span className="text-white font-bold tracking-widest truncate">{snPart}</span>
                 <span className="text-[7px] text-slate-500 mt-1 uppercase">Length: 18 chars</span>
              </div>
              <div className="flex flex-col p-2 bg-slate-800/50 rounded border border-indigo-900/30">
                 <span className="text-indigo-400 font-bold uppercase mb-1">DC (Loc 76)</span>
                 <span className="text-white font-bold tracking-widest truncate">{data.dateCode}</span>
                 <span className="text-[7px] text-slate-500 mt-1 uppercase">Length: 4 chars</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LabelPreview;
