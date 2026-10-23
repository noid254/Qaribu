import React, { useCallback, useEffect, useState } from 'react';
import * as api from '../services/api';

const FILTERS = ['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const;
type Filter = (typeof FILTERS)[number];

const BADGE: Record<api.BookingStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Rescheduled: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-emerald-100 text-emerald-800',
  Completed: 'bg-slate-200 text-slate-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const niceDate = (date: string) =>
  new Date(`${date}T12:00:00+03:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Nairobi' });

interface BookingsViewProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onBack: () => void;
}

// Bookings, as Nikosoko shows them: the ones you asked for and the ones asked of you, with the same states and filters. All of it is
// kept on the server; the professional's answer shows here.
const BookingsView: React.FC<BookingsViewProps> = ({ isAuthenticated, onSignIn, onBack }) => {
  const [side, setSide] = useState<'mine' | 'received'>('mine');
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<api.BookingRecord[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [moving, setMoving] = useState<{ id: string; date: string; time: string } | null>(null);

  const load = useCallback(() => {
    api
      .listBookings(side)
      .then((list) => {
        setItems(list);
        setError('');
      })
      .catch((err) => setError(err.message || 'Could not load your bookings.'));
  }, [side]);

  useEffect(() => {
    if (isAuthenticated) {
      setItems(null);
      load();
    }
  }, [isAuthenticated, load]);

  const act = async (id: string, action: api.BookingAction, body: { reason?: string; date?: string; time?: string } = {}) => {
    setBusy(id);
    setError('');
    try {
      await api.changeBooking(id, action, body);
      setMoving(null);
      load();
    } catch (err: any) {
      setError(err.message || 'That did not work.');
    } finally {
      setBusy('');
    }
  };

  const header = (
    <div className="flex items-center bg-brand-navy px-4 py-4 text-white">
      <button onClick={onBack} className="mr-3 text-xl" aria-label="Back">&larr;</button>
      <h1 className="text-xl font-bold">Bookings</h1>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div>
        {header}
        <div className="p-4"><button onClick={onSignIn} className="w-full rounded-lg bg-brand-navy py-3 font-semibold text-white">Sign in to see your bookings</button></div>
      </div>
    );
  }

  const shown = (items ?? []).filter((b) => filter === 'all' || b.status === filter || (filter === 'Pending' && b.status === 'Rescheduled'));
  const count = (f: Filter) => (items ?? []).filter((b) => f === 'all' || b.status === f || (f === 'Pending' && b.status === 'Rescheduled')).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {header}
      <div className="mx-auto max-w-md space-y-3 p-4">
        <div className="grid grid-cols-2 rounded-xl bg-slate-200 p-1 text-sm font-semibold">
          {(['mine', 'received'] as const).map((s) => (
            <button key={s} onClick={() => setSide(s)} data-testid={`bookings-${s}`} className={`rounded-lg py-2 ${side === s ? 'bg-white text-brand-navy shadow-sm' : 'text-slate-500'}`}>
              {s === 'mine' ? 'My bookings' : 'Received'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${filter === f ? 'bg-brand-navy text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>
              {f === 'all' ? 'All' : f} ({count(f)})
            </button>
          ))}
        </div>

        {error && <p data-testid="bookings-error" className="text-sm text-red-500">{error}</p>}
        {items === null && !error && <p className="text-sm text-slate-500">Loading…</p>}
        {items !== null && shown.length === 0 && (
          <div data-testid="no-bookings" className="rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="font-semibold text-brand-navy">{filter === 'all' ? 'No bookings yet' : `No ${filter.toLowerCase()} bookings`}</p>
            <p className="mt-1 text-sm text-slate-500">{side === 'mine' ? 'When you book a professional, it shows here with their answer.' : 'When someone books you, it shows here for you to answer.'}</p>
          </div>
        )}

        {shown.map((b) => {
          const open = b.status === 'Pending' || b.status === 'Rescheduled' || b.status === 'Confirmed';
          const waiting = b.status === 'Pending' || b.status === 'Rescheduled';
          return (
            <article key={b.id} data-testid="booking" className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-brand-navy">{b.serviceTitle || b.providerService}</p>
                  <p className="truncate text-sm text-slate-600">{side === 'mine' ? b.providerName : `${b.clientName} · ${b.clientPhone}`}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE[b.status]}`}>{b.status}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-800">{niceDate(b.date)} at {b.time}</p>
              {b.notes && <p className="mt-1 text-sm text-slate-500">“{b.notes}”</p>}
              {b.status === 'Cancelled' && <p className="mt-1 text-sm text-red-600">Cancelled by {b.cancelledBy === 'provider' ? 'the professional' : 'the client'}{b.cancellationReason ? `: ${b.cancellationReason}` : ''}</p>}

              {moving?.id === b.id && (
                <div className="mt-3 flex items-end gap-2">
                  <input type="date" value={moving.date} onChange={(e) => setMoving({ ...moving, date: e.target.value })} className="flex-1 rounded-lg bg-slate-100 px-2 py-2 text-sm" />
                  <input type="time" value={moving.time} onChange={(e) => setMoving({ ...moving, time: e.target.value })} className="rounded-lg bg-slate-100 px-2 py-2 text-sm" />
                  <button onClick={() => act(b.id, 'reschedule', { date: moving.date, time: moving.time })} disabled={busy === b.id} className="rounded-lg bg-brand-navy px-3 py-2 text-sm font-semibold text-white">Move</button>
                </div>
              )}

              {open && (
                <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
                  {side === 'received' && waiting && <button onClick={() => act(b.id, 'confirm')} disabled={busy === b.id} className="rounded-lg bg-emerald-600 px-3 py-2 text-white">Confirm</button>}
                  {side === 'received' && waiting && <button onClick={() => act(b.id, 'decline')} disabled={busy === b.id} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700">Decline</button>}
                  {side === 'received' && b.status === 'Confirmed' && <button onClick={() => act(b.id, 'complete')} disabled={busy === b.id} className="rounded-lg bg-brand-navy px-3 py-2 text-white">Mark done</button>}
                  <button onClick={() => setMoving({ id: b.id, date: b.date, time: b.time })} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700">Change time</button>
                  <button onClick={() => act(b.id, 'cancel')} disabled={busy === b.id} className="rounded-lg px-3 py-2 text-red-600">Cancel</button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default BookingsView;
