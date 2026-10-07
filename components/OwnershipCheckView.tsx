import React, { useState } from 'react';
import type { Document } from '../types';
import * as api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface OwnershipCheckViewProps {
    allDocuments: Document[];
    onBack?: () => void;
}

const OwnershipCheckView: React.FC<OwnershipCheckViewProps> = ({ allDocuments, onBack }) => {
    const [identifier, setIdentifier] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<Document | null | 'not_found'>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) return;
        
        setIsLoading(true);
        setResult(null);

        try {
            const foundAsset = await api.searchAssetBySerialOrReg(identifier.trim());
            setResult(foundAsset);
        } catch (error) {
            setResult('not_found');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-surface-muted min-h-full">
            {onBack && (
                <button onClick={onBack} className="mb-3 flex items-center gap-1 text-body font-semibold text-ink-soft hover:text-ink">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back
                </button>
            )}
            <div className="card p-4">
                <h1 className="text-xl font-bold text-ink mb-2">Confirm Asset Ownership</h1>
                <p className="text-body text-ink-soft mb-4">Enter an asset's serial number or vehicle registration plate to find its registered owner.</p>
                
                <form onSubmit={handleSearch} className="space-y-3">
                    <input 
                        type="text" 
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="Enter Serial or Reg. Number" 
                        className="w-full p-3 border rounded-control"
                        autoFocus
                    />
                    <button type="submit" disabled={isLoading} className="w-full bg-brand-dark text-white font-bold py-3 px-4 rounded-control disabled:bg-gray-400">
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            <div className="mt-6">
                {isLoading && <LoadingSpinner message="Checking asset database..." />}
                
                {result && result !== 'not_found' && (
                    <div className="bg-white p-4 rounded-card shadow-md border-l-4 border-success animate-fade-in">
                        <h3 className="font-bold text-lg text-success-strong">Asset Found & Verified</h3>
                        <div className="mt-3 space-y-2 text-body">
                            <p><strong>Item:</strong> {result.items?.[0]?.description || result.model}</p>
                            <p><strong>Identifier:</strong> {result.registrationNumber || result.items?.[0]?.serial}</p>
                            <p><strong>Registered Owner:</strong> {result.ownerPhone ? `****` + result.ownerPhone.slice(-4) : 'N/A'}</p>
                             <p className="mt-3 text-caption text-ink-soft">Owner's full contact details are masked for privacy. This item is confirmed to be registered on Qaribu.</p>
                        </div>
                    </div>
                )}

                {result === 'not_found' && (
                    <div className="bg-white p-4 rounded-card shadow-md border-l-4 border-danger animate-fade-in">
                         <h3 className="font-bold text-lg text-danger-strong">Asset Not Found</h3>
                         <p className="mt-2 text-body text-ink">No asset with this identifier is registered on Qaribu. The item may be unregistered or the identifier is incorrect. Proceed with caution.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnershipCheckView;