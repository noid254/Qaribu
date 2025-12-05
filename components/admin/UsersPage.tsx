import React, { useState, useMemo } from 'react';
import type { ServiceProvider } from '../../types';

interface UsersPageProps {
    providers: ServiceProvider[];
    onViewProvider: (provider: ServiceProvider) => void;
    onUpdateProvider: (provider: ServiceProvider) => void;
    // FIX: Changed id type from number to string to match ServiceProvider type.
    onDeleteProvider: (id: string) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ providers, onViewProvider, onUpdateProvider, onDeleteProvider }) => {
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState<'All' | 'Verified' | 'Unverified'>('All');

    const filteredProviders = useMemo(() => {
        return providers.filter(p => {
            const matchesFilter = userFilter === 'All' || (userFilter === 'Verified' && p.isVerified) || (userFilter === 'Unverified' && !p.isVerified);
            const matchesSearch = p.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || p.service.toLowerCase().includes(userSearchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [providers, userSearchTerm, userFilter]);

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Users</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <input type="text" placeholder="Search users..." value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} className="flex-grow p-2 border rounded-md"/>
                <select value={userFilter} onChange={e => setUserFilter(e.target.value as any)} className="p-2 border rounded-md bg-white">
                    <option>All</option>
                    <option>Verified</option>
                    <option>Unverified</option>
                </select>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {filteredProviders.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <button onClick={() => onViewProvider(p)} className="flex items-center gap-3 text-left">
                            <img src={p.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="font-semibold">{p.name} {p.isVerified && <span className="text-blue-500">✓</span>}</p>
                                <p className="text-sm text-gray-600">{p.service}</p>
                            </div>
                        </button>
                        <div className="flex items-center space-x-2">
                            {!p.isVerified && <button onClick={() => onUpdateProvider({...p, isVerified: true})} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Verify</button>}
                            <button onClick={() => {if(window.confirm(`Delete ${p.name}?`)) onDeleteProvider(p.id)}} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Delete</button>
                        </div>
                    </div>
                ))}
                    {filteredProviders.length === 0 && <p className="text-center text-gray-500 py-4">No users found.</p>}
            </div>
        </div>
    );
};

export default UsersPage;
