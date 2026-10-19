import React from 'react';

interface ReceiptPreviewProps {
  number: string;
  // The receipt page itself, exactly as the customer sees it. Null when the link has been switched off.
  url: string | null;
  smsLink: string | null;
  whatsappLink: string | null;
  onClose: () => void;
}

// A receipt the shop has issued, shown as the customer sees it: the real receipt page, in a frame. Nothing is
// drawn twice, so what the shop previews is what the customer gets. From here the shop can send it again.
const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ number, url, smsLink, whatsappLink, onClose }) => (
  <div data-testid="receipt-preview" className="fixed inset-0 z-50 bg-gray-100 flex flex-col" role="dialog" aria-label={`Receipt ${number}`}>
    <div className="bg-brand-navy text-white px-4 py-3 flex items-center">
      <button onClick={onClose} className="mr-3 text-xl" aria-label="Close preview" data-testid="receipt-preview-close">&larr;</button>
      <h2 className="text-lg font-bold">Receipt {number}</h2>
    </div>

    <div className="flex-1 overflow-hidden max-w-md w-full mx-auto">
      {url ? (
        // A sandbox with nothing allowed: the page needs no scripts, and nothing in it can reach the app.
        <iframe title={`Receipt ${number}`} src={url} sandbox="" className="w-full h-full bg-white" />
      ) : (
        <p className="p-6 text-center text-gray-600">This receipt's link has been switched off, so it cannot be shown.</p>
      )}
    </div>

    {url && (
      <div className="bg-white border-t p-3 max-w-md w-full mx-auto">
        <div className="grid grid-cols-3 gap-2">
          {smsLink && <a href={smsLink} className="block text-center bg-brand-gold text-brand-navy font-bold py-3 rounded-lg active-scale">My SMS</a>}
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block text-center bg-green-600 text-white font-bold py-3 rounded-lg active-scale">WhatsApp</a>
          )}
          <a href={url} target="_blank" rel="noopener noreferrer" className="block text-center border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg">Open / print</a>
        </div>
      </div>
    )}
  </div>
);

export default ReceiptPreview;
