import React from 'react';
import type { Document, ServiceProvider } from '../types';
// FIX: Update import path for CurrentPage to avoid circular dependency
import type { CurrentPage } from '../types';

interface AssetRegistryViewProps {
    documents: Document[];
    currentUser: Partial<ServiceProvider> | null;
    onNavigate: (page: CurrentPage) => void;
    onSelectDocument: (doc: Document) => void;
    onRespondToTransfer: (documentId: string, decision: 'accept' | 'deny') => void;
}

const verificationStyles: Record<NonNullable<Document['verificationStatus']>, { classes: string, text: string }> = {
    Unverified: { classes: 'bg-surface-sunken text-ink', text: 'Unverified' },
    Pending: { classes: 'bg-warning-soft text-warning-strong', text: 'Pending' },
    Verified: { classes: 'bg-info-soft text-info-strong', text: 'Verified' },
    Rejected: { classes: 'bg-danger-soft text-danger-strong', text: 'Rejected' },
};

const assetName = (doc: Document) => doc.items?.[0]?.description || doc.model || 'Unknown Asset';
const assetIdentifier = (doc: Document) => doc.registrationNumber || doc.items?.[0]?.serial || 'No identifier';

const AssetListItem: React.FC<{ doc: Document; onClick: () => void }> = ({ doc, onClick }) => (
    <button onClick={onClick} className="card-interactive w-full flex items-center gap-4 p-3 text-left">
        <img
            src={doc.productImages?.[0] || 'https://picsum.photos/seed/asset-placeholder/200/200'}
            alt={assetName(doc)}
            className="w-16 h-16 rounded-control object-cover flex-shrink-0 bg-surface-sunken"
        />
        <div className="flex-grow overflow-hidden">
            <p className="font-bold text-ink truncate">{assetName(doc)}</p>
            <p className="text-caption font-mono text-ink-soft mt-1">{assetIdentifier(doc)}</p>
            {doc.verificationStatus && (
                <span className={`badge mt-2 ${verificationStyles[doc.verificationStatus].classes}`}>
                    {verificationStyles[doc.verificationStatus].text}
                </span>
            )}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-ink-faint flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    </button>
);

// A transfer someone else initiated, waiting on the current user to accept or deny it. This is the
// receiving side of DocumentDetailView's "Transfer Asset" button — the API to finalize it
// (api.finalizeAssetTransfer) already existed; this is its first UI.
const IncomingTransferCard: React.FC<{ doc: Document; onRespond: (decision: 'accept' | 'deny') => void }> = ({ doc, onRespond }) => (
    <div className="card overflow-hidden border-brand-gold/40">
        <div className="flex items-center gap-4 p-3">
            <img
                src={doc.productImages?.[0] || 'https://picsum.photos/seed/asset-placeholder/200/200'}
                alt={assetName(doc)}
                className="w-14 h-14 rounded-control object-cover flex-shrink-0 bg-surface-sunken"
            />
            <div className="flex-grow overflow-hidden">
                <p className="font-bold text-ink truncate">{assetName(doc)}</p>
                <p className="text-caption text-ink-soft mt-0.5">From {doc.ownerPhone ? `••••${doc.ownerPhone.slice(-4)}` : 'the current owner'}</p>
            </div>
        </div>
        <div className="flex gap-2 border-t border-line bg-surface-muted p-3">
            <button onClick={() => onRespond('accept')} className="btn-primary flex-1 btn-sm">Accept</button>
            <button onClick={() => onRespond('deny')} className="btn-secondary flex-1 btn-sm">Decline</button>
        </div>
    </div>
);

const AssetRegistryView: React.FC<AssetRegistryViewProps> = ({ documents, currentUser, onNavigate, onSelectDocument, onRespondToTransfer }) => {
    const myAssets = documents.filter(doc => doc.isAsset && doc.ownerPhone === currentUser?.phone);
    const incomingTransfers = documents.filter(doc => doc.isAsset && currentUser?.phone && doc.pendingOwnerPhone === currentUser.phone);

    return (
        <div className="p-4 bg-surface-muted min-h-full space-y-6">
            <div>
                <h1 className="font-serif text-headline text-ink">Assets</h1>
                <p className="text-body text-ink-soft mt-1">
                    Anything with a serial number or IMEI — phones, cameras, drones, bicycles — registered here so
                    you can prove it's yours, and list it for sale once it's verified.
                </p>
            </div>

            {incomingTransfers.length > 0 && (
                <div>
                    <h2 className="font-bold text-lg text-ink mb-3">Incoming Transfers</h2>
                    <div className="space-y-3">
                        {incomingTransfers.map(doc => (
                            <IncomingTransferCard key={doc.id} doc={doc} onRespond={decision => onRespondToTransfer(doc.id, decision)} />
                        ))}
                    </div>
                </div>
            )}

            <div className="card p-4 space-y-3">
                <h2 className="font-bold text-lg text-ink">Check Before You Buy</h2>
                <p className="text-body text-ink-soft">Search a serial or registration number to find out who owns an item before you pay for it.</p>
                <button onClick={() => onNavigate('ownershipCheck')} className="btn-primary w-full">
                    Check an Asset
                </button>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg text-ink">My Assets</h2>
                    <div className="flex gap-2">
                        <button onClick={() => onNavigate('scanDocument')} className="btn-secondary btn-sm">Scan Receipt</button>
                        <button onClick={() => onNavigate('registerAsset')} className="btn-primary btn-sm">+ Register</button>
                    </div>
                </div>

                {myAssets.length > 0 ? (
                    <div className="space-y-3">
                        {myAssets.map(asset => (
                            <AssetListItem key={asset.id} doc={asset} onClick={() => onSelectDocument(asset)} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <h3 className="mt-2 text-body font-medium text-ink">No Assets Registered</h3>
                        <p className="mt-1 text-body text-ink-soft">Scan a receipt or register one manually to protect it.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetRegistryView;
