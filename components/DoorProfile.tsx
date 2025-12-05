
import React from 'react';
import type { UnitKey, ServiceProvider, Premise } from '../types';

interface DoorProfileProps {
    unit: UnitKey;
    premise: Premise;
    tenant?: ServiceProvider; // If occupied
    viewSource: 'scan' | 'online'; // Context of how the user arrived here
    onBack: () => void;
    onCheckIn: (unit: UnitKey, tenant?: ServiceProvider) => void;
    onContactHost: (type: 'call' | 'whatsapp') => void;
    onBook?: () => void; // For vacancies
    onViewCatalogue?: () => void; // Navigate to tenant's catalogue/profile
    currentUser?: ServiceProvider | null;
}

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20h14M6 4h12a2 2 0 012 2v2H4V6a2 2 0 012-2zm0 4h12a2 2 0 012 2v6h-2v2H6v-2H4v-6a2 2 0 012-2z" /></svg>;
const BathIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 14h16M9 8v6m6-6v6" /></svg>;
const ExpandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const CatalogueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;


const DoorProfile: React.FC<DoorProfileProps> = ({ unit, premise, tenant, viewSource, onBack, onCheckIn, onContactHost, onBook, onViewCatalogue }) => {
    const isOccupied = unit.status === 'Occupied';
    const isVacant = unit.status === 'Vacant';
    
    // Listing Details
    const listingType = unit.listingType || 'Rent'; // Default
    const priceDisplay = unit.rentAmount ? `${premise.tenants[0] ? '' : 'Ksh '}${unit.rentAmount.toLocaleString()}` : 'Contact for Price';
    const periodDisplay = unit.rentPeriod ? `/${unit.rentPeriod}` : '';
    
    // Determine header image
    const headerImage = unit.images?.[0] || tenant?.coverImageUrl || premise.bannerImageUrl;

    const handleCheckInAction = () => {
        onCheckIn(unit, tenant);
    };

    const renderOnlineButtons = () => {
        if (isVacant) {
            return (
                <>
                    <button 
                        onClick={() => onContactHost('call')}
                        className="flex-1 bg-white text-brand-navy border-2 border-brand-navy font-bold py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
                    >
                        <PhoneIcon /> Call
                    </button>
                    <button 
                        onClick={onBook}
                        className="flex-[2] bg-brand-navy text-white font-bold py-3 rounded-xl shadow-lg hover:bg-black transition active:scale-95 flex items-center justify-center gap-2"
                    >
                        <CalendarIcon /> {listingType === 'ShortStay' ? 'Book Now' : 'Schedule Viewing'}
                    </button>
                </>
            );
        }

        // If Occupied: Use Tenant's CTAs
        const ctaPreferences = tenant?.cta || ['call', 'whatsapp'];
        // If user hasn't set any, default to call and whatsapp
        const activeCtas = ctaPreferences.length > 0 ? ctaPreferences.slice(0, 2) : ['call', 'whatsapp'];

        return activeCtas.map((cta, index) => {
            const isPrimary = index === activeCtas.length - 1; // Last button is primary
            const baseClass = isPrimary 
                ? "flex-[2] bg-brand-navy text-white font-bold py-3 rounded-xl shadow-lg hover:bg-black transition active:scale-95 flex items-center justify-center gap-2"
                : "flex-1 bg-white text-brand-navy border-2 border-brand-navy font-bold py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2";

            switch (cta) {
                case 'call':
                    return <button key={cta} onClick={() => onContactHost('call')} className={baseClass}><PhoneIcon /> Call</button>;
                case 'whatsapp':
                    return <button key={cta} onClick={() => onContactHost('whatsapp')} className={baseClass}><WhatsAppIcon /> WhatsApp</button>;
                case 'book':
                    return <button key={cta} onClick={onBook} className={baseClass}><CalendarIcon /> Book</button>;
                case 'catalogue':
                case 'menu':
                    const label = tenant?.accountType === 'organization' ? 'Courses' : (cta === 'menu' ? 'Menu' : 'Catalogue');
                    return <button key={cta} onClick={onViewCatalogue} className={baseClass}><CatalogueIcon /> {label}</button>;
                case 'join':
                    return <button key={cta} onClick={() => { /* Join logic handled in Profile usually */ onContactHost('call') }} className={baseClass}><UserPlusIcon /> Join</button>;
                default:
                    return null;
            }
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col relative">
            {/* Header Image */}
            <div className="relative h-80 bg-gray-900">
                <img 
                    src={headerImage} 
                    alt="Door Cover" 
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-transparent to-transparent"></div>
                
                <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition z-20">
                    <BackIcon />
                </button>

                {/* Status Badge */}
                <div className="absolute bottom-8 left-6 text-white z-10 max-w-[80%]">
                    {isVacant ? (
                        <div className="flex gap-2 mb-2">
                            <span className="bg-brand-gold text-brand-navy text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                {listingType === 'ShortStay' ? 'Airbnb / Short Stay' : `For ${listingType}`}
                            </span>
                        </div>
                    ) : (
                        <div className="flex gap-2 mb-2">
                            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-white/30">
                                {tenant?.category || 'Private Residence'}
                            </span>
                        </div>
                    )}
                    <h1 className="text-3xl font-bold font-serif leading-tight text-shadow-sm text-white">
                        {isOccupied ? (tenant?.name || `Unit ${unit.unitNumber}`) : unit.configuration}
                    </h1>
                    <p className="text-sm opacity-90 font-medium mt-1 text-brand-gold">{premise.name}, {unit.floor} Floor</p>
                    
                    {isOccupied && tenant && (
                         <div className="flex items-center gap-1 mt-2 text-yellow-400 text-sm font-bold">
                            <StarIcon /> {tenant.rating.toFixed(1)}
                         </div>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 -mt-6 bg-white rounded-t-3xl relative z-10 px-6 pt-8 pb-28 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                
                {/* Real Estate Features (if vacant or relevant) */}
                {(isVacant || unit.bedrooms) && (
                    <div className="flex justify-between items-center mb-6 py-4 border-b border-gray-100">
                        <div className="flex gap-6">
                            {unit.bedrooms && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <BedIcon />
                                    <span className="text-sm font-bold">{unit.bedrooms} <span className="font-normal text-xs">Bed</span></span>
                                </div>
                            )}
                            {unit.bathrooms && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <BathIcon />
                                    <span className="text-sm font-bold">{unit.bathrooms} <span className="font-normal text-xs">Bath</span></span>
                                </div>
                            )}
                            {unit.size && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <ExpandIcon />
                                    <span className="text-sm font-bold">{unit.size}</span>
                                </div>
                            )}
                        </div>
                        {isVacant && (
                            <div className="text-right">
                                <span className="block text-xl font-bold text-brand-navy">{priceDisplay}</span>
                                <span className="text-xs text-gray-500 font-medium">{periodDisplay}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Description */}
                <div className="mb-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">About this space</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                        {unit.description || tenant?.about || "Welcome to our space. Please check in if you are visiting, or contact us for more details."}
                    </p>
                </div>

                {/* Amenities */}
                {unit.amenities && unit.amenities.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-800 text-lg mb-3">Amenities & Features</h3>
                        <div className="flex flex-wrap gap-2">
                            {unit.amenities.map((am, i) => (
                                <span key={i} className="bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200">
                                    {am}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Host Info (if occupied) */}
                {isOccupied && tenant && (
                    <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-4 mb-6 border border-blue-100">
                        <img src={tenant.avatarUrl} alt={tenant.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div>
                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Hosted By</p>
                            <p className="font-bold text-gray-800">{tenant.name}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20 max-w-md mx-auto">
                <div className="flex gap-3">
                    {viewSource === 'scan' && isOccupied ? (
                        <button 
                            onClick={handleCheckInAction}
                            className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
                        >
                            <CheckIcon /> Check In Now
                        </button>
                    ) : (
                        renderOnlineButtons()
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoorProfile;
