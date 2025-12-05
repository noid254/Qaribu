
import React, { useState, useEffect } from 'react';
import type { ServiceProvider } from '../../types';

// This component handles the real-time validation of leader phone numbers.
const LeaderInput: React.FC<{
    label: string;
    onValidation: (isValid: boolean, phone: string) => void;
    allProviders: ServiceProvider[];
}> = ({ label, onValidation, allProviders }) => {
    const [inputValue, setInputValue] = useState('');
    const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
    const [foundUser, setFoundUser] = useState<ServiceProvider | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (inputValue.length >= 9) {
                setStatus('checking');
                const user = allProviders.find(p => p.phone.endsWith(inputValue));
                if (user) {
                    setFoundUser(user);
                    setStatus('valid');
                    onValidation(true, user.phone);
                } else {
                    setFoundUser(null);
                    setStatus('invalid');
                    onValidation(false, '');
                }
            } else {
                setStatus('idle');
                setFoundUser(null);
                onValidation(false, '');
            }
        }, 500); // Debounce for 500ms

        return () => clearTimeout(handler);
    }, [inputValue, allProviders, onValidation]);

    const borderClass = status === 'invalid' ? 'border-red-500' : 'border-gray-300';

    return (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <div className={`flex items-center mt-1 border ${borderClass} rounded-md shadow-sm focus-within:ring-1 focus-within:ring-brand-primary`}>
                <span className="pl-3 text-gray-500">+254</span>
                <input
                    type="tel"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="722123456"
                    className="block w-full pl-1 pr-3 py-2 border-0 rounded-md focus:outline-none focus:ring-0 sm:text-sm"
                    required
                />
            </div>
            {status === 'checking' && <p className="text-xs text-gray-500 mt-1">Checking...</p>}
            {status === 'invalid' && <p className="text-xs text-red-600 mt-1">User not found on Niko Soko.</p>}
            {status === 'valid' && foundUser && (
                <div className="flex items-center gap-2 mt-1 p-1 bg-green-50 border border-green-200 rounded-md">
                    <img src={foundUser.avatarUrl} alt={foundUser.name} className="w-6 h-6 rounded-full"/>
                    <p className="text-xs text-green-800 font-semibold">{foundUser.name}</p>
                </div>
            )}
        </div>
    );
};

interface OrganizationsPageProps {
    providers: ServiceProvider[];
    onCreate: (data: any) => void;
    // FIX: Changed ID types from number to string to match ServiceProvider type.
    onApproveRequest: (orgId: string, userId: string) => void;
    // FIX: Changed ID types from number to string to match ServiceProvider type.
    onRejectRequest: (orgId: string, userId: string) => void;
}

const OrganizationsPage: React.FC<OrganizationsPageProps> = ({ providers, onCreate, onApproveRequest, onRejectRequest }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [viewingOrg, setViewingOrg] = useState<ServiceProvider | null>(null);
    const [formState, setFormState] = useState({ name: '', service: '', location: '', about: '', referralCode: ''});
    const [leaders, setLeaders] = useState({ chairperson: '', secretary: '', treasurer: '' });
    const [leaderValidation, setLeaderValidation] = useState({ chairperson: false, secretary: false, treasurer: false });
    
    const allSaccos = providers.filter(p => p.accountType === 'organization');

    const handleLeaderUpdate = (role: keyof typeof leaders, isValid: boolean, phone: string) => {
        setLeaderValidation(prev => ({ ...prev, [role]: isValid }));
        setLeaders(prev => ({ ...prev, [role]: isValid ? phone : '' }));
    };

    const isFormValid = leaderValidation.chairperson && leaderValidation.secretary && leaderValidation.treasurer && formState.name && formState.service && formState.location && formState.about && formState.referralCode;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!isFormValid) {
            alert("Please ensure all fields are filled and all leaders are valid members.");
            return;
        }
        onCreate({ ...formState, leaders });
        setFormState({ name: '', service: '', location: '', about: '', referralCode: '' });
        setLeaders({ chairperson: '', secretary: '', treasurer: '' });
        setLeaderValidation({ chairperson: false, secretary: false, treasurer: false });
        setIsCreating(false);
    };
    
    if (viewingOrg) {
        return (
             <div className="bg-white rounded-lg shadow-sm p-4">
                 <button onClick={() => setViewingOrg(null)} className="text-sm font-semibold text-blue-600 mb-4">&larr; Back to List</button>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{viewingOrg.name}</h2>
                        <p className="text-gray-600">{viewingOrg.service}</p>
                    </div>
                    {viewingOrg.referralCode && (
                        <div className="bg-brand-gold/10 text-brand-navy px-3 py-1 rounded-lg border border-brand-gold/20 text-center">
                            <span className="text-[10px] font-bold uppercase block text-gray-500">Referral Code</span>
                            <span className="font-mono font-bold text-sm tracking-wider">{viewingOrg.referralCode}</span>
                        </div>
                    )}
                </div>
                
                 <h3 className="font-bold text-lg mt-6 mb-2">Pending Join Requests</h3>
                <div className="space-y-2">
                    {(viewingOrg.joinRequests || []).filter(r => r.status === 'pending').map(req => (
                        <div key={req.userId} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                            <div>
                                <p className="font-semibold">{req.userName}</p>
                                <p className="text-xs text-gray-600">{req.userPhone}</p>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={() => onRejectRequest(viewingOrg.id, req.userId)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Reject</button>
                               <button onClick={() => onApproveRequest(viewingOrg.id, req.userId)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Approve</button>
                            </div>
                        </div>
                    ))}
                    {(viewingOrg.joinRequests || []).filter(r => r.status === 'pending').length === 0 && <p className="text-sm text-gray-500">No pending requests.</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Manage Organizations</h2>
                <button onClick={() => setIsCreating(p => !p)} className="bg-brand-primary text-white font-bold px-4 py-2 rounded-lg text-sm">{isCreating ? 'Cancel' : '+ New'}</button>
            </div>
            
            {isCreating && (
                 <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-gray-50 space-y-3 mb-6">
                    <h3 className="font-semibold text-lg">Create New Organization</h3>
                    <input value={formState.name} onChange={e => setFormState(p=>({...p, name: e.target.value}))} placeholder="Organization Name" className="w-full p-2 border rounded" required />
                    <input value={formState.referralCode} onChange={e => setFormState(p=>({...p, referralCode: e.target.value.toUpperCase()}))} placeholder="Referral Code (e.g. UON2024)" className="w-full p-2 border rounded font-mono uppercase" required />
                    <input value={formState.service} onChange={e => setFormState(p=>({...p, service: e.target.value}))} placeholder="Service / Industry" className="w-full p-2 border rounded" required />
                    <input value={formState.location} onChange={e => setFormState(p=>({...p, location: e.target.value}))} placeholder="Location" className="w-full p-2 border rounded" required />
                    <textarea value={formState.about} onChange={e => setFormState(p=>({...p, about: e.target.value}))} placeholder="About the organization" className="w-full p-2 border rounded" required />
                     <h4 className="font-semibold pt-2">Leadership Contacts (must be registered users)</h4>
                    <LeaderInput 
                        label="Chairperson's Phone"
                        onValidation={(isValid, phone) => handleLeaderUpdate('chairperson', isValid, phone)}
                        allProviders={providers}
                    />
                    <LeaderInput 
                        label="Secretary's Phone"
                        onValidation={(isValid, phone) => handleLeaderUpdate('secretary', isValid, phone)}
                        allProviders={providers}
                    />
                     <LeaderInput 
                        label="Treasurer's Phone"
                        onValidation={(isValid, phone) => handleLeaderUpdate('treasurer', isValid, phone)}
                        allProviders={providers}
                    />
                    <button type="submit" disabled={!isFormValid} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">Create Organization</button>
                </form>
            )}

            <div className="space-y-3">
                {allSaccos.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3 text-left">
                            <img src={p.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-sm text-gray-600">{p.service}</p>
                                {p.referralCode && <span className="text-[10px] font-mono bg-white border border-gray-200 px-1 rounded text-gray-500">Ref: {p.referralCode}</span>}
                            </div>
                        </div>
                        <button onClick={() => setViewingOrg(p)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md font-semibold">
                           Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrganizationsPage;
