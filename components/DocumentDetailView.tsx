import React, { useState } from 'react';
import type { Document, ServiceProvider } from '../types';
import * as api from '../services/api';

const verificationStyles: Record<NonNullable<Document['verificationStatus']>, { classes: string, text: string }> = {
    Unverified: { classes: 'bg-gray-100 text-gray-800', text: 'Not Verified' },
    Pending: { classes: 'bg-yellow-100 text-yellow-800', text: 'Verification Pending' },
    Verified: { classes: 'bg-blue-100 text-blue-800', text: 'Verified' },
    Rejected: { classes: 'bg-red-100 text-red-800', text: 'Verification Rejected' },
};
const formatKsh = (amount: number) => `Ksh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DocumentDetailView: React.FC<{ document: Document; onBack: () => void; onUpdate: (doc: Document) => void; currentUser: ServiceProvider; }> = ({ document, onBack, onUpdate, currentUser }) => {
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isLogbookModalOpen, setIsLogbookModalOpen] = useState(false);
    
    const assetImages = document.productImages?.length ? document.productImages : (document.scannedImageUrl ? [document.scannedImageUrl] : []);
    
    const handleRequestVerification = () => {
        onUpdate({ ...document, verificationStatus: 'Pending' });
        const verificationLink = `https://nikosoko.app/verify/${document.id}`;
        const message = `Hi ${document.issuerName}, please verify this receipt for a purchase made on ${new Date(document.date).toLocaleDateString()}.\n\nClick to verify: ${verificationLink}\n\nJoin Niko Soko to issue secure, transferable digital receipts for your customers!`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        alert("A verification link has been prepared. Please send it to the seller via WhatsApp to complete the process.");
    };

    const handleTransfer = async () => {
        if(document.verificationStatus !== 'Verified') {
            alert('Only verified assets can be transferred.');
            return;
        }
        if(document.pendingOwnerPhone) {
            alert('This asset is already pending transfer.');
            return;
        }

        let newOwnerPhone: string | null = null;
        try {
            // @ts-ignore
            if ('contacts' in navigator && 'select' in navigator.contacts) {
                // @ts-ignore
                const contacts = await navigator.contacts.select(['tel'], { multiple: false });
                if (contacts.length > 0 && contacts[0].tel.length > 0) {
                    newOwnerPhone = contacts[0].tel[0].replace(/[\s-]/g, '');
                }
            } else {
                throw new Error("Contacts API not supported.");
            }
        } catch (err) {
            console.warn("Contacts Picker API failed, falling back to prompt:", err);
            newOwnerPhone = prompt("Could not access contacts. Please enter the new owner's phone number (e.g., 0722123456):");
        }

        if (newOwnerPhone && newOwnerPhone.length > 8) {
             // FIX: Removed extra `currentUser` argument from `initiateAssetTransfer` call.
             const updatedDoc = await api.initiateAssetTransfer(document.id, newOwnerPhone);
             onUpdate(updatedDoc);
             alert(`Transfer request sent to ${newOwnerPhone}. They will receive a notification in their Niko Soko inbox to accept or deny the transfer.`);
        } else if (newOwnerPhone) {
            alert("Invalid phone number entered.");
        }
    };
    
    return (
        <div className="bg-gray-100 min-h-full pb-6">
            <div className="relative">
                <img src={assetImages[mainImageIndex] || 'https://picsum.photos/seed/placeholder/800/600'} alt="Asset" className="w-full h-64 object-cover bg-gray-200" />
                <button onClick={onBack} className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full z-10">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {assetImages.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                        {assetImages.map((_, index) => (
                            <button key={index} onClick={() => setMainImageIndex(index)} className={`w-2 h-2 rounded-full ${index === mainImageIndex ? 'bg-white' : 'bg-white/50'}`}></button>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <h1 className="text-2xl font-bold text-gray-900">{document.items?.[0]?.description || document.model || 'Asset Details'}</h1>
                    
                    {document.assetType === 'Vehicle' ? (
                         <div className="font-mono text-gray-500 mt-1 grid grid-cols-2 gap-x-4">
                            <span>{document.registrationNumber}</span>
                            <span>YOM: {document.yearOfManufacture}</span>
                         </div>
                    ) : (
                        document.items?.[0]?.serial && <p className="text-gray-500 font-mono mt-1">SN: {document.items[0].serial}</p>
                    )}

                    {document.specifications && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{document.specifications}</p>}
                </div>

                 <div className="bg-white rounded-xl shadow-sm p-4">
                     <h2 className="font-semibold text-gray-800 mb-3">Ownership & Verification</h2>
                     {document.pendingOwnerPhone && (
                        <div className="text-center p-2 rounded-lg font-semibold text-sm mb-3 bg-orange-100 text-orange-800">
                            Transfer pending for {document.pendingOwnerPhone}
                        </div>
                     )}
                     {document.verificationStatus && (
                        <div className={`text-center p-2 rounded-lg font-semibold text-sm mb-3 ${verificationStyles[document.verificationStatus].classes}`}>
                            {verificationStyles[document.verificationStatus].text}
                        </div>
                    )}
                    <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Current Owner:</span>
                            <span className="font-semibold text-gray-800">{document.ownerPhone ? `******${document.ownerPhone.slice(-4)}` : 'You'}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-600">Seller:</span>
                            <span className="font-semibold text-gray-800">{document.issuerName}</span>
                        </div>
                        {document.logbookImageUrl && (
                             <div className="pt-2">
                                <button onClick={() => setIsLogbookModalOpen(true)} className="text-sm text-blue-600 font-semibold hover:underline">
                                    View Logbook
                                </button>
                            </div>
                        )}
                    </div>
                 </div>

                 <div className="bg-white rounded-xl shadow-sm p-4">
                    <h2 className="font-semibold text-gray-800 mb-3">Purchase Details</h2>
                    <div className="text-sm space-y-2">
                         <div className="flex justify-between">
                            <span className="text-gray-600">Purchase Date:</span>
                            <span className="font-semibold text-gray-800">{new Date(document.date).toLocaleDateString()}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-600">Amount Paid:</span>
                            <span className="font-semibold text-gray-800">{formatKsh(document.amount)}</span>
                        </div>
                         {document.scannedImageUrl && (
                            <div className="pt-3">
                                <button onClick={() => setIsReceiptModalOpen(true)} className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                                    <img src={document.scannedImageUrl} alt="Receipt thumbnail" className="w-10 h-10 object-cover rounded-md border"/>
                                    <span>View Original Receipt</span>
                                </button>
                            </div>
                         )}
                    </div>
                </div>

                <div className="pt-2 space-y-3">
                    {document.isAsset && document.ownerPhone === currentUser.phone && (
                        <button onClick={handleTransfer} disabled={!!document.pendingOwnerPhone} className="w-full bg-brand-dark text-white font-bold py-3 rounded-xl shadow-md hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {document.pendingOwnerPhone ? 'Transfer Pending' : 'Transfer Asset'}
                        </button>
                    )}
                    {document.type === 'Receipt' && document.verificationStatus === 'Unverified' && (
                        <button onClick={handleRequestVerification} className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition">Request Seller Verification</button>
                    )}
                     <button onClick={() => alert("Coming soon: Sell this verified asset on Tukosoko!")} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-green-700 transition">
                        Sell This Asset
                    </button>
                </div>
            </div>

            {isReceiptModalOpen && document.scannedImageUrl && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setIsReceiptModalOpen(false)}>
                    <img src={document.scannedImageUrl} alt="Full receipt" className="max-w-full max-h-full rounded-lg" onClick={e => e.stopPropagation()} />
                </div>
            )}
            {isLogbookModalOpen && document.logbookImageUrl && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setIsLogbookModalOpen(false)}>
                    <img src={document.logbookImageUrl} alt="Logbook" className="max-w-full max-h-full rounded-lg" onClick={e => e.stopPropagation()} />
                </div>
            )}
        </div>
    )
}
export default DocumentDetailView;
