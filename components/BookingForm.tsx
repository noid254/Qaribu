import React, { useState } from 'react';
import * as api from '../services/api';
import type { ServiceProvider } from '../types';
import { primaryButton } from './visitors/shared';

interface BookingFormProps {
  provider: ServiceProvider;
  onClose: () => void;
  onBooked: () => void;
}

const tomorrow = () => new Date(Date.now() + 86_400_000 + 3 * 3_600_000).toISOString().slice(0, 10);

// Asking a professional for a time: when, what for, and a note. The professional answers from their Bookings page.
const BookingForm: React.FC<BookingFormProps> = ({ provider, onClose, onBooked }) => {
  const [date, setDate] = useState(tomorrow());
  const [time, setTime] = useState('10:00');
  const [service, setService] = useState(provider.service);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await api.makeBooking({ professional_id: provider.id, date, time, service_title: service, notes });
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Could not send your booking.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 sm:items-center" role="dialog" aria-modal="true" aria-label={`Book ${provider.name}`}>
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        {done ? (
          <div data-testid="booking-sent" className="space-y-3 text-center">
            <p className="text-lg font-bold text-brand-navy">Booking sent</p>
            <p className="text-sm text-slate-600">{provider.name} will confirm or suggest another time. You will see the answer under Bookings.</p>
            <button onClick={onBooked} className={primaryButton}>View my bookings</button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Book {provider.name}</h2>
              <p className="text-sm text-slate-500">Choose a time. {provider.name} sees your name and number for this booking only.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-slate-500">Date
                <input type="date" value={date} min={tomorrow()} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-100 px-3 py-3 text-base text-slate-800" data-testid="booking-date" />
              </label>
              <label className="block text-xs font-medium text-slate-500">Time
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-100 px-3 py-3 text-base text-slate-800" data-testid="booking-time" />
              </label>
            </div>
            <label className="block text-xs font-medium text-slate-500">What for
              <input value={service} onChange={(e) => setService(e.target.value)} maxLength={80} className="mt-1 w-full rounded-lg bg-slate-100 px-3 py-3 text-base text-slate-800" />
            </label>
            <label className="block text-xs font-medium text-slate-500">Note for {provider.name} (optional)
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} rows={3} className="mt-1 w-full resize-none rounded-lg bg-slate-100 px-3 py-3 text-base text-slate-800" />
            </label>
            {error && <p data-testid="booking-error" className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-slate-700">Cancel</button>
              <button onClick={submit} disabled={busy} data-testid="booking-submit" className="flex-1 rounded-lg bg-brand-navy py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Sending…' : 'Send booking'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
