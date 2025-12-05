import React, { useState } from 'react';
import type { Document } from '../types';
import * as api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface OwnershipCheckViewProps {
    allDocuments: Document[];
}

const OwnershipCheckView: React.FC<OwnershipCheckViewProps> = ({ allDocuments }) => {
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
        <div className="p-4 bg-gray-50 min-h-full">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
                <h1 className="text-xl font-bold text-gray-800 mb-2">Confirm Asset Ownership</h1>
                <p className="text-sm text-gray-600 mb-4">Enter an asset's serial number or vehicle registration plate to find its registered owner.</p>
                
                <form onSubmit={handleSearch} className="space-y-3">
                    <input 
                        type="text" 
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="Enter Serial or Reg. Number" 
                        className="w-full p-3 border rounded-lg"
                        autoFocus
                    />
                    <button type="submit" disabled={isLoading} className="w-full bg-brand-dark text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            <div className="mt-6">
                {isLoading && <LoadingSpinner message="Checking asset database..." />}
                
                {result && result !== 'not_found' && (
                    <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-500 animate-fade-in">
                        <h3 className="font-bold text-lg text-green-800">Asset Found & Verified</h3>
                        <div className="mt-3 space-y-2 text-sm">
                            <p><strong>Item:</strong> {result.items?.[0]?.description || result.model}</p>
                            <p><strong>Identifier:</strong> {result.registrationNumber || result.items?.[0]?.serial}</p>
                            <p><strong>Registered Owner:</strong> {result.ownerPhone ? `****` + result.ownerPhone.slice(-4) : 'N/A'}</p>
                             <p className="mt-3 text-xs text-gray-500">Owner's full contact details are masked for privacy. This item is confirmed to be registered on the $KILL platform.</p>
                        </div>
                    </div>
                )}

                {result === 'not_found' && (
                    <div className="bg-white p-4 rounded-xl shadow-md border-l-4 border-red-500 animate-fade-in">
                         <h3 className="font-bold text-lg text-red-800">Asset Not Found</h3>
                         <p className="mt-2 text-sm text-gray-700">No asset with this identifier is registered in the $KILL database. The item may be unregistered or the identifier is incorrect. Proceed with caution.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnershipCheckView;