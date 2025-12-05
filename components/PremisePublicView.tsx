
import React, { useState, useRef } from 'react';
import type { Premise, ServiceProvider, QaRibuRequest, UnitKey } from '../types';

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

const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const BuildingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const HandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20h14M6 4h12a2 2 0 012 2v2H4V6a2 2 0 012-2zm0 4h12a2 2 0 012 2v6h-2v2H6v-2H4v-6a2 2 0 012-2z" /></svg>;
const BathIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 14h16M9 8v6m6-6v6" /></svg>;

const RealEstateCard: React.FC<{ unit: UnitKey, onClick: () => void }> = ({ unit, onClick }) => {
    const isSale = unit.listingType === 'Sale';
    const isShortStay = unit.listingType === 'ShortStay';
    
    return (
        <div onClick={onClick} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition-all cursor-pointer">
            <div className="relative h-48 bg-gray-200">
                <img 
                    src={unit.images?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800'} 
                    alt={unit.configuration} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <div className="bg-brand-navy/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
                        {isSale ? 'For Sale' : isShortStay ? 'Airbnb' : 'To Let'}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="text-white">
                        <span className="text-lg font-bold">Ksh {unit.rentAmount?.toLocaleString()}</span>
                        {!isSale && <span className="text-xs font-normal opacity-90"> /{unit.rentPeriod || 'mo'}</span>}
                    </div>
                </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-bold text-gray-900 text-lg mb-1 leading-tight">{unit.configuration}</h4>
                <p className="text-xs text-gray-500 mb-3">{unit.floor} Floor</p>
                
                {/* Real Estate Features */}
                <div className="flex gap-4 mb-3 border-b border-gray-100 pb-3">
                    {unit.bedrooms && (
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs font-semibold">
                            <BedIcon /> {unit.bedrooms} Bed
                        </div>
                    )}
                    {unit.bathrooms && (
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs font-semibold">
                            <BathIcon /> {unit.bathrooms} Bath
                        </div>
                    )}
                    {unit.size && (
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded">
                            {unit.size}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-wrap gap-1">
                    {unit.amenities?.slice(0, 2).map((am, i) => (
                        <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">{am}</span>
                    ))}
                    {(unit.amenities?.length || 0) > 2 && <span className="text-[10px] text-gray-400 px-1 py-1">+{unit.amenities!.length - 2} more</span>}
                </div>
                
                <div className="mt-auto pt-3 flex gap-2">
                    <button className="flex-1 py-2 bg-gray-50 text-brand-navy font-bold text-xs rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

const DirectoryItem: React.FC<{ tenant: ServiceProvider, onSelect: () => void }> = ({ tenant, onSelect }) => (
    <div onClick={onSelect} className="flex items-center justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer group">
        <div className="flex items-center gap-4">
            <img src={tenant.avatarUrl} alt={tenant.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
            <div>
                <h4 className="font-bold text-gray-800 text-sm">{tenant.name}</h4>
                <p className="text-xs text-gray-500">{tenant.service}</p>
                <span className="text-[10px] text-gray-400 font-medium">{tenant.floor ? `${tenant.floor}, ` : ''}{tenant.unit}</span>
            </div>
        </div>
        <button className="bg-gray-100 p-2 rounded-full text-brand-navy group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-colors">
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
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col pb-20">
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
                        <button onClick={handleCancel} className="bg-red-500/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:bg-red-600">Cancel</button>
                        <button onClick={handleSave} className="bg-green-500/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-bold hover:bg-green-600">Save</button>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 z-10 text-center flex flex-col items-center pointer-events-none">
                     <div className="relative w-20 h-20 bg-white rounded-2xl shadow-xl p-1 mb-4 group/logo pointer-events-auto transform translate-y-2">
                        <img 
                            src={isEditing ? editData.logoUrl : (premise.logoUrl || 'https://via.placeholder.com/150')} 
                            className="w-full h-full object-contain rounded-xl" 
                        />
                        {isEditing && (
                            <button 
                                onClick={() => logoInputRef.current?.click()}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl opacity-0 group-hover/logo:opacity-100 transition-opacity cursor-pointer"
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
                                    className="text-sm text-gray-200 text-center bg-white/20 border border-white/30 rounded px-2 w-full focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                    placeholder="Tagline"
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold text-white font-serif leading-tight mb-1 text-shadow">{premise.name}</h1>
                                <p className="text-sm text-brand-gold font-medium tracking-wider uppercase mb-2">{premise.tagline}</p>
                                {premise.address && <p className="text-xs text-gray-300 flex items-center justify-center gap-1"><BuildingIcon /> {premise.address}</p>}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs - Only show for non-residential (Commercial/Mixed) */}
            {!isResidential && (
                <div className="px-4 border-b border-gray-200 flex gap-6 bg-white sticky top-0 z-10 pt-2 shadow-sm justify-center">
                    <button 
                        onClick={() => setActiveTab('directory')} 
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'directory' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-gray-500'}`}
                    >
                        <BuildingIcon /> Directory
                    </button>
                    <button 
                        onClick={() => setActiveTab('explore')} 
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'explore' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-gray-500'}`}
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
                                className="w-full p-3 pl-10 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <SearchIcon />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
                            {filteredTenants.length > 0 ? (
                                filteredTenants.map(tenant => (
                                    <DirectoryItem 
                                        key={tenant.id} 
                                        tenant={tenant} 
                                        onSelect={() => handleRingDoorbell(tenant)} 
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <p className="text-sm">No businesses found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'explore' && (
                    <div className="animate-fade-in space-y-8">
                        
                        {/* About Section (Residential Only) */}
                        {isResidential && (
                             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 text-lg mb-3">About this Residence</h3>
                                <p className="text-sm text-gray-600 leading-relaxed mb-4">{premise.about}</p>
                                
                                {premise.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {premise.amenities.map((am, i) => (
                                            <span key={i} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-medium">
                                                {am}
                                            </span>
                                        ))}
                                    </div>
                                )}
                             </div>
                        )}

                        {/* Notice Board Preview */}
                        {premise.noticeBoard && premise.noticeBoard.length > 0 && (
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                <h3 className="text-xs font-bold text-blue-800 uppercase mb-2">Latest Notice</h3>
                                <p className="font-bold text-gray-800 text-sm">{premise.noticeBoard[0].title}</p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{premise.noticeBoard[0].content}</p>
                            </div>
                        )}

                        {/* Vacancies */}
                        <div>
                            <div className="flex justify-between items-end mb-4 px-1">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-xl">Available Units</h3>
                                    <p className="text-xs text-gray-500 mt-1">Find your next home here</p>
                                </div>
                                <span className="bg-brand-navy text-white text-xs font-bold px-2.5 py-1 rounded-lg">{vacancies.length}</span>
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
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 text-sm font-medium">No units available at the moment.</p>
                                </div>
                            )}
                        </div>

                        {/* Subscribe / Management CTA */}
                        <div className="bg-gradient-to-br from-brand-navy to-gray-900 rounded-2xl p-8 text-center text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-xl mb-2 font-serif">Stay Updated</h3>
                                <p className="text-sm text-gray-300 mb-6">Get notified instantly when new units become available or when management posts updates.</p>
                                
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <button onClick={handleNotify} className="bg-brand-gold text-brand-navy font-bold py-3 px-6 rounded-xl shadow-md hover:bg-white transition active:scale-95 flex items-center justify-center gap-2">
                                        <BellIcon /> Subscribe
                                    </button>
                                    <button onClick={handleContactManagement} className="bg-white/10 border border-white/30 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/20 transition active:scale-95">
                                        Contact Office
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Management Contact Info (Edit Mode Only) */}
                        {isEditing && (
                            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                                <h3 className="font-bold text-yellow-800 text-lg mb-2">Management Contact Info</h3>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Phone Number for Inquiries</label>
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
