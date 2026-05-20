
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import { LabelData } from './types';
import { INITIAL_LABEL_DATA } from './constants';
import LabelForm from './components/LabelForm';
import LabelPreview from './components/LabelPreview';
import ExcelImport from './components/ExcelImport';
import { buildBarcodeString, validateLabelData } from './services/barcodeService';
import { DatamatrixBarcode } from './components/DatamatrixBarcode';

const LABELS_PER_PAGE = 15;
const STORAGE_KEY = 'colint_label_station_data_v4';

const LabelPrintContent: React.FC<{ data: LabelData }> = ({ data }) => {
  const barcodeString = buildBarcodeString(data);
  const trackingCode = `${data.fixedChars}${data.po}-${data.rowNum}/${data.numerator}`;

  const labelTextClass = "label-font text-[9px] leading-tight text-black break-all";
  const headerTextClass = "label-font text-[10px] uppercase tracking-tighter text-black";
  const fieldLabelClass = "label-font underline min-w-[1.8rem] text-[8px] text-black shrink-0";

  return (
    // Grid cell is 56mm × 70mm; label content is 50mm × 65mm, centred inside
    <div className="flex items-center justify-center w-full h-full">
      <div
        className="bg-white border border-black"
        style={{ width: '50mm', height: '65mm', boxSizing: 'border-box',
                 position: 'relative', overflow: 'visible' }}
      >
        {/* All content padded, fields stop before barcode zone */}
        <div style={{ position: 'absolute', top: '2mm', left: '2mm', right: '2mm', bottom: '20mm' }}>
          {/* Header */}
          <div style={{ borderBottom: '1px solid black', marginBottom: '1mm', paddingBottom: '0.5mm' }}
               className="flex items-baseline justify-between">
            <span className={headerTextClass}>Colint Ltd</span>
            <span className="label-font text-[6px] uppercase font-bold text-black opacity-80">Traceability Tag</span>
          </div>
          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1mm', overflow: 'hidden', height: 'calc(100% - 7mm)' }}>
            <div className="flex items-start gap-1">
              <span className={fieldLabelClass}>PL/PN:</span>
              <span className={labelTextClass}>{data.pn}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={fieldLabelClass}>IAI:</span>
              <span className="label-font text-[8.5px] uppercase">{data.cat}</span>
            </div>
            <div className="flex items-center" style={{ minHeight: '3mm' }}>
              <span className="label-font text-[8.5px] uppercase">{data.sub}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-1">
              <div className="flex items-center gap-1">
                <span className={fieldLabelClass}>P.O.:</span>
                <span className="label-font text-[8.5px]">{data.po}</span>
              </div>
              <div className="flex items-center gap-1 pl-4">
                <span className="label-font underline min-w-[1.4rem] text-[8px] shrink-0">D/C:</span>
                <span className="label-font text-[8px]">{data.dateCode}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-1">
              <div className="flex items-center gap-1">
                <span className={fieldLabelClass}>REQ:</span>
                <span className="label-font text-[8.5px]">{data.qtyReq}</span>
              </div>
              <div className="flex items-center gap-1 pl-4">
                <span className="label-font underline min-w-[1.4rem] text-[8px] shrink-0">SUP:</span>
                <span className="label-font text-[8px]">{data.qtySup}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-1">
              <div className="flex items-center gap-1">
                <span className={fieldLabelClass}>B/N:</span>
                <span className="label-font text-[8.5px]">{data.batch}</span>
              </div>
              <div className="flex items-center gap-1 pl-4">
                <span className="label-font underline min-w-[1.4rem] text-[8px] shrink-0">S/N:</span>
                <span className="label-font text-[8px]">{data.sn}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className={fieldLabelClass}>KIT:</span>
              <span className="label-font text-[8.5px]">{data.kit}</span>
            </div>
          </div>
        </div>

        {/* Barcode — absolutely pinned, raised enough to keep tracking text clear of edge */}
        <div style={{ position: 'absolute', bottom: '4mm', left: '2mm', right: '2mm',
                      height: '14mm', borderTop: '1px solid #e5e7eb',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '0.5mm' }}>
          <div style={{ width: '9mm', height: '9mm' }}>
            <DatamatrixBarcode
              text={barcodeString}
              className="w-full h-full object-contain image-rendering-pixelated"
            />
          </div>
          <div className="label-font text-[6px] tracking-tighter text-center truncate w-full">
            {trackingCode}
          </div>
        </div>
      </div>
    </div>
  );
};

const A4Page: React.FC<{ labels: LabelData[] }> = ({ labels }) => (
  <div className="a4-page">
    {labels.map((lbl, idx) => (
      <LabelPrintContent key={idx} data={lbl} />
    ))}
  </div>
);

const App: React.FC = () => {
  const [labels, setLabels] = useState<LabelData[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.labels || [{ ...INITIAL_LABEL_DATA }];
      } catch (e) {
        return [{ ...INITIAL_LABEL_DATA }];
      }
    }
    return [{ ...INITIAL_LABEL_DATA }];
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'editor' | 'sheet'>('editor');
  const [isExporting, setIsExporting] = useState(false);
  const sheetContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ labels, activeIndex }));
  }, [labels, activeIndex]);

  const labelPages = useMemo(() => {
    const pages: LabelData[][] = [];
    for (let i = 0; i < labels.length; i += LABELS_PER_PAGE) {
      pages.push(labels.slice(i, i + LABELS_PER_PAGE));
    }
    return pages;
  }, [labels]);

  const currentLabel = useMemo(() => labels[activeIndex] || labels[0], [labels, activeIndex]);

  const handleUpdateLabel = useCallback((newData: LabelData) => {
    setLabels(prev => {
      const updated = [...prev];
      updated[activeIndex] = newData;
      return updated;
    });
  }, [activeIndex]);

  const handleAddLabel = useCallback(() => {
    setLabels(prev => [...prev, { ...INITIAL_LABEL_DATA }]);
    setActiveIndex(labels.length);
    setViewMode('editor');
  }, [labels.length]);

  const handleDuplicateLabel = useCallback((index: number) => {
    setLabels(prev => {
      const updated = [...prev];
      const clone = { ...updated[index] };
      updated.splice(index + 1, 0, clone);
      return updated;
    });
    setActiveIndex(index + 1);
  }, []);

  const handleDeleteLabel = useCallback((index: number) => {
    if (labels.length <= 1) {
      setLabels([{ ...INITIAL_LABEL_DATA }]);
      setActiveIndex(0);
      return;
    }
    setLabels(prev => prev.filter((_, i) => i !== index));
    if (activeIndex >= index && activeIndex > 0) setActiveIndex(prev => prev - 1);
  }, [labels.length, activeIndex]);

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all labels?')) {
      setLabels([{ ...INITIAL_LABEL_DATA }]);
      setActiveIndex(0);
    }
  }, []);

  const handleImport = useCallback((newLabels: LabelData[]) => {
    setLabels(newLabels);
    setActiveIndex(0);
    setViewMode('editor');
  }, []);

  /**
   * PDF Export using browser native print — preserves CSS mm values exactly.
   * User selects "Save as PDF" in the print dialog.
   */
  const handleExportPdf = async () => {
    if (viewMode !== 'sheet') {
      setViewMode('sheet');
      await new Promise(r => setTimeout(r, 800));
    }
    window.print();
  };

  /**
   * JPEG Export uses high-res canvas (Verdana helps prevent disappearing text)
   */
  const handleExportJpeg = async () => {
    setIsExporting(true);
    try {
      if (viewMode !== 'sheet') {
        setViewMode('sheet');
        await new Promise(r => setTimeout(r, 600));
      }

      window.scrollTo(0, 0);
      const pages = Array.from(document.querySelectorAll('.a4-page'));
      
      for (let i = 0; i < pages.length; i++) {
        const canvas = await (window as any).html2canvas(pages[i], {
          scale: 4,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 0
        });
        
        const link = document.createElement('a');
        link.download = `colint_sheet_page_${i + 1}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.98);
        link.click();
        await new Promise(r => setTimeout(r, 300));
      }
    } catch (e) {
      alert("JPEG capture failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative">
      {/* Capture Overlay only for JPEG */}
      {isExporting && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center text-center">
          <div className="loader mb-8"></div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4 uppercase">Capturing Visuals</h2>
          <p className="text-slate-500 max-w-lg font-medium">Synchronizing Verdana font paths...</p>
        </div>
      )}

      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg font-bold">C</div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Colint Station</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Native Print Accuracy</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg mr-2 border border-slate-200">
              <button onClick={() => setViewMode('editor')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'editor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}>Editor</button>
              <button onClick={() => setViewMode('sheet')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'sheet' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}>Sheet View</button>
            </div>

            <ExcelImport onImport={handleImport} />
            
            <button onClick={handleClear} className="px-4 py-2.5 bg-white text-rose-600 border border-rose-100 font-bold rounded-lg hover:bg-rose-50 transition-all text-xs shadow-sm">
              Clear All
            </button>

            <div className="h-8 w-px bg-slate-200 mx-2"></div>

            <div className="flex items-center gap-2">
              <button onClick={handleExportJpeg} className="px-4 py-2.5 bg-white text-indigo-600 border border-indigo-100 font-bold rounded-lg hover:bg-indigo-50 transition-all text-xs shadow-sm">
                Save JPEG
              </button>
              <button onClick={handleExportPdf} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all text-xs shadow-md">
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {viewMode === 'editor' ? (
        <main className="no-print max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full flex-1">
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[300px]">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Label Queue</h3>
                <button onClick={handleAddLabel} className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-md hover:bg-indigo-700">+ New Item</button>
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left text-sm border-separate border-spacing-0">
                  <tbody className="divide-y divide-slate-100">
                    {labels.map((lbl, idx) => (
                      <tr key={idx} onClick={() => setActiveIndex(idx)} className={`cursor-pointer group transition-colors ${activeIndex === idx ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                        <td className="px-6 py-4 font-semibold text-slate-800 truncate max-w-[150px]">{lbl.pn || 'Unset P/N'}</td>
                        <td className="px-6 py-4 text-slate-400 text-xs truncate max-w-[100px] font-mono">{lbl.fixedChars}{lbl.po}-{lbl.rowNum}</td>
                        <td className="px-4 py-4 text-right flex items-center justify-end gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteLabel(idx); }} className="text-slate-400 hover:text-rose-600 p-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <LabelForm data={currentLabel} onChange={handleUpdateLabel} />
          </section>

          <section className="lg:col-span-4">
            <div className="sticky top-28">
              <LabelPreview data={currentLabel} />
            </div>
          </section>
        </main>
      ) : (
        <main ref={sheetContainerRef} className="label-sheet-container relative">
          <div className="sticky top-6 z-10 flex flex-col items-center gap-4 w-full mb-8 no-print">
            <div className="flex gap-4">
              <button onClick={handleExportJpeg} className="flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 border border-indigo-200 rounded-full font-bold shadow-xl hover:bg-indigo-50 transition-all">
                Export JPEGs
              </button>
              <button onClick={handleExportPdf} className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-full font-bold shadow-2xl hover:bg-indigo-700 transition-all">
                Print Labels (PDF)
              </button>
            </div>
            <p className="text-xs text-slate-800 font-bold bg-white/70 px-4 py-1 rounded-full backdrop-blur-sm shadow-sm">Native Browser Printing Active - Exact Fidelity Guaranteed</p>
          </div>

          {labelPages.map((pageLabels, pageIdx) => (
            <div key={pageIdx} className="page-wrapper">
               <A4Page labels={pageLabels} />
            </div>
          ))}
        </main>
      )}
    </div>
  );
};

export default App;
