import React, { useState, useEffect } from 'react';
import bwipjs from 'bwip-js';
import { isBarcodeStringValid } from '../services/barcodeService';

interface Props {
  text: string;
  className?: string;
}

type State =
  | { status: 'idle' }
  | { status: 'ok'; dataUrl: string }
  | { status: 'empty' }
  | { status: 'error'; message: string };

export const DatamatrixBarcode: React.FC<Props> = ({ text, className }) => {
  const [state, setState] = useState<State>({ status: 'idle' });

  useEffect(() => {
    setState({ status: 'idle' });

    if (!isBarcodeStringValid(text)) {
      setState({ status: 'empty' });
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      bwipjs.toCanvas(canvas, {
        bcid: 'datamatrix',
        text: text,
        scale: 4,
        includetext: false,
      });
      setState({ status: 'ok', dataUrl: canvas.toDataURL('image/png') });
    } catch (e: any) {
      console.error('Barcode rendering error:', e);
      setState({ status: 'error', message: e?.message ?? 'Encode failed' });
    }
  }, [text]);

  if (state.status === 'idle') return <div className={className} />;

  if (state.status === 'empty') {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'center', border: '1px dashed #94a3b8', borderRadius: 2 }}
        title="Fill required fields to generate barcode">
        <span style={{ fontSize: 7, color: '#94a3b8', textAlign: 'center', padding: 2 }}>No data</span>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'center', border: '1px dashed #f87171', borderRadius: 2,
        backgroundColor: '#fef2f2' }} title={state.message}>
        <span style={{ fontSize: 7, color: '#ef4444', textAlign: 'center', padding: 2 }}>⚠ {state.message}</span>
      </div>
    );
  }

  return (
    <img src={state.dataUrl} alt="Datamatrix barcode" className={className}
      style={{ imageRendering: 'pixelated' }} />
  );
};
