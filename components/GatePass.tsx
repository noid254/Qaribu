
import React, { useState, useMemo, useRef } from 'react';
import type { QaRibuRequest, ServiceProvider, Premise, UnitDetails, UnitKey } from '../types';
import * as api from '../services/api';

// --- Types ---

type GatePassProps = {
    allProviders: ServiceProvider[];
    allTenants: ServiceProvider[];
    premise?: Premise; 
    managedPremises?: Premise[]; 
    currentUser: ServiceProvider | null;
    isAuthenticated: boolean;
    qaribuRequests: QaRibuRequest[];
    onCreateRequest: (data: Omit<QaRibuRequest, 'id' | 'status'>) => Promise<void>;
    onUpdateRequestStatus: (id: string, status: QaRibuRequest['status']) => Promise<void>;
    onAuthClick: () => void;
    onGoToSignup: () => void;
    onSelectProvider?: (provider: ServiceProvider) => void;
    onScanClick: () => void;
    onRegisterPremise: (data: Partial<Premise>) => void;
    onBack: () => void;
    onUpdateHostDetails?: (details: UnitDetails) => void;
    onUpdateProfile?: (data: Partial<ServiceProvider>) => Promise<void>;
    scanResult?: { allowed: boolean; message: string; request?: QaRibuRequest, user?: ServiceProvider, accessDetails?: { purpose: string, duration: string, role: string } } | null;
    onClearScanResult?: () => void;
    onUpdatePremise?: (premise: Premise) => void;
    savedContacts?: string[];
};

type WalletCardData = {
    id: string;
    type: 'UNIVERSAL_ID' | 'VISITOR_PASS' | 'CONTACT';
    title: string;
    subtitle: string;
    holderName: string;
    holderImage: string;
    qrData: string;
    status: 'Active' | 'Expired' | 'Verified';
    bgClass: string; // Tailwind gradient class
    icon?: React.ReactNode;
    govIdUrl?: string;
    phone?: string;
    whatsapp?: string;
    details?: { label: string; value: string; }[];
    provider?: ServiceProvider;
};

// --- Helper Components ---

const WalletCard: React.FC<{ 
    data: WalletCardData; 
    index: number; 
    isActive: boolean; 
    isAnyActive: boolean;
    isFlipped: boolean; 
    onClick: () => void; 
    onClose: () => void;
    onUploadId?: (file: File) => void;
    onViewProfile?: (provider: ServiceProvider) => void;
}> = ({ data, index, isActive, isAnyActive, isFlipped, onClick, onClose, onUploadId, onViewProfile }) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- STACKING LOGIC (Optimized for "Apple Wallet" feel) ---
    const spacing = 60; // Visible header height for stacked cards
    
    let style: React.CSSProperties = {
        zIndex: isActive ? 100 : index, // Higher index = closer to user in stack
        transition: 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
        position: 'absolute',
        width: '100%',
        maxWidth: '340px',
        height: '500px',
        left: 0,
        right: 0,
        margin: '0 auto',
        transformOrigin: 'top center',
        top: 0, // Base position
    };

    if (isActive) {
        // Active: Move to top of container
        style.transform = `translateY(0px) scale(1)`;
    } else if (isAnyActive) {
        // Inactive when another is open: Push down off screen
        style.transform = `translateY(${600 + (index * 20)}px) scale(0.95)`;
    } else {
        // Stacked: Each card moves down by 'spacing' relative to the one before it.
        style.transform = `translateY(${index * spacing}px) scale(1)`; 
    }

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (data.phone) window.open(`tel:${data.phone}`);
    };

    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (data.whatsapp) window.open(`https://wa.me/${data.whatsapp}`, '_blank');
    };

    return (
        <div 
            style={style}
            className="cursor-pointer perspective-1000 will-change-transform"
            onClick={(e) => {
                e.stopPropagation();
                if(!isActive) onClick();
            }}
        >
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .text-shadow { text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
            `}</style>

            <div className={`relative w-full h-full duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* --- FRONT SIDE --- */}
                <div className={`absolute inset-0 w-full h-full backface-hidden rounded-[24px] shadow-2xl overflow-hidden flex flex-col ${data.bgClass} text-white border-t border-white/20`}>
                    
                    {/* Header (Always Visible in Stack) */}
                    <div className="h-16 px-5 flex items-center justify-between relative z-10 shrink-0 mt-2">
                        <div className="flex items-center gap-3">
                            {data.icon && <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-sm border border-white/10 backdrop-blur-sm">{data.icon}</div>}
                            <div className="flex flex-col justify-center">
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-1">{data.subtitle}</p>
                                <h2 className="text-lg font-bold tracking-wide text-shadow leading-none">{data.title}</h2>
                            </div>
                        </div>
                        {isActive ? (
                            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 border border-white/10 backdrop-blur-sm transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        ) : (
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${data.status === 'Active' ? 'bg-green-400/20 text-green-100' : 'bg-gray-400/20 text-gray-200'}`}>
                                {data.status}
                            </div>
                        )}
                    </div>

                    {/* Main Card Body - QR Code */}
                    <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
                        <div className="bg-white p-3 rounded-xl shadow-xl mt-1 relative overflow-hidden">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(data.qrData)}`} 
                                alt="QR Code" 
                                className="w-44 h-44 mix-blend-multiply relative z-10"
                            />
                            {/* Metallic Chip Effect */}
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
                        </div>
                        
                        {isActive && <p className="text-xs font-medium mt-6 opacity-80 animate-pulse bg-black/20 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">Tap Card to Flip</p>}
                    </div>

                    {/* Footer */}
                    <div className="p-5 bg-gradient-to-t from-black/50 to-transparent border-t border-white/5 shrink-0">
                        <div className="flex items-center gap-3">
                            <img src={data.holderImage} alt="Holder" className="w-10 h-10 rounded-full border-2 border-white/30 object-cover shadow-sm bg-gray-800" />
                            <div className="flex-1">
                                <p className="text-[9px] uppercase font-bold opacity-70 tracking-widest">Authorized Holder</p>
                                <p className="font-bold text-base leading-tight text-shadow">{data.holderName}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Click Area for Flipping (Only when active) */}
                    {isActive && (
                        <div 
                            className="absolute inset-0 top-16 bottom-20 z-10" 
                            onClick={(e) => { e.stopPropagation(); onClick(); }} 
                        />
                    )}
                </div>

                {/* --- BACK SIDE --- */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[24px] shadow-2xl overflow-hidden bg-white text-gray-800 flex flex-col border border-gray-200">
                    <div className={`${data.bgClass} h-20 flex items-center justify-between px-6 text-white shadow-md shrink-0`}>
                        <div>
                            <h3 className="font-bold text-lg text-shadow">Details</h3>
                            <p className="text-[10px] opacity-80 font-mono tracking-wider">{data.id.slice(0, 12).toUpperCase()}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 border border-white/10 transition">
                            Flip Back
                        </button>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                            {data.details?.map((detail, i) => (
                                <div key={i} className="flex justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{detail.label}</span>
                                    <span className="text-sm font-bold text-gray-800 text-right truncate max-w-[65%]">{detail.value}</span>
                                </div>
                            ))}
                        </div>

                        {data.type === 'VISITOR_PASS' && (
                            <div className="mt-6">
                                <button className="w-full py-3.5 bg-brand-navy text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                                    Share Invite Link
                                </button>
                            </div>
                        )}

                        {data.type === 'UNIVERSAL_ID' && (
                            <div className="mt-6">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Physical ID</p>
                                {data.govIdUrl ? (
                                    <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 aspect-[3/2] relative group shadow-sm">
                                        <img src={data.govIdUrl} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-bold border border-white px-3 py-1 rounded-full">Verified</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="border-2 border-dashed border-gray-300 bg-white rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                                        <span className="text-xs font-bold text-gray-500 block">Upload ID Photo</span>
                                        <span className="text-[10px] text-gray-400">For security verification</span>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0] && onUploadId) onUploadId(e.target.files[0]); }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {data.type === 'CONTACT' && (
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button onClick={handleCall} className="bg-white text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-50 border border-gray-200 shadow-sm text-sm">Call</button>
                                <button onClick={handleWhatsApp} className="bg-[#25D366] text-white font-bold py-3 rounded-xl hover:bg-[#128C7E] shadow-md text-sm">WhatsApp</button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); if(data.provider && onViewProfile) onViewProfile(data.provider); }} 
                                    className="col-span-2 bg-brand-navy text-white font-bold py-3 rounded-xl mt-1 shadow-lg hover:bg-gray-800 transition-colors text-sm"
                                >
                                    View Full Profile
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ... [ScanVerificationModal & UnitProfileModal reuse existing logic] ...

const ScanVerificationModal: React.FC<{
    scanResult: { allowed: boolean; message: string; request?: QaRibuRequest; user?: ServiceProvider, accessDetails?: { purpose: string, duration: string, role: string } };
    onClose: () => void;
    onAdmit: () => void;
}> = ({ scanResult, onClose, onAdmit }) => {
    const { allowed, message, request, user, accessDetails } = scanResult;
    const visitorName = user?.name || request?.visitorName || 'Unknown Visitor';
    const visitorImage = user?.avatarUrl || request?.visitorAvatar || 'https://i.pravatar.cc/150?img=68';
    
    const [idNumber, setIdNumber] = useState('');
    const [showIdImage, setShowIdImage] = useState(false);

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-sm overflow-y-auto">
            <div className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ${allowed ? 'bg-green-600' : 'bg-red-600'} transition-colors duration-500 my-auto`}>
                <div className="p-6 text-center text-white pb-12">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/50">
                        {allowed ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight uppercase">{allowed ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</h1>
                    <p className="text-sm font-medium opacity-90 mt-1">{message}</p>
                </div>

                <div className="bg-white rounded-t-3xl p-6 pb-8 -mt-8 relative">
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-gray-200">
                        <img src={visitorImage} alt={visitorName} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="mt-16 text-center">
                        <h2 className="text-2xl font-bold text-gray-900">{visitorName}</h2>
                        
                        {allowed && (
                            <>
                                <div className="flex justify-center gap-2 mt-3 mb-6">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase">{accessDetails?.role}</span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">{accessDetails?.purpose}</span>
                                </div>

                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left mb-6">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 border-b pb-2">Physical Identity Check</h3>
                                    
                                    {user?.govIdUrl && (
                                        <div className="mb-4">
                                            <button 
                                                onClick={() => setShowIdImage(!showIdImage)}
                                                className="w-full text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 py-2 rounded-lg mb-2"
                                            >
                                                {showIdImage ? 'Hide Digital ID' : 'View Digital ID'}
                                            </button>
                                            {showIdImage && (
                                                <div className="relative aspect-[3/2] w-full bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                                                    <img src={user.govIdUrl} alt="Digital ID" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Confirm ID Number</label>
                                        <input 
                                            type="text" 
                                            value={idNumber}
                                            onChange={(e) => setIdNumber(e.target.value)}
                                            placeholder="Enter physical ID #"
                                            className="w-full p-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button onClick={onClose} className="w-full bg-brand-navy text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform">
                            Close & Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UnitProfileModal: React.FC<{
    unit: Partial<UnitKey>;
    onClose: () => void;
    mode: 'manager' | 'host';
    isNew?: boolean;
    premiseId?: string; 
    onSave: (updatedUnit: Partial<UnitKey>) => void;
    allProviders?: ServiceProvider[]; 
    onViewProfile?: (provider: ServiceProvider) => void;
}> = ({ unit, onClose, mode, isNew = false, premiseId, onSave, allProviders, onViewProfile }) => {
    const [unitNumber, setUnitNumber] = useState(unit.unitNumber || '');
    const [floor, setFloor] = useState(unit.floor || '');
    const [type, setType] = useState(unit.type || 'Residential');
    const [configuration, setConfiguration] = useState(unit.configuration || '');
    const [size, setSize] = useState(unit.size || '');
    const [rent, setRent] = useState(unit.rentAmount?.toString() || '');
    const [rentPeriod, setRentPeriod] = useState(unit.rentPeriod || 'Monthly');
    const [description, setDescription] = useState(unit.description || '');
    const [amenities, setAmenities] = useState<string[]>(unit.amenities || []);
    const [newAmenity, setNewAmenity] = useState('');
    const [images, setImages] = useState<string[]>(unit.images || []);
    const [displayName, setDisplayName] = useState(unit.tenantName || '');
    const [isAssigning, setIsAssigning] = useState(false);
    const [tenantPhone, setTenantPhone] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    const tenantProfile = allProviders?.find(p => p.id === unit.tenantId);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddAmenity = () => {
        if (newAmenity.trim()) {
            setAmenities([...amenities, newAmenity.trim()]);
            setNewAmenity('');
        }
    };

    const handleRemoveAmenity = (index: number) => {
        setAmenities(amenities.filter((_, i) => i !== index));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const filesToRead = Array.from(files).slice(0, 12 - images.length);
            filesToRead.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => setImages(prev => [...prev, reader.result as string]);
                reader.readAsDataURL(file as Blob);
            });
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        const updated: Partial<UnitKey> = {
            id: unit.id,
            unitNumber,
            floor,
            type,
            configuration,
            size,
            rentAmount: parseFloat(rent) || 0,
            rentPeriod,
            description,
            amenities,
            images,
            status: isNew ? 'Vacant' : unit.status,
            tenantId: unit.tenantId, // Preserve existing
            tenantName: displayName || unit.tenantName
        };
        onSave(updated);
        onClose();
    };

    const handleRevoke = () => {
        if(confirm("Are you sure you want to revoke access? This will remove the tenant from this unit.")) {
            onSave({ 
                ...unit, 
                status: 'Vacant', 
                tenantId: undefined, 
                tenantName: undefined 
            });
            onClose();
        }
    }

    const handleGenerateKey = () => {
        if (!tenantPhone || tenantPhone.length < 9) {
            alert("Please enter a valid phone number.");
            return;
        }
        const keyData = `MASTER:TENANT:${premiseId}:${unitNumber}`;
        setGeneratedKey(keyData);
    };

    const handleShareKey = () => {
        const message = `Hello, here is your digital key for Unit ${unitNumber} at this premise.\n\nTo accept, please open the NikoSoko app and scan the QR code, or use this setup code: ${generatedKey}`;
        const url = `https://wa.me/254${tenantPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        
        onSave({ 
            ...unit, 
            status: 'Occupied', 
            tenantName: `Pending (${tenantPhone})` 
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-lg h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-lg">
                        {isNew ? 'Add New Key' : (mode === 'manager' ? `Manage Key: ${unit.unitNumber}` : 'Edit Unit Profile')}
                    </h3>
                    <button onClick={onClose} className="p-1 bg-gray-200 rounded-full hover:bg-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-6 relative">
                    {/* ASSIGN KEY OVERLAY */}
                    {isAssigning && (
                        <div className="absolute inset-0 bg-white z-10 p-6 flex flex-col items-center justify-center">
                            <h3 className="text-xl font-bold text-brand-navy mb-2">Assign Digital Key</h3>
                            <p className="text-sm text-gray-500 mb-6 text-center">Generate a master key for <strong>{unit.unitNumber}</strong>.</p>
                            
                            {!generatedKey ? (
                                <div className="w-full max-w-xs space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Tenant Phone Number</label>
                                        <div className="flex items-center bg-gray-100 rounded-lg border border-gray-300 px-3">
                                            <span className="text-gray-500 font-bold">+254</span>
                                            <input 
                                                type="tel" 
                                                value={tenantPhone} 
                                                onChange={e => setTenantPhone(e.target.value.replace(/\D/g,''))}
                                                className="w-full p-3 bg-transparent focus:outline-none"
                                                placeholder="722 123 456"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <button onClick={handleGenerateKey} className="w-full bg-brand-navy text-white font-bold py-3 rounded-xl shadow-lg">Generate QR Key</button>
                                    <button onClick={() => setIsAssigning(false)} className="w-full text-gray-500 text-sm font-semibold py-2">Cancel</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center w-full max-w-xs space-y-6">
                                    <div className="bg-white p-4 rounded-2xl shadow-xl border-2 border-brand-gold">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedKey)}`} 
                                            alt="Master Key QR" 
                                            className="w-48 h-48 mix-blend-multiply"
                                        />
                                    </div>
                                    <p className="text-xs text-center text-gray-500">
                                        Ask the tenant to scan this code, or share the activation link via WhatsApp.
                                    </p>
                                    <button onClick={handleShareKey} className="w-full bg-[#25D366] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#128C7E]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>
                                        Share Link
                                    </button>
                                    <button onClick={() => { setGeneratedKey(null); setIsAssigning(false); }} className="text-gray-500 text-sm font-semibold">Done</button>
                                </div>
                            )}
                        </div>
                    )}

                    {mode === 'manager' ? (
                        <>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-xs font-bold text-blue-800 uppercase mb-3">Mandatory Details</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Door / Unit No. *</label>
                                        <input value={unitNumber} onChange={e => setUnitNumber(e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. A4" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Floor Number *</label>
                                        <input value={floor} onChange={e => setFloor(e.target.value)} className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 1st" />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Nature of Space (Config) *</label>
                                    <input 
                                        value={configuration} 
                                        onChange={e => setConfiguration(e.target.value)} 
                                        className="w-full p-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        placeholder="e.g. 2 Bedroom, Shop, Office"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Type Category</label>
                                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Shop">Shop</option>
                                        <option value="Warehouse">Warehouse</option>
                                        <option value="Gate">Gate</option>
                                    </select>
                                </div>
                            </div>

                            {/* --- Optional Listing Details --- */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Listing Details (For Vacancy)</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Rent Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">Ksh</span>
                                            <input type="number" value={rent} onChange={e => setRent(e.target.value)} className="w-full p-2 pl-8 border rounded-lg" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Rent Period</label>
                                        <select value={rentPeriod} onChange={e => setRentPeriod(e.target.value as any)} className="w-full p-2 border rounded-lg bg-white">
                                            <option value="Monthly">Monthly</option>
                                            <option value="Quarterly">Quarterly</option>
                                            <option value="Yearly">Yearly</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Size</label>
                                    <input value={size} onChange={e => setSize(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="e.g. 1200 sqft" />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 border rounded-lg" placeholder="Listing description..." />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Amenities</label>
                                    <div className="flex gap-2 mb-2">
                                        <input 
                                            value={newAmenity} 
                                            onChange={e => setNewAmenity(e.target.value)} 
                                            className="flex-1 p-2 border rounded-lg text-sm" 
                                            placeholder="e.g. WiFi, Backup Power"
                                            onKeyDown={e => e.key === 'Enter' && handleAddAmenity()}
                                        />
                                        <button onClick={handleAddAmenity} className="bg-gray-200 px-3 py-1 rounded-lg text-xs font-bold hover:bg-gray-300">Add</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {amenities.map((am, idx) => (
                                            <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                                {am} <button onClick={() => handleRemoveAmenity(idx)} className="text-gray-400 hover:text-red-500">&times;</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mb-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Images (Max 12)</label>
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                                                <img src={img} className="w-full h-full object-cover" />
                                                <button onClick={() => handleRemoveImage(idx)} className="absolute top-0 right-0 bg-black/50 text-white w-5 h-5 flex items-center justify-center text-xs">&times;</button>
                                            </div>
                                        ))}
                                        {images.length < 12 && (
                                            <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50">
                                                <span className="text-xl">+</span>
                                            </button>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </div>
                            </div>
                            
                            {!isNew && unit.status === 'Occupied' && (
                                <div className="pt-4 border-t">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Current Tenant</p>
                                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg mb-3">
                                        <div className="flex items-center gap-2">
                                            {tenantProfile && <img src={tenantProfile.avatarUrl} className="w-8 h-8 rounded-full" />}
                                            <span className="text-sm font-semibold">{unit.tenantName || 'Unknown'}</span>
                                        </div>
                                        {tenantProfile && onViewProfile && (
                                            <button onClick={() => onViewProfile(tenantProfile)} className="text-xs text-blue-600 font-bold">View Profile</button>
                                        )}
                                    </div>
                                    <button onClick={handleRevoke} className="w-full py-2 text-red-600 font-bold border border-red-200 bg-red-50 rounded-lg text-sm hover:bg-red-100">
                                        Revoke Access / Evict
                                    </button>
                                </div>
                            )}

                            {!isNew && unit.status === 'Vacant' && (
                                <div className="pt-4 border-t">
                                    <button onClick={() => setIsAssigning(true)} className="w-full py-3 bg-green-50 text-green-700 font-bold border border-green-200 rounded-xl text-sm hover:bg-green-100 flex items-center justify-center gap-2 shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.636a6 6 0 111.414-1.414l1.236 2.236A6 6 0 0119 9a2 2 0 01-2-2zM7.53 12.53l.223.223A2 2 0 009.5 13h2a2 2 0 002-2V9a2 2 0 00-1.767.77l-.223.223 1.768 1.768z" /></svg>
                                        Assign Key to Tenant
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        // Host Mode
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Display Name</label>
                            <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="e.g. The Smith Family" />
                            <p className="text-xs text-gray-400 mt-2">This name is visible to visitors and the premise manager.</p>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t bg-gray-50">
                    <button onClick={handleSave} className="w-full bg-brand-navy text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition hover:bg-gray-800">
                        {isNew ? 'Create Key' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main GatePass Component ---

const GatePass: React.FC<GatePassProps> = ({ 
    allProviders, managedPremises, premise, currentUser, qaribuRequests, 
    onCreateRequest, onUpdateRequestStatus, onAuthClick, onGoToSignup, onSelectProvider, onScanClick, 
    onRegisterPremise, onBack, scanResult, onClearScanResult, onUpdatePremise, onUpdateProfile, savedContacts
}) => {
    const [selectedPremise, setSelectedPremise] = useState<Premise | null>(premise || (managedPremises && managedPremises.length === 1 ? managedPremises[0] : null));
    
    // Manager State
    const [managerTab, setManagerTab] = useState<'keys' | 'notices'>('keys');
    const [keyFilter, setKeyFilter] = useState<'All' | 'Occupied' | 'Vacant'>('All');
    const [editingUnit, setEditingUnit] = useState<Partial<UnitKey> | null>(null);
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    
    // Gateman State
    const [manualCode, setManualCode] = useState('');
    const [recentActivity, setRecentActivity] = useState<string[]>(['Scan: 10:42 AM - Visitor Accepted', 'Scan: 10:15 AM - Tenant Entry']);
    const [showEndShiftModal, setShowEndShiftModal] = useState(false);
    const [shiftNote, setShiftNote] = useState('');

    // Visitor/Wallet State
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    // --- Wallet Data Logic ---
    const walletCards: WalletCardData[] = useMemo(() => {
        const cards: WalletCardData[] = [];
        
        // 1. Universal ID
        if (currentUser) {
            cards.push({
                id: 'universal_id',
                type: 'UNIVERSAL_ID',
                title: 'UNIVERSAL ID',
                subtitle: '$KILL ACCESS',
                holderName: currentUser.name,
                holderImage: currentUser.avatarUrl,
                qrData: `PROFILE:${currentUser.id}`,
                status: 'Active',
                bgClass: 'bg-gradient-to-br from-gray-900 to-gray-800', // Solid Dark
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>,
                govIdUrl: currentUser.govIdUrl,
                details: [
                    { label: 'Member Since', value: '2023' },
                    { label: 'Status', value: currentUser.isVerified ? 'Verified' : 'Basic' },
                    { label: 'Role', value: currentUser.service || 'Member' }
                ]
            });
        }

        // 2. Visitor Passes
        qaribuRequests.forEach(req => {
            const isExpired = new Date(req.expiresAt || '') < new Date() || req.status === 'Expired';
            let bgClass = "bg-gradient-to-br from-blue-600 to-blue-800"; // Solid Blue
            if (req.premiseType === 'Residence') bgClass = "bg-gradient-to-br from-emerald-600 to-teal-800"; // Solid Teal
            if (req.status === 'Expired') bgClass = "bg-gradient-to-br from-gray-500 to-gray-600";

            cards.push({
                id: req.id,
                type: 'VISITOR_PASS',
                title: req.premiseName || 'Premise Access',
                subtitle: req.premiseType === 'Residence' ? 'GUEST PASS' : 'VISITOR PASS',
                holderName: req.visitorName,
                holderImage: req.visitorAvatar || 'https://i.pravatar.cc/150?img=68',
                qrData: `QARIBU:${req.id}:${req.accessCode}`,
                status: isExpired ? 'Expired' : 'Active',
                bgClass: bgClass,
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.636a6 6 0 111.414-1.414l1.236 2.236A6 6 0 0119 9a2 2 0 01-2-2zM7.53 12.53l.223.223A2 2 0 009.5 13h2a2 2 0 002-2V9a2 2 0 00-1.767.77l-.223.223 1.768 1.768z" /></svg>,
                details: [
                    { label: 'Host', value: req.hostName },
                    { label: 'Destination', value: req.targetUnit || 'Main Gate' },
                    { label: 'Valid Until', value: new Date(req.expiresAt || '').toLocaleDateString() },
                    { label: 'Access Code', value: req.accessCode || 'N/A' }
                ]
            });
        });

        // 3. Saved Contacts
        if (savedContacts && savedContacts.length > 0) {
            savedContacts.forEach(contactId => {
                const contact = allProviders.find(p => p.id === contactId);
                if (contact) {
                    cards.push({
                        id: contact.id,
                        type: 'CONTACT',
                        title: contact.service,
                        subtitle: 'SAVED CONTACT',
                        holderName: contact.name,
                        holderImage: contact.avatarUrl,
                        qrData: `PROFILE:${contact.id}`,
                        status: contact.isOnline ? 'Active' : 'Expired', 
                        bgClass: 'bg-gradient-to-br from-purple-700 to-indigo-900', // Solid Purple
                        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
                        phone: contact.phone,
                        whatsapp: contact.whatsapp,
                        provider: contact, 
                        details: [
                            { label: 'Rating', value: `⭐ ${contact.rating.toFixed(1)}` },
                            { label: 'Location', value: contact.location },
                            { label: 'Rate', value: `${contact.currency} ${contact.hourlyRate}/hr` }
                        ]
                    });
                }
            });
        }

        return cards;
    }, [currentUser, qaribuRequests, savedContacts, allProviders]);

    const handleCardClick = (id: string) => {
        if (activeCardId === id) {
            setIsFlipped(!isFlipped);
        } else {
            setActiveCardId(id);
            setIsFlipped(false);
        }
    };

    const handleBackgroundClick = () => {
        if (activeCardId) {
            setActiveCardId(null);
            setIsFlipped(false);
        }
    }

    const handleUploadId = (file: File) => {
        if (!onUpdateProfile) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            onUpdateProfile({ govIdUrl: base64 });
            alert("ID Uploaded Successfully!");
        };
        reader.readAsDataURL(file);
    };

    // --- Gateman Functions ---
    const handleManualVerify = () => {
        if (!manualCode.trim()) return;
        api.verifyEntry(manualCode, selectedPremise?.id || '').then(result => {
             // In a real app, this would trigger the modal
             if(result.user || result.request) {
                 // Force modal display via scanResult prop update if we had direct access, 
                 // but here we are inside the component so we set local state or use alert for simulation if props are fixed.
                 // Ideally, call a prop function that updates parent state `scanResult`.
                 // For now, simulating success via alert as placeholder since onScanSuccess logic is in App.tsx
                 alert(result.message);
             } else {
                 alert(result.message);
             }
             setRecentActivity(prev => [`Manual Check: ${manualCode} - ${new Date().toLocaleTimeString()}`, ...prev].slice(0, 5));
             setManualCode('');
        });
    };

    const handleEndShiftConfirm = () => {
        api.sendShiftReport(selectedPremise?.id || '', { 
            scans: recentActivity.length + 15,
            incidents: 0,
            duration: '8h 00m',
            notes: shiftNote
        }).then(() => {
            alert("Shift ended. Report sent to manager.");
            setShowEndShiftModal(false);
            onBack();
        });
    };

    // --- RENDER LOGIC ---

    // 1. Manager View
    if (currentUser?.role === 'BuildingManager' && selectedPremise) {
        const units: UnitKey[] = [];
        selectedPremise.tenants.forEach((tid, idx) => {
            const tenant = allProviders.find(p => p.id === tid);
            units.push({
                id: `u_${idx}`,
                unitNumber: tenant?.unit || `U-${idx+1}`,
                floor: tenant?.floor || 'N/A',
                type: selectedPremise.type === 'Commercial' ? 'Commercial' : 'Residential',
                status: 'Occupied',
                tenantId: tid,
                tenantName: tenant?.name,
                configuration: 'Standard',
            });
        });
        selectedPremise.vacancies.forEach(v => units.push(v));

        const filteredUnits = units.filter(u => keyFilter === 'All' || u.status === keyFilter);

        const handleSaveUnit = (unitData: Partial<UnitKey>) => {
            let updatedPremise = { ...selectedPremise };
            
            if (unitData.status === 'Vacant' && unitData.tenantId) {
                 updatedPremise.tenants = updatedPremise.tenants.filter(t => t !== unitData.tenantId);
                 updatedPremise.vacancies.push({
                     ...unitData as UnitKey,
                     id: `vac_${Date.now()}`,
                     status: 'Vacant'
                 });
            } else if (isCreatingKey) {
                updatedPremise.vacancies.push({
                    ...unitData as UnitKey,
                    id: `vac_${Date.now()}`,
                    status: 'Vacant'
                });
            } else {
                updatedPremise.vacancies = updatedPremise.vacancies.map(v => v.id === unitData.id ? { ...v, ...unitData } as UnitKey : v);
            }

            if (onUpdatePremise) onUpdatePremise(updatedPremise);
            setSelectedPremise(updatedPremise);
            setEditingUnit(null);
            setIsCreatingKey(false);
        };

        return (
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                {editingUnit && (
                    <UnitProfileModal 
                        unit={editingUnit} 
                        mode="manager" 
                        isNew={isCreatingKey}
                        premiseId={selectedPremise.id}
                        onClose={() => { setEditingUnit(null); setIsCreatingKey(false); }} 
                        onSave={handleSaveUnit}
                        allProviders={allProviders}
                        onViewProfile={onSelectProvider}
                    />
                )}
                {/* Header */}
                <div className="bg-white shadow-sm z-10 sticky top-0">
                    <div className="relative h-32">
                        <img src={selectedPremise.bannerImageUrl} className="w-full h-full object-cover brightness-75"/>
                        <button onClick={onBack} className="absolute top-4 left-4 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                        <div className="absolute bottom-0 left-0 p-4 text-white">
                            <h1 className="text-xl font-bold">{selectedPremise.name}</h1>
                            <p className="text-xs opacity-90">{selectedPremise.tagline}</p>
                        </div>
                    </div>
                    <div className="flex border-b px-4">
                        <button onClick={() => setManagerTab('keys')} className={`py-3 px-4 text-sm font-bold border-b-2 ${managerTab === 'keys' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-gray-500'}`}>Manage Keys</button>
                    </div>
                </div>
                
                {/* Body */}
                <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex bg-gray-200 rounded-lg p-1">
                            {['All', 'Occupied', 'Vacant'].map(f => (
                                <button key={f} onClick={() => setKeyFilter(f as any)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${keyFilter === f ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-600'}`}>{f}</button>
                            ))}
                        </div>
                        <button onClick={() => { setIsCreatingKey(true); setEditingUnit({}); }} className="bg-brand-navy text-white text-xs font-bold px-3 py-2 rounded-lg shadow-md">+ Add Key</button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {filteredUnits.map((u, i) => (
                            <div key={i} onClick={() => setEditingUnit(u)} className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-800">{u.unitNumber}</h3>
                                        <span className={`w-2 h-2 rounded-full ${u.status === 'Occupied' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    </div>
                                    <p className="text-xs text-gray-500">{u.configuration}</p>
                                </div>
                                <div className="text-right">
                                    {u.status === 'Vacant' && <span className="text-[10px] bg-brand-gold/20 text-brand-navy px-2 py-1 rounded font-bold uppercase">Listed</span>}
                                    <span className="text-gray-400 text-xl ml-2">&rsaquo;</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    // 2. Gateman View
    if (currentUser?.role === 'Gateman' && selectedPremise) {
        return (
            <div className="bg-gray-900 min-h-screen flex flex-col text-white font-mono">
                {scanResult && (
                    <ScanVerificationModal 
                        scanResult={scanResult} 
                        onClose={onClearScanResult || (() => {})} 
                        onAdmit={() => { onClearScanResult && onClearScanResult(); setRecentActivity(p => [`Admitted: Visitor - ${new Date().toLocaleTimeString()}`, ...p].slice(0,5)); }} 
                    />
                )}

                {showEndShiftModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
                        <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-sm border border-gray-700">
                            <h3 className="text-lg font-bold text-white mb-4">End Shift Report</h3>
                            <textarea 
                                value={shiftNote}
                                onChange={e => setShiftNote(e.target.value)}
                                placeholder="Add optional notes (e.g., incidents, handover info)..."
                                className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-3 text-sm focus:border-brand-gold outline-none h-32 mb-4"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setShowEndShiftModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold">Cancel</button>
                                <button onClick={handleEndShiftConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold">End Shift</button>
                            </div>
                        </div>
                    </div>
                )}
                
                <header className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center shadow-lg sticky top-0 z-20">
                    <button onClick={onBack} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="text-center">
                        <h1 className="text-lg font-bold text-brand-gold tracking-wider">SECURITY POST</h1>
                        <p className="text-[10px] text-gray-400 uppercase">{selectedPremise.name}</p>
                    </div>
                    <button onClick={() => setShowEndShiftModal(true)} className="bg-red-900/50 hover:bg-red-900 border border-red-700 text-red-100 text-xs font-bold px-3 py-2 rounded transition">
                        End Shift
                    </button>
                </header>

                <main className="flex-1 p-6 flex flex-col items-center gap-8 overflow-y-auto">
                    {/* Big Scan Button */}
                    <button onClick={onScanClick} className="w-64 h-64 rounded-full bg-gradient-to-br from-brand-navy to-gray-800 border-4 border-brand-gold shadow-[0_0_40px_rgba(245,158,11,0.3)] flex flex-col items-center justify-center group active:scale-95 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6.5 6.5v-1m-6.5-13L5.5 1m-4 4.5h1m13.5 6.5l-1-1M5.5 12.5v1m13.5-6.5L18 5m-1 6.5v-1m-6.5 6.5L5.5 18m13.5-6.5h-1M10 14v-4m-2 4h4" /></svg>
                        <span className="mt-4 text-xl font-bold tracking-widest text-brand-gold animate-pulse">SCAN PASS</span>
                    </button>

                    {/* Manual Entry */}
                    <div className="w-full max-w-sm bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Manual Code Entry</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={manualCode} 
                                onChange={e => setManualCode(e.target.value.toUpperCase())}
                                placeholder="ENTER CODE" 
                                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white font-bold tracking-widest focus:border-brand-gold focus:outline-none"
                            />
                            <button onClick={handleManualVerify} className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 rounded-lg border border-gray-600">
                                VERIFY
                            </button>
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="w-full max-w-sm">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Recent Activity</h3>
                        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                            {recentActivity.map((log, i) => (
                                <div key={i} className="p-3 border-b border-gray-700 last:border-0 text-xs text-gray-300 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // 3. Visitor / Tenant Wallet View
    return (
        <div className="bg-gray-100 min-h-screen font-sans pb-24 relative overflow-hidden" onClick={handleBackgroundClick}>
            {scanResult && (
                <ScanVerificationModal 
                    scanResult={scanResult} 
                    onClose={onClearScanResult || (() => {})} 
                    onAdmit={() => { onClearScanResult && onClearScanResult(); alert("Admitted"); }} 
                />
            )}

            <header className="p-6 pt-6 flex justify-between items-center z-50 relative pointer-events-none">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight pointer-events-auto">My Wallet</h1>
                <div className="flex gap-3 pointer-events-auto">
                    {currentUser && <img src={currentUser.avatarUrl} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />}
                    <button onClick={onBack} className="bg-white/50 backdrop-blur p-2 rounded-full text-gray-800 hover:bg-white shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
            </header>

            <main className="px-4 relative h-[70vh] mt-2 flex justify-center">
                {walletCards.length > 0 ? (
                    <div className="relative w-full h-full max-w-md">
                        {walletCards.map((card, index) => (
                            <WalletCard 
                                key={card.id}
                                data={card}
                                index={index}
                                isActive={activeCardId === card.id}
                                isAnyActive={activeCardId !== null}
                                isFlipped={activeCardId === card.id && isFlipped}
                                onClick={() => handleCardClick(card.id)}
                                onClose={() => setActiveCardId(null)}
                                onUploadId={handleUploadId}
                                onViewProfile={onSelectProvider}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-20 text-center py-10">
                        <p className="text-gray-400 text-sm">No active passes found.</p>
                        <button onClick={onScanClick} className="mt-4 text-brand-navy font-bold text-sm bg-white px-4 py-2 rounded-full shadow-md">Scan to Add</button>
                    </div>
                )}
            </main>
            
            <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-4 z-50 pointer-events-none">
                <button onClick={onScanClick} className="pointer-events-auto bg-brand-navy text-white rounded-full p-4 shadow-2xl hover:scale-110 transition-transform active:scale-95 flex items-center justify-center border-4 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6.5 6.5v-1m-6.5-13L5.5 1m-4 4.5h1m13.5 6.5l-1-1M5.5 12.5v1m13.5-6.5L18 5m-1 6.5v-1m-6.5 6.5L5.5 18m13.5-6.5h-1M10 14v-4m-2 4h4" /></svg>
                </button>
            </div>
        </div>
    );
};

export default GatePass;
