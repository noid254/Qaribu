import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { nineDigitPhone } from '../../services/phone';
import { canPickContacts, fieldClass, isKenyanMobile, PHONE_HELP, primaryButton, roleLabel } from './shared';

interface ManageTabProps {
  premise: api.Membership;
  // Tells the screen that the premise's settings changed, so the tabs it offers can follow.
  onChanged: () => void;
}

const Switch: React.FC<{ label: string; help: string; on: boolean; busy: boolean; onToggle: () => void; testId: string }> = ({
  label,
  help,
  on,
  busy,
  onToggle,
  testId,
}) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <p className="font-semibold text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{help}</p>
    </div>
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      data-testid={testId}
      disabled={busy}
      onClick={onToggle}
      className={`shrink-0 w-12 h-7 rounded-full p-1 transition-colors ${on ? 'bg-green-600' : 'bg-gray-300'} disabled:opacity-50`}
    >
      <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

// For an owner or manager: turn gate pass on or off, choose whether to record check-in and check-out times,
// look after the guard link, and run the team. Every action is checked again on the server.
const ManageTab: React.FC<ManageTabProps> = ({ premise, onChanged }) => {
  const [data, setData] = useState<api.ManagedPremise | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState('');
  const [copied, setCopied] = useState(false);

  const [phone, setPhone] = useState(''); // 9 digits after +254
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const load = () =>
    api
      .getManaged(premise.slug)
      .then((d) => {
        setData(d);
        setRole((r) => (d.assignable_roles.includes(r) ? r : d.assignable_roles.includes('tenant') ? 'tenant' : d.assignable_roles[0] ?? ''));
      })
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premise.slug]);

  // Runs one change, shows the result, and reloads. A refused change shows the server's own explanation.
  const act = async (work: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await work();
      setNotice(done);
      await load();
      onChanged();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
      setConfirmRotate(false);
      setConfirmRemove('');
    }
  };

  const pickContact = async () => {
    setError('');
    try {
      const [contact] = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
      if (!contact) return;
      const picked = (contact.tel ?? []).map(nineDigitPhone).find((p: string | null) => p !== null) as string | undefined;
      const pickedName = (contact.name?.[0] ?? '').trim();
      if (pickedName) setName(pickedName);
      if (picked) setPhone(picked);
      else setError('That contact has no Kenyan mobile number. Type the number instead.');
    } catch {
      // The picker was closed: they can still type the details.
    }
  };

  const addPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKenyanMobile(phone)) {
      setError(PHONE_HELP);
      return;
    }
    void act(async () => {
      await api.addTeamMember(premise.slug, { phone: `+254${phone}`, name: name.trim() || undefined, role });
      setPhone('');
      setName('');
    }, 'Added. They will see this premise the next time they sign in with that number.');
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError('Could not copy. Select the link and copy it by hand.');
    }
  };

  if (!data) return <p className="text-center text-gray-500">{error || 'Loading…'}</p>;
  const { gate_pass: gate } = data;

  return (
    <div className="space-y-4">
      {error && <p data-testid="manage-error" className="bg-red-50 text-red-700 text-sm rounded-lg p-3 text-center">{error}</p>}
      {notice && <p data-testid="manage-notice" className="bg-green-50 text-green-800 text-sm rounded-lg p-3 text-center">{notice}</p>}

      <section className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Gate pass</h2>
        <Switch
          testId="switch-gate-pass"
          label="Gate pass"
          help={gate.enabled ? 'Hosts can invite visitors and the gate can admit them.' : 'Off. Turn it on so hosts can invite visitors.'}
          on={gate.enabled}
          busy={busy}
          onToggle={() => act(() => api.setGatePass(premise.slug, { enabled: !gate.enabled }), gate.enabled ? 'Gate pass is off.' : 'Gate pass is on.')}
        />
        <Switch
          testId="switch-log-times"
          label="Record check-in and check-out times"
          help="Hosts see when visitors arrive and leave, and the gateman can check visitors out. Your choice; it can be changed any time."
          on={gate.log_times}
          busy={busy}
          onToggle={() => act(() => api.setGatePass(premise.slug, { log_times: !gate.log_times }), gate.log_times ? 'Times are no longer recorded.' : 'Times are now recorded.')}
        />
      </section>

      {gate.enabled && (
        <section className="bg-white rounded-xl shadow p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Guard link</h2>
          <p className="text-xs text-gray-500">
            For a shared gate phone that is not signed in. Anyone with this link can check visitors in, so keep it private. Gatemen you add below sign in
            with their own number instead, and their name is recorded.
          </p>
          {data.guard_link && (
            <>
              <input readOnly value={data.guard_link} aria-label="Guard link" data-testid="guard-link" className={`${fieldClass} text-xs`} onFocus={(e) => e.currentTarget.select()} />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => copy(data.guard_link!)} className="border border-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-lg">
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                {!confirmRotate ? (
                  <button onClick={() => setConfirmRotate(true)} className="border border-red-300 text-red-700 font-semibold py-2 px-3 rounded-lg">
                    Replace link
                  </button>
                ) : (
                  <button
                    data-testid="confirm-rotate"
                    disabled={busy}
                    onClick={() => act(() => api.rotateGuardLink(premise.slug), 'New guard link created. The old one no longer works.')}
                    className="bg-red-600 text-white font-semibold py-2 px-3 rounded-lg"
                  >
                    Yes, replace now
                  </button>
                )}
              </div>
              {confirmRotate && <p className="text-xs text-red-700">The old link stops working at once, for everyone who has it.</p>}
            </>
          )}
        </section>
      )}

      <section className="bg-white rounded-xl shadow p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Team ({data.team.length})</h2>
        {data.team.map((t) => (
          <div key={t.id} data-testid="team-row" className="flex justify-between items-center gap-3 border-b border-gray-100 pb-2 last:border-0">
            <div>
              <p className="font-semibold text-gray-900">{t.name || t.phone}</p>
              <p className="text-xs text-gray-500">{t.phone} · {roleLabel(t.role)}</p>
            </div>
            {data.assignable_roles.includes(t.role) &&
              (confirmRemove === t.id ? (
                <button disabled={busy} onClick={() => act(() => api.removeTeamMember(premise.slug, t.id), `${t.name || t.phone} was removed.`)} className="shrink-0 bg-red-600 text-white text-sm font-semibold py-1 px-3 rounded-lg">
                  Remove now
                </button>
              ) : (
                <button onClick={() => setConfirmRemove(t.id)} className="shrink-0 border border-gray-300 text-gray-700 text-sm font-semibold py-1 px-3 rounded-lg">
                  Remove
                </button>
              ))}
          </div>
        ))}

        <form onSubmit={addPerson} className="pt-2 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Add a person</h3>
          {canPickContacts() && (
            <button type="button" onClick={pickContact} className="w-full border border-brand-gold text-brand-navy font-semibold py-2 px-4 rounded-lg">
              Choose from contacts
            </button>
          )}
          <div>
            <label htmlFor="memberName" className="block text-sm font-medium text-gray-700">Name</label>
            <input id="memberName" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="memberPhone" className="block text-sm font-medium text-gray-700">Phone</label>
            <div className="flex items-center mt-1 bg-gray-100 rounded-lg shadow-inner focus-within:ring-2 focus-within:ring-brand-gold">
              <span className="px-3 text-gray-500 border-r border-gray-300">+254</span>
              <input
                id="memberPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                required
                placeholder="722123456"
                className="block w-full pl-3 pr-3 py-3 bg-transparent focus:outline-none sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="memberRole" className="block text-sm font-medium text-gray-700">Role</label>
            <select id="memberRole" value={role} onChange={(e) => setRole(e.target.value)} className={fieldClass}>
              {data.assignable_roles.map((r) => (
                <option key={r} value={r}>{roleLabel(r)}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Tenants invite visitors. Gatemen run the gate. Managers help run the premise.</p>
          </div>
          <button type="submit" disabled={busy || !role} className={primaryButton}>Add to team</button>
        </form>
      </section>
    </div>
  );
};

export default ManageTab;
