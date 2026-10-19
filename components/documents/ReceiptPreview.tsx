import React, { useEffect, useRef, useState } from 'react';
import * as api from '../../services/api';
import ClaimPanel from './ClaimPanel';

interface ReceiptPreviewProps {
  id: string;
  number: string;
  kind?: 'receipt' | 'invoice' | 'quote';
  // Only the shop that issued it can send the link again; a customer looking at their own receipt has no such buttons.
  smsLink?: string | null;
  whatsappLink?: string | null;
  // A receipt issued to me: any serial-numbered items on it can be claimed as my assets (architecture section 24).
  claimable?: boolean;
  onOpenAssets?: () => void;
  onClose: () => void;
}

// A receipt, shown as the customer sees it: the real receipt page, fetched signed in and put in a frame. The
// customer's own link is never opened for this, because it opens only once, and nothing is drawn twice, so what is
// previewed is what the customer gets. A receipt cannot be edited or deleted, so there is no such button here.
const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ id, number, kind = 'receipt', smsLink, whatsappLink, claimable = false, onOpenAssets, onClose }) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState('');
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let alive = true;
    setHtml(null);
    setError('');
    api
      .getReceiptPage(id)
      .then((page) => alive && setHtml(page))
      .catch((err: Error) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <div data-testid="receipt-preview" className="fixed inset-0 z-50 bg-gray-100 flex flex-col" role="dialog" aria-label={`Receipt ${number}`}>
      <div className="bg-brand-navy text-white px-4 py-3 flex items-center">
        <button onClick={onClose} className="mr-3 text-xl" aria-label="Close preview" data-testid="receipt-preview-close">&larr;</button>
        <h2 className="text-lg font-bold">{kind[0]!.toUpperCase() + kind.slice(1)} {number}</h2>
      </div>

      <div className="flex-1 overflow-hidden max-w-md w-full mx-auto">
        {error && <p className="p-6 text-center text-red-500">{error}</p>}
        {!error && html === null && <p className="p-6 text-center text-gray-500">Loading…</p>}
        {html !== null && (
          // No scripts are allowed in the frame (it has none to run). Same-origin is allowed only so Print can reach it.
          <iframe ref={frame} title={`Receipt ${number}`} srcDoc={html} sandbox="allow-same-origin allow-modals" className="w-full h-full bg-white" />
        )}
      </div>

      {html !== null && claimable && <ClaimPanel receiptId={id} onOpenAssets={onOpenAssets} />}

      {html !== null && (
        <div className="bg-white border-t p-3 max-w-md w-full mx-auto">
          <div className="grid grid-cols-3 gap-2">
            {smsLink && <a href={smsLink} className="block text-center bg-brand-gold text-brand-navy font-bold py-3 rounded-lg active-scale">My SMS</a>}
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block text-center bg-green-600 text-white font-bold py-3 rounded-lg active-scale">WhatsApp</a>
            )}
            <button onClick={() => frame.current?.contentWindow?.print()} className="block text-center border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg">Print</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptPreview;
