import React from 'react';
import * as api from '../../services/api';
import { fieldClass } from '../visitors/shared';

export const formatKsh = (amount: number) => `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: amount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;

export interface Line {
  key: number;
  description: string;
  qty: string;
  price: string;
  hasSerial: boolean;
  serial: string;
}

let nextKey = 1;
export const newLine = (): Line => ({ key: nextKey++, description: '', qty: '1', price: '', hasSerial: false, serial: '' });

const cents = (n: number) => Math.round(n * 100);

// The same sum the server does, to the cent, so the shop sees the total while typing. The server works it out
// again and its answer is the one that is printed.
export const lineTotal = (l: Line): number => {
  const qty = Number(l.qty);
  const price = Number(l.price.replace(/,/g, ''));
  return Number.isFinite(qty) && Number.isFinite(price) && qty > 0 && price > 0 ? Math.round(qty * price * 100) / 100 : 0;
};

export const sumLines = (lines: Line[]): number => lines.reduce((sum, l) => sum + cents(lineTotal(l)), 0) / 100;

// What the server is sent: an item with a serial is one item.
export const toInputs = (lines: Line[]): api.ReceiptLineInput[] =>
  lines.map((l) => ({ description: l.description, qty: l.hasSerial ? '1' : l.qty, unit_price: l.price, serial: l.hasSerial ? l.serial : undefined }));

// The items of a receipt, invoice or quote: a description, a quantity and a unit price each, with the line total shown
// while typing, and a serial number for an item that has one, keyed in before issuing (one serial, one item).
const LineEditor: React.FC<{ lines: Line[]; setLines: React.Dispatch<React.SetStateAction<Line[]>> }> = ({ lines, setLines }) => {
  const setLine = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  return (
    <>
      <div className="space-y-3">
        {lines.map((l, i) => (
          <div key={l.key} data-testid="receipt-line" className="bg-white rounded-xl shadow p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-gray-500">Item {i + 1}</p>
              {lines.length > 1 && (
                <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} className="text-sm text-red-500" aria-label={`Remove item ${i + 1}`}>Remove</button>
              )}
            </div>
            <input
              aria-label={`Item ${i + 1} description`}
              value={l.description}
              onChange={(e) => setLine(l.key, { description: e.target.value })}
              required
              minLength={2}
              maxLength={80}
              placeholder="What was sold"
              className={fieldClass}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500">Quantity</label>
                <input
                  aria-label={`Item ${i + 1} quantity`}
                  inputMode="decimal"
                  value={l.hasSerial ? '1' : l.qty}
                  disabled={l.hasSerial}
                  onChange={(e) => setLine(l.key, { qty: e.target.value })}
                  required
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Unit price (KES)</label>
                <input
                  aria-label={`Item ${i + 1} unit price`}
                  inputMode="decimal"
                  value={l.price}
                  onChange={(e) => setLine(l.key, { price: e.target.value })}
                  required
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={l.hasSerial}
                onChange={(e) => setLine(l.key, { hasSerial: e.target.checked, serial: e.target.checked ? l.serial : '' })}
                className="h-4 w-4"
                aria-label={`Item ${i + 1} has a serial number`}
              />
              This item has a serial number
            </label>
            {l.hasSerial && (
              <div>
                <input
                  aria-label={`Item ${i + 1} serial number`}
                  value={l.serial}
                  onChange={(e) => setLine(l.key, { serial: e.target.value.toUpperCase() })}
                  required
                  minLength={3}
                  maxLength={40}
                  placeholder="Serial number, as printed on the item"
                  className={fieldClass}
                />
                <p className="text-xs text-gray-500 mt-1">One serial number means one item, so the quantity is 1. For two, add two items.</p>
              </div>
            )}
            <p className="text-right text-sm text-gray-600">
              Line total <span data-testid="line-total" className="font-semibold text-gray-900">{formatKsh(lineTotal(l))}</span>
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setLines((ls) => [...ls, newLine()])}
        disabled={lines.length >= 30}
        className="w-full border border-brand-gold text-brand-navy font-semibold py-2 px-4 rounded-lg"
      >
        + Add another item
      </button>
    </>
  );
};

export default LineEditor;
