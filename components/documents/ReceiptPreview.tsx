import React, { useEffect, useRef, useState } from 'react';
import * as api from '../../services/api';
import ClaimPanel from './ClaimPanel';
import DocumentActions from './DocumentActions';
import PaymentPanel from './PaymentPanel';
import QuoteAnswerPanel from './QuoteAnswerPanel';

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
  // An invoice I issued with something still to pay: the shop can record a payment against it.
  payable?: { balance: number };
  onPaid?: () => void;
  // An invoice or quote I issued: make a quote an invoice, or cancel one sent in error.
  actions?: { canInvoice: boolean; canCancel: boolean };
  // A quote sent to me that I have not answered yet: I can accept or decline it.
  answerable?: boolean;
  onChanged?: () => void;
  onClose: () => void;
}

// A receipt, shown as the customer sees it: the real receipt page, fetched signed in and put in a frame. The
// customer's own link is never opened for this, because it opens only once, and nothing is drawn twice, so what is
// previewed is what the customer gets. A receipt cannot be edited or deleted, so there is no such button here.
const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ id, number, kind = 'receipt', smsLink, whatsappLink, claimable = false, onOpenAssets, payable, onPaid, actions, answerable = false, onChanged, onClose }) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let alive = true;
    // The page already on screen stays until the fresh one arrives (after a payment it is reloaded, and the panels
    // beside it must not vanish and lose what they are showing).
    setError('');
    api
      .getReceiptPage(id)
      .then((page) => alive && setHtml(page))
      .catch((err: Error) => alive && setError(err.message));
    return () => {
      alive = false;
    };
  }, [id, reload]);

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
      {html !== null && payable && (
        <PaymentPanel
          invoiceId={id}
          balance={payable.balance}
          onPaid={() => {
            setReload((n) => n + 1);
            onPaid?.();
          }}
        />
      )}

      {html !== null && answerable && kind === 'quote' && (
        <QuoteAnswerPanel
          id={id}
          onAnswered={() => {
            setReload((n) => n + 1);
            onChanged?.();
          }}
        />
      )}
      {html !== null && actions && (kind === 'invoice' || kind === 'quote') && (
        <DocumentActions
          id={id}
          kind={kind}
          canInvoice={actions.canInvoice}
          canCancel={actions.canCancel}
          onChanged={() => {
            setReload((n) => n + 1);
            onChanged?.();
          }}
        />
      )}

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
