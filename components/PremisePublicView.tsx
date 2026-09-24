
import React, { useState, useRef } from 'react';
import type { Premise, ServiceProvider, QaRibuRequest, UnitKey } from '../types';
import { BackIcon, MenuIcon, BellIcon, SearchIcon, CameraIcon, BedIcon as SharedBedIcon, BathIcon as SharedBathIcon } from './Icons';

interface PremisePublicViewProps {
    premise: Premise;
    tenants: ServiceProvider[];
    onBack: () => void;
    onSelectProvider: (provider: ServiceProvider) => void;
    onRequestAccess?: (requestData: Partial<QaRibuRequest>) => void; 
    isManager?: boolean;
    onUpdatePremise?: (updatedPremise: Premise) => void;
    // New Props for routing to Door Profile
    onViewDoor?: (unit: UnitKey, tenant?: ServiceProvider) => void;
}

const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

const HandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;

const BedIcon = () => <SharedBedIcon className="h-4 w-4" />;
const BathIcon = () => <SharedBathIcon className="h-4 w-4" />;

const RealEstateCard: React.FC<{ unit: UnitKey, onClick: () => void }> = ({ unit, onClick }) => {
    const isSale = unit.listingType === 'Sale';
    const isShortStay = unit.listingType === 'ShortStay';
    
    return (
        <div onClick={onClick} className="bg-white rounded-Nonecard shadow-sm border border-line overflow-hidden flex flex-col group hover:shadow-md transition-all cursor-pointer">
            <div className="relative h-48 bg-surface-sunken">
                <img 
                    src={unit.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800'} 
                    alt={unit.configuration} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <div className="bg-brand-navy/90 backdrop-blur text-white text-caption font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                        {isSale ? 'For Sale' : isShortStay ? 'Airbnb' : 'To Let'}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="text-white">
                        <span className="text-lg font-bold">Ksh {unit.rentAmount?.toLocaleString()}</span>
                        {!isSale && <span className="text-caption font-normal opacity-90"> /{unit.rentPeriod || 'mo'}</span>}
                    </div>
                </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-bold text-ink text-lg mb-1 leading-tight">{unit.configuration}</h4>
                <p className="text-caption text-ink-soft mb-3">{unit.floor} Floor</p>
                
                {/* Real Estate Features */}
                <div className="flex gap-4 mb-3 border-b border-line pb-3">
                    {unit.bedrooms && (
                        <div className="flex items-center gap-1.5 text-ink-soft text-caption font-semibold">
                            <BedIcon /> {unit.bedrooms} Bed
                        </div>
                    )}
                    {unit.bathrooms && (
                        <div className="flex items-center gap-1.5 text-ink-soft text-caption font-semibold">
                            <BathIcon /> {unit.bathrooms} Bath
                        </div>
                    )}
                    {unit.size && (
                        <div className="flex items-center gap-1.5 text-ink-soft text-caption font-semibold bg-surface-sunken px-2 py-0.5 rounded">
                            {unit.size}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-wrap gap-1">
                    {unit.amenities?.slice(0, 2).map((am, i) => (
                        <span key={i} className="text-[10px] bg-info-soft text-info-strong px-2 py-1 rounded-Nonecontrol border border-info-soft">{am}</span>
                    ))}
                    {(unit.amenities?.length || 0) > 2 && <span className="text-[10px] text-ink-faint px-1 py-1">+{unit.amenities!.length - 2} more</span>}
                </div>
                
                <div className="mt-auto pt-3 flex gap-2">
                    <button className="flex-1 py-2 bg-surface-muted text-brand-navy font-bold text-caption rounded-Nonecontrol hover:bg-surface-sunken transition-colors border border-line">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

const DirectoryItem: React.FC<{ tenant: ServiceProvider, onSelect: () => void }> = ({ tenant, onSelect }) => (
    <div onClick={onSelect} className="flex items-center justify-between p-4 bg-white border-b border-line hover:bg-surface-muted transition cursor-pointer group">
        <div className="flex items-center gap-4">
            <img src={tenant.avatarUrl} alt={tenant.name} className="w-12 h-12 rounded-full object-cover border border-line" />
            <div>
                <h4 className="font-bold text-ink text-body">{tenant.name}</h4>
                <p className="text-caption text-ink-soft">{tenant.service}</p>
                <span className="text-[10px] text-ink-faint font-medium">{tenant.floor ? `${tenant.floor}, ` : ''}{tenant.unit}</span>
            </div>
        </div>
        <button className="bg-surface-sunken p-2 rounded-full text-brand-navy group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-colors">
            <HandIcon />
        </button>
    </div>
);

const PremisePublicView: React.FC<PremisePublicViewProps> = ({ premise, tenants, onBack, onSelectProvider, onRequestAccess, isManager, onUpdatePremise, onViewDoor }) => {
    const isResidential = premise.type === 'Residential';
    
    // Default to 'explore' (Showcase) for residential, 'directory' for commercial
    const [activeTab, setActiveTab] = useState<'directory' | 'explore'>(isResidential ? 'explore' : 'directory');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Premise>(premise);
    
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const vacancies = premise.vacancies?.filter(v => v.status === 'Vacant') || [];

    const filteredTenants = tenants.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.service.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRingDoorbell = (tenant?: ServiceProvider) => {
        // If we have a tenant object, open their Door Profile
        if (tenant && onViewDoor) {
            // Need to convert ServiceProvider to UnitKey structure for DoorProfile or handle it inside DoorProfile
            // For simple integration, create a transient UnitKey
            const unitData: UnitKey = {
                id: tenant.id,
                unitNumber: tenant.unit || '',
                floor: tenant.floor || '',
                type: 'Commercial',
                status: 'Occupied',
                configuration: tenant.service,
                tenantId: tenant.id,
                tenantName: tenant.name
            };
            onViewDoor(unitData, tenant);
            return;
        }

        // Fallback for manual unit entry (Residential)
        if (onRequestAccess) {
            // FIX: manualUnit was undefined. Using placeholders if tenant is missing.
            onRequestAccess({
                premiseId: premise.id,
                premiseName: premise.name,
                tenantId: tenant?.id,
                hostName: tenant?.name || 'General Access', 
                targetUnit: tenant?.unit || 'Main Gate',
                premiseType: premise.type,
                requestType: tenant ? 'Mediated' : 'Direct'
            });
        }
    };

    const handleNotify = () => {
        alert(`You've been subscribed to updates for ${premise.name}. We'll notify you when new units become available.`);
    };

    const handleContactManagement = () => {
        window.open(`tel:${premise.contactPhone}`);
    };

    const handleSave = () => {
        if (onUpdatePremise) {
            onUpdatePremise(editData);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData(premise);
        setIsEditing(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'bannerImageUrl' | 'logoUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-surface-muted min-h-screen font-sans flex flex-col pb-20">
            {/* Header */}
            <div className="relative h-64 bg-brand-navy group">
                <img 
                    src={isEditing ? editData.bannerImageUrl : premise.bannerImageUrl} 
                    alt={premise.name} 
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isEditing ? 'opacity-70' : 'opacity-80'}`} 
                />
                
                {isEditing && (
                    <button 
                        onClick={() => bannerInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors text-white font-bold gap-2 cursor-pointer z-10"
                    >
                        <CameraIcon /> Change Banner
                    </button>
                )}
                <input type="file" ref={bannerInputRef} onChange={e => handleImageUpload(e, 'bannerImageUrl')} className="hidden" accept="image/*" />

                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/20 to-transparent pointer-events-none"></div>
                
                <button onClick={onBack} className="absolute top-4 left-4 bg-black/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/50 z-20 transition">
                    <BackIcon />
                </button>

                {isManager && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 bg-black/30 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/50 z-20 transition">
                        <EditIcon />
                    </button>
                )}

                {isEditing && (
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                        <button onClick={handleCancel} className="bg-danger/80 backdrop-blur-md px-3 py-1.5 rounded-Nonecontrol text-white text-caption font-bold hover:bg-danger">Cancel</button>
                        <button onClick={handleSave} className="bg-success/80 backdrop-blur-md px-3 py-1.5 rounded-Nonecontrol text-white text-caption font-bold hover:bg-success">Save</button>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-center flex flex-col items-center pointer-events-none">
                     <div className="relative w-20 h-20 bg-white rounded-Nonecard shadow-xl p-1 mb-4 group/logo pointer-events-auto transform translate-y-2">
                        <img 
                            src={isEditing ? editData.logoUrl : (premise.logoUrl || 'https://via.placeholder.com/150')} 
                            className="w-full h-full object-contain rounded-Nonecontrol" 
                        />
                        {isEditing && (
                            <button 
                                onClick={() => logoInputRef.current?.click()}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-Nonecontrol opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer"
                            >
                                <CameraIcon />
                            </button>
                        )}
                        <input type="file" ref={logoInputRef} onChange={e => handleImageUpload(e, 'logoUrl')} className="hidden" accept="image/*" />
                    </div>
                    
                    <div className="pointer-events-auto w-full">
                         {isEditing ? (
                            <div className="space-y-2 max-w-xs mx-auto">
                                <input 
                                    value={editData.name} 
                                    onChange={e => setEditData({...editData, name: e.target.value})}
                                    className="text-2xl font-bold text-white text-center bg-white/20 border border-white/30 rounded px-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                    placeholder="Premise Name"
                                />
                                <input 
                                    value={editData.tagline} 
                                    onChange={e => setEditData({...editData, tagline: e.target.value})}
                                    className="text-body text-gray-200 text-center bg-white/20 border border-white/30 rounded px-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                    placeholder="Tagline"
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold text-white font-serif leading-tight mb-1 text-shadow">{premise.name}</h1>
                                <p className="text-body text-brand-gold font-medium tracking-wider uppercase mb-2">{premise.tagline}</p>
                                {premise.address && <p className="text-caption text-gray-300 flex items-center justify-center gap-1"><BuildingIcon /> {premise.address}</p>}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs - Only show for non-residential (Commercial/Mixed) */}
            {!isResidential && (
                <div className="px-4 border-b border-line flex gap-6 bg-white sticky top-0 z-10 pt-2 shadow-sm justify-center">
                    <button 
                        onClick={() => setActiveTab('directory')} 
                        className={`pb-3 text-body font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'directory' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-ink-soft'}`}
                    >
                        <BuildingIcon /> Directory
                    </button>
                    <button 
                        onClick={() => setActiveTab('explore')} 
                        className={`pb-3 text-body font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'explore' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-ink-soft'}`}
                    >
                        <MenuIcon /> Explore
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="p-4 flex-1 max-w-lg mx-auto w-full">
                {activeTab === 'directory' && !isResidential && (
                    <div className="animate-fade-in space-y-4">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search businesses..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full p-3 pl-10 bg-white border border-line rounded-Nonecard shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold text-body"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
                                <SearchIcon />
                            </div>
                        </div>
                        <div className="bg-white rounded-Nonecard shadow-sm border border-line overflow-hidden divide-y divide-gray-100">
                            {filteredTenants.length > 0 ? (
                                filteredTenants.map(tenant => (
                                    <DirectoryItem 
                                        key={tenant.id} 
                                        tenant={tenant} 
                                        onSelect={() => handleRingDoorbell(tenant)} 
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center text-ink-soft">
                                    <p className="text-body">No businesses found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'explore' && (
                    <div className="animate-fade-in space-y-8">
                        
                        {/* About Section (Residential Only) */}
                        {isResidential && (
                             <div className="bg-white p-6 rounded-Nonecard shadow-sm border border-line">
                                <h3 className="font-bold text-ink text-lg mb-3">About this Residence</h3>
                                <p className="text-body text-ink-soft leading-relaxed mb-4">{premise.about}</p>
                                
                                {premise.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {premise.amenities.map((am, i) => (
                                            <span key={i} className="text-caption bg-surface-sunken text-ink px-3 py-1.5 rounded-full font-medium">
                                                {am}
                                            </span>
                                        ))}
                                    </div>
                                )}
                             </div>
                        )}

                        {/* Notice Board Preview */}
                        {premise.noticeBoard && premise.noticeBoard.length > 0 && (
                            <div className="bg-info-soft border border-info-soft p-4 rounded-Nonecontrol">
                                <h3 className="text-caption font-bold text-info-strong uppercase mb-2">Latest Notice</h3>
                                <p className="font-bold text-ink text-body">{premise.noticeBoard[0].title}</p>
                                <p className="text-caption text-ink-soft mt-1 line-clamp-2">{premise.noticeBoard[0].content}</p>
                            </div>
                        )}

                        {/* Vacancies */}
                        <div>
                            <div className="flex justify-between items-end mb-4 px-1">
                                <div>
                                    <h3 className="font-bold text-ink text-xl">Available Units</h3>
                                    <p className="text-caption text-ink-soft mt-1">Find your next home here</p>
                                </div>
                                <span className="bg-brand-navy text-white text-caption font-bold px-2.5 py-1 rounded-Nonecontrol">{vacancies.length}</span>
                            </div>
                            
                            {vacancies.length > 0 ? (
                                <div className="grid gap-6">
                                    {vacancies.map(unit => (
                                        <RealEstateCard 
                                            key={unit.id} 
                                            unit={unit} 
                                            onClick={() => onViewDoor && onViewDoor(unit)} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-Nonecard border border-dashed border-line">
                                    <p className="text-ink-soft text-body font-medium">No units available at the moment.</p>
                                </div>
                            )}
                        </div>

                        {/* Subscribe / Management CTA */}
                        <div className="bg-gradient-to-br from-brand-navy to-gray-900 rounded-Nonecard p-8 text-center text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-xl mb-2 font-serif">Stay Updated</h3>
                                <p className="text-body text-gray-300 mb-6">Get notified instantly when new units become available or when management posts updates.</p>
                                
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button onClick={handleNotify} className="bg-brand-gold text-brand-navy font-bold py-3 px-6 rounded-Nonecard shadow-md hover:bg-white transition active:scale-95 flex items-center justify-center gap-2">
                                        <BellIcon /> Subscribe
                                    </button>
                                    <button onClick={handleContactManagement} className="bg-white/10 border border-white/30 text-white font-bold py-3 px-6 rounded-Nonecontrol hover:bg-white/20 transition active:scale-95">
                                        Contact Office
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Management Contact Info (Edit Mode Only) */}
                        {isEditing && (
                            <div className="bg-warning-soft rounded-Nonecontrol p-6 border border-warning-soft">
                                <h3 className="font-bold text-warning-strong text-lg mb-2">Management Contact Info</h3>
                                <label className="block text-caption font-bold text-ink-soft mb-1">Phone Number for Inquiries</label>
                                <input 
                                    value={editData.contactPhone}
                                    onChange={e => setEditData({...editData, contactPhone: e.target.value})}
                                    className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold mb-3"
                                    placeholder="e.g. 254712345678"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PremisePublicView;
