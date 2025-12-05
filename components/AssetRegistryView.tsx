import React from 'react';
import type { Document, ServiceProvider } from '../types';
// FIX: Update import path for CurrentPage to avoid circular dependency
import type { CurrentPage } from '../types';

interface AssetRegistryViewProps {
    documents: Document[];
    currentUser: Partial<ServiceProvider> | null;
    onNavigate: (page: CurrentPage) => void;
    onSelectDocument: (doc: Document) => void;
}

const verificationStyles: Record<NonNullable<Document['verificationStatus']>, { classes: string, text: string }> = {
    Unverified: { classes: 'bg-gray-100 text-gray-700', text: 'Unverified' },
    Pending: { classes: 'bg-yellow-100 text-yellow-700', text: 'Pending' },
    Verified: { classes: 'bg-blue-100 text-blue-700', text: 'Verified' },
    Rejected: { classes: 'bg-red-100 text-red-700', text: 'Rejected' },
};

const AssetListItem: React.FC<{ doc: Document; onClick: () => void }> = ({ doc, onClick }) => {
    const assetName = doc.items?.[0]?.description || doc.model || 'Unknown Asset';
    const assetIdentifier = doc.registrationNumber || doc.items?.[0]?.serial || 'No Identifier';

    return (
        <button onClick={onClick} className="w-full text-left bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 border">
            <img 
                src={doc.productImages?.[0] || 'https://picsum.photos/seed/asset-placeholder/200/200'}
                alt={assetName}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-200"
            />
            <div className="flex-grow overflow-hidden">
                <p className="font-bold text-gray-800 truncate">{assetName}</p>
                <p className="text-xs font-mono text-gray-500 mt-1">{assetIdentifier}</p>
                {doc.verificationStatus && (
                    <div className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${verificationStyles[doc.verificationStatus].classes}`}>
                        {verificationStyles[doc.verificationStatus].text}
                    </div>
                )}
            </div>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
    );
};

const AssetRegistryView: React.FC<AssetRegistryViewProps> = ({ documents, currentUser, onNavigate, onSelectDocument }) => {
    const myAssets = documents.filter(doc => doc.isAsset && doc.ownerPhone === currentUser?.phone);

    return (
        <div className="p-4 bg-gray-50 min-h-full space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 border">
                <h2 className="font-bold text-lg text-gray-800">Ownership Check</h2>
                <p className="text-sm text-gray-600">Verify the ownership of a tool or vehicle before you buy by checking its serial or registration number.</p>
                <button onClick={() => onNavigate('ownershipCheck')} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg">
                    Check an Asset
                </button>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg text-gray-800">My Garage & Toolkit</h2>
                    <button onClick={() => onNavigate('registerAsset')} className="text-sm font-semibold text-white bg-brand-navy px-4 py-2 rounded-lg">
                        + Register
                    </button>
                </div>

                {myAssets.length > 0 ? (
                    <div className="space-y-3">
                        {myAssets.map(asset => (
                            <AssetListItem key={asset.id} doc={asset} onClick={() => onSelectDocument(asset)} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-10 text-gray-500 bg-white rounded-xl border">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Assets Registered</h3>
                        <p className="mt-1 text-sm text-gray-500">Register your tools and vehicles to protect them.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetRegistryView;