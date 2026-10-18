import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { clock } from './shared';

const STATUS_LABEL: Record<api.VisitStatus, string> = {
  waiting: 'Waiting',
  arrived: 'Arrived',
  left: 'Left',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

const STATUS_STYLE: Record<api.VisitStatus, string> = {
  waiting: 'bg-amber-100 text-amber-800',
  arrived: 'bg-green-100 text-green-800',
  left: 'bg-gray-200 text-gray-700',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-200 text-gray-600',
};

// The host's expected visitors. An owner or manager sees every invite for the premise; others see their own.
// Check-in and check-out times appear only when the premise records them.
const ExpectedTab: React.FC<{ premise: api.Membership }> = ({ premise }) => {
  const [data, setData] = useState<{ log_times: boolean; passes: api.PassRow[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api
      .getPasses(premise.slug)
      .then((res) => setData({ log_times: res.premise.log_times, passes: res.passes }))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [premise.slug]);

  return (
    <div className="space-y-3">
      <button onClick={load} disabled={loading} className="text-sm text-blue-600 hover:underline">
        {loading ? 'Refreshing…' : 'Refresh'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {data && data.passes.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">No visitors in the last 7 days.</div>
      )}

      {data?.passes.map((p) => (
        <div key={p.id} data-testid="expected-row" className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">{p.visitor_name}</p>
              <p className="text-xs text-gray-500">{p.visitor_phone}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[p.status]}`}>{STATUS_LABEL[p.status]}</span>
          </div>
          <p className="text-sm text-gray-700 mt-2">{p.purpose}</p>
          {p.host_label && <p className="text-xs text-gray-500">Invited by {p.host_label}</p>}
          {data.log_times && (p.arrived_at || p.left_at) && (
            <p className="text-xs text-gray-600 mt-2">
              {p.arrived_at && <>In {clock(p.arrived_at)}</>}
              {p.left_at && <> · Out {clock(p.left_at)}</>}
            </p>
          )}
          {p.key && (
            <p className="text-xs text-gray-600 mt-2">
              Key <span className="font-bold tracking-widest">{p.key}</span> · valid until {clock(p.expires_at)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExpectedTab;
