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
    Unverified: { classes: 'bg-surface-sunken text-ink', text: 'Unverified' },
    Pending: { classes: 'bg-warning-soft text-warning-strong', text: 'Pending' },
    Verified: { classes: 'bg-info-soft text-info-strong', text: 'Verified' },
    Rejected: { classes: 'bg-danger-soft text-danger-strong', text: 'Rejected' },
};

const AssetListItem: React.FC<{ doc: Document; onClick: () => void }> = ({ doc, onClick }) => {
    const assetName = doc.items?.[0]?.description || doc.model || 'Unknown Asset';
    const assetIdentifier = doc.registrationNumber || doc.items?.[0]?.serial || 'No Identifier';

    return (
        <button onClick={onClick} className="w-full text-left bg-white p-3 rounded-Nonecard shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 border">
            <img 
                src={doc.productImages?.[0] || 'https://picsum.photos/seed/asset-placeholder/200/200'}
                alt={assetName}
                className="w-16 h-16 rounded-Nonecontrol object-cover flex-shrink-0 bg-surface-sunken"
            />
            <div className="flex-grow overflow-hidden">
                <p className="font-bold text-ink truncate">{assetName}</p>
                <p className="text-caption font-mono text-ink-soft mt-1">{assetIdentifier}</p>
                {doc.verificationStatus && (
                    <div className={`mt-2 inline-block text-caption font-semibold px-2 py-0.5 rounded-full ${verificationStyles[doc.verificationStatus].classes}`}>
                        {verificationStyles[doc.verificationStatus].text}
                    </div>
                )}
            </div>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-ink-faint flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
    );
};

const AssetRegistryView: React.FC<AssetRegistryViewProps> = ({ documents, currentUser, onNavigate, onSelectDocument }) => {
    const myAssets = documents.filter(doc => doc.isAsset && doc.ownerPhone === currentUser?.phone);

    return (
        <div className="p-4 bg-surface-muted min-h-full space-y-6">
            <div className="bg-white p-4 rounded-Nonecard shadow-sm space-y-3 border">
                <h2 className="font-bold text-lg text-ink">Ownership Check</h2>
                <p className="text-body text-ink-soft">Verify the ownership of a tool or vehicle before you buy by checking its serial or registration number.</p>
                <button onClick={() => onNavigate('ownershipCheck')} className="w-full bg-info text-white font-bold py-3 px-4 rounded-Nonecontrol">
                    Check an Asset
                </button>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg text-ink">My Garage & Toolkit</h2>
                    <button onClick={() => onNavigate('registerAsset')} className="text-body font-semibold text-white bg-brand-navy px-4 py-2 rounded-Nonecontrol">
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
                     <div className="text-center py-10 text-ink-soft bg-white rounded-Nonecontrol border">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <h3 className="mt-2 text-body font-medium text-ink">No Assets Registered</h3>
                        <p className="mt-1 text-body text-ink-soft">Register your tools and vehicles to protect them.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetRegistryView;