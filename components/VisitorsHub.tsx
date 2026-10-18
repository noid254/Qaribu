import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import ExpectedTab from './visitors/ExpectedTab';
import GateTab from './visitors/GateTab';
import InviteTab from './visitors/InviteTab';
import ManageTab from './visitors/ManageTab';
import MyDetails from './visitors/MyDetails';
import SignUpPremise from './visitors/SignUpPremise';
import VacanciesTab from './visitors/VacanciesTab';
import { fieldClass, roleLabel } from './visitors/shared';

interface VisitorsHubProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onBack: () => void;
}

type TabKey = 'invite' | 'expected' | 'gate' | 'vacancies' | 'manage';

// What a person can do on a premise follows their role there. The server checks the role again on every call;
// this only decides which tabs to show, so nobody is offered a button that would be refused.
const tabsFor = (m: api.Membership): { key: TabKey; label: string }[] => {
  const tabs: { key: TabKey; label: string }[] = [];
  if (m.gate_pass_enabled && m.can_invite) tabs.push({ key: 'invite', label: 'Invite' }, { key: 'expected', label: 'Expected' });
  if (m.gate_pass_enabled && m.can_run_gate) tabs.push({ key: 'gate', label: 'Gate' });
  if (m.can_manage_vacancies) tabs.push({ key: 'vacancies', label: 'Vacancies' });
  if (m.can_manage) tabs.push({ key: 'manage', label: 'Manage' });
  return tabs;
};

const VisitorsHub: React.FC<VisitorsHubProps> = ({ isAuthenticated, onSignIn, onBack }) => {
  const [memberships, setMemberships] = useState<api.Membership[]>([]);
  const [account, setAccount] = useState<{ phone: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [slug, setSlug] = useState('');
  const [tab, setTab] = useState<TabKey | ''>('');
  const [registering, setRegistering] = useState(false);

  // Reloads who the person is and where they belong. Passing a slug opens that premise (after registering one).
  const refresh = (open?: string) =>
    api
      .getMe()
      .then((me) => {
        setAccount({ phone: me.account.phone, name: me.account.name });
        setMemberships(me.memberships);
        setSlug((current) => {
          const want = open ?? current;
          return me.memberships.some((m) => m.slug === want) ? want : me.memberships[0]?.slug ?? '';
        });
      })
      .catch((err: Error) => setLoadError(err.message));

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setLoadError('');
    void refresh().finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const premise = memberships.find((m) => m.slug === slug);
  const tabs = premise ? tabsFor(premise) : [];
  const activeTab: TabKey | '' = tabs.some((t) => t.key === tab) ? tab : tabs[0]?.key ?? '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white px-4 py-4 flex items-center">
        <button onClick={onBack} className="mr-3 text-xl" aria-label="Back">&larr;</button>
        <h1 className="text-lg font-bold">Visitors</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {!isAuthenticated && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-700 mb-4">Sign in to invite visitors, run the gate, or manage your premise.</p>
            <button onClick={onSignIn} className="w-full bg-brand-gold text-brand-navy font-bold py-2 px-4 rounded-lg active-scale">
              Sign in
            </button>
          </div>
        )}

        {isAuthenticated && account && !isLoading && <MyDetails account={account} onSaved={(a) => setAccount(a)} />}

        {isAuthenticated && isLoading && <p className="text-center text-gray-500">Loading…</p>}
        {isAuthenticated && loadError && <p className="text-center text-red-500">{loadError}</p>}

        {isAuthenticated && !isLoading && !loadError && registering && (
          <SignUpPremise
            onCancel={() => setRegistering(false)}
            onDone={(opened) => {
              setRegistering(false);
              setTab('vacancies'); // the next thing a new premise needs is its vacancies
              void refresh(opened);
            }}
          />
        )}

        {isAuthenticated && !isLoading && !loadError && !registering && memberships.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-700 space-y-4">
            <p>This account is not on a premise yet.</p>
            <button onClick={() => setRegistering(true)} data-testid="register-premise" className="w-full bg-brand-gold text-brand-navy font-bold py-3 px-4 rounded-lg active-scale">
              Register a premise
            </button>
            <p className="text-xs text-gray-500">Or ask the owner or manager of your building to add your phone number.</p>
          </div>
        )}

        {premise && !registering && (
          <>
            {memberships.length > 1 ? (
              <div>
                <label htmlFor="premise" className="block text-sm font-medium text-gray-700">Premise</label>
                <select id="premise" value={slug} onChange={(e) => setSlug(e.target.value)} className={fieldClass}>
                  {memberships.map((m) => (
                    <option key={m.slug} value={m.slug}>{m.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{premise.name}</span> · {premise.roles.map(roleLabel).join(', ')}
              </p>
            )}

            {tabs.length === 0 ? (
              <div data-testid="no-actions" className="bg-white rounded-xl shadow p-6 text-center text-gray-700">
                {premise.gate_pass_enabled
                  ? 'Your role on this premise has nothing to do here yet.'
                  : 'Gate pass is switched off for this premise. Ask the owner or manager to turn it on.'}
              </div>
            ) : (
              <div className="flex bg-gray-200 rounded-lg p-1" role="tablist">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    role="tab"
                    aria-selected={activeTab === t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold ${activeTab === t.key ? 'bg-white shadow text-brand-navy' : 'text-gray-600'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'invite' && <InviteTab key={premise.slug} premise={premise} />}
            {activeTab === 'expected' && <ExpectedTab key={premise.slug} premise={premise} />}
            {activeTab === 'gate' && <GateTab key={premise.slug} premise={premise} />}
            {activeTab === 'vacancies' && <VacanciesTab key={premise.slug} premise={premise} />}
            {activeTab === 'manage' && <ManageTab key={premise.slug} premise={premise} onChanged={() => void refresh()} />}

            <button onClick={() => setRegistering(true)} data-testid="register-another" className="block w-full text-center text-sm text-blue-600 hover:underline pt-2">
              Register another premise
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VisitorsHub;
