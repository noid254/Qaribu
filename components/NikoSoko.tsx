
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { ServiceProvider, SpecialBanner, CurrentPage } from '../types';
import ServiceCard from './ServiceCard';

// --- Icons ---
const MenuIcon = ({ className = "h-7 w-7" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
const BellIcon = ({ hasNotification, className = "h-7 w-7" }: { hasNotification: boolean, className?: string }) => (
    <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {hasNotification && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>}
    </div>
);
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const QRIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6.5 6.5v-1m-6.5-13L5.5 1m-4 4.5h1m13.5 6.5l-1-1M5.5 12.5v1m13.5-6.5L18 5m-1 6.5v-1m-6.5 6.5L5.5 18m13.5-6.5h-1M10 14v-4m-2 4h4" /></svg>;

// Toolkit Icons
const GatePassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.636a6 6 0 111.414-1.414l1.236 2.236A6 6 0 0119 9a2 2 0 01-2-2zM7.53 12.53l.223.223A2 2 0 009.5 13h2a2 2 0 002-2V9a2 2 0 00-1.767.77l-.223.223 1.768 1.768z" /></svg>;
const InvoiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const PlacesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ProsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const MarketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const JourneyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;

interface NikoSokoProps {
    providers: ServiceProvider[];
    onSelectProvider: (provider: ServiceProvider) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onBack: () => void; // Used for Menu toggle
    onMessagesClick: () => void;
    hasNewMessages: boolean;
    specialBanners: SpecialBanner[];
    onNavigate: (page: CurrentPage) => void;
}

const NikoSoko: React.FC<NikoSokoProps> = ({ providers, onSelectProvider, searchTerm, setSearchTerm, onBack, onMessagesClick, hasNewMessages, specialBanners, onNavigate }) => {
    const [nearbyFilter, setNearbyFilter] = useState<'all' | 'places' | 'people' | 'services'>('all');
    const [showStickyHeader, setShowStickyHeader] = useState(false);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const heroRef = useRef<HTMLDivElement>(null);

    // --- Scroll Detection ---
    useEffect(() => {
        const handleScroll = () => {
            if (!heroRef.current) return;
            const heroBottom = heroRef.current.getBoundingClientRect().bottom;
            // Transition point: when hero bottom is close to top of screen
            setShowStickyHeader(heroBottom < 80);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // --- Data Logic ---
    const nearbyProviders = useMemo(() => {
        let filtered = providers;
        
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(lowerTerm) || 
                p.service.toLowerCase().includes(lowerTerm) ||
                p.category.toLowerCase().includes(lowerTerm)
            );
        }

        if (nearbyFilter === 'places') {
            filtered = filtered.filter(p => p.accountType === 'organization' || p.role === 'BuildingManager');
        } else if (nearbyFilter === 'people') {
            filtered = filtered.filter(p => p.accountType === 'individual' && !p.service.toLowerCase().includes('delivery'));
        } else if (nearbyFilter === 'services') {
             filtered = filtered.filter(p => p.accountType === 'individual'); 
        }
        
        return filtered.sort((a, b) => a.distanceKm - b.distanceKm);
    }, [providers, searchTerm, nearbyFilter]);

    // --- Nairobi Themed Hero Images ---
    const heroImages = useMemo(() => {
        return [
            "https://images.unsplash.com/photo-1592345279419-959d784e8aad?q=80&w=800", // Nairobi Skyline / KICC
            "https://images.unsplash.com/photo-1626544827763-d516dce335e2?q=80&w=800", // Nairobi Expressway / Traffic
            "https://images.unsplash.com/photo-1583095117911-379d2b274299?q=80&w=800", // Nairobi National Park / Nature
        ];
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroIndex(prev => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroImages]);

    const ToolkitItem: React.FC<{ label: string, icon: React.ReactNode, onClick: () => void }> = ({ label, icon, onClick }) => (
        <button onClick={onClick} className="flex flex-col items-center gap-1.5 p-1 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors group">
            <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-brand-navy border border-gray-100 group-hover:border-brand-gold transition-colors">
                {icon}
            </div>
            <span className="text-[10px] font-bold text-gray-600 text-center leading-tight group-hover:text-brand-navy">{label}</span>
        </button>
    );

    const FilterBar = () => (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['all', 'places', 'people', 'services'].map((filter) => (
                <button 
                    key={filter}
                    onClick={() => setNearbyFilter(filter as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${nearbyFilter === filter ? 'bg-brand-navy text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-navy'}`}
                >
                    {filter}
                </button>
            ))}
        </div>
    );

    const SearchBar = ({ compact = false }: { compact?: boolean }) => (
         <div className={`bg-white rounded-full flex items-center p-1 transition-all ${compact ? 'border border-gray-200' : 'shadow-lg'}`}>
            <div className="flex-1 flex items-center px-3 gap-2">
                <SearchIcon />
                <input 
                    className="w-full outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent" 
                    placeholder={compact ? "Search..." : "What are you looking for?"}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button onClick={() => onNavigate('qrScan')} className="bg-brand-gold px-4 py-2 rounded-full flex items-center gap-1 text-xs font-bold text-brand-navy hover:bg-amber-500 transition-colors shadow-sm">
                <QRIcon /> Scan
            </button>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans relative pb-24">
            
            {/* --- Sticky Header (Initially Hidden) --- */}
            <header className={`fixed top-0 left-0 right-0 mx-auto max-w-md z-40 bg-white/95 backdrop-blur shadow-md transition-transform duration-300 transform ${showStickyHeader ? 'translate-y-0' : '-translate-y-full'}`}>
                 <div className="flex items-center justify-between px-4 py-2 gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform">
                        <MenuIcon className="h-6 w-6 text-brand-navy" />
                    </button>
                    <div className="flex-1">
                        <SearchBar compact={true} />
                    </div>
                    <button onClick={onMessagesClick} className="p-2 -mr-2 rounded-full hover:bg-gray-100 active:scale-95 transition-transform">
                        <BellIcon hasNotification={hasNewMessages} className="h-6 w-6 text-brand-navy" />
                    </button>
                </div>
                <div className="px-4 pb-2">
                    <FilterBar />
                </div>
            </header>

            {/* --- Themed Hero Section --- */}
            <div className="pt-0">
                <div ref={heroRef} className="relative w-full h-64 rounded-b-[2rem] shadow-xl overflow-hidden bg-brand-navy">
                    {heroImages.map((img, index) => (
                        <img 
                            key={index}
                            src={img} 
                            alt="Hero Highlight" 
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentHeroIndex === index ? 'opacity-60' : 'opacity-0'}`} 
                        />
                    ))}
                    {/* Gradient Overlay matching app theme */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/90 via-brand-navy/70 to-brand-gold/20"></div>
                    
                    {/* Top Overlay Nav (Floating) */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 mt-safe">
                        <button onClick={onBack} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition active:scale-95 cursor-pointer">
                            <MenuIcon className="h-6 w-6 text-brand-gold" />
                        </button>
                        <button onClick={onMessagesClick} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition active:scale-95 cursor-pointer">
                            <BellIcon hasNotification={hasNewMessages} className="h-6 w-6 text-brand-gold" />
                        </button>
                    </div>

                    {/* Centered Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 z-10 pb-8">
                        <h1 className="text-3xl font-bold text-white font-serif mb-1 drop-shadow-lg text-center uppercase tracking-wide">
                            Qaribu <span className="text-brand-gold">Nairobi</span>
                        </h1>
                        <p className="text-gray-200 text-xs drop-shadow-md font-medium tracking-wider opacity-90">Your Borderless Currency</p>
                    </div>

                    {/* Floating Search Bar (Inside Card at bottom) */}
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                        <SearchBar />
                    </div>
                </div>
            </div>

            {/* --- Compact Toolkit --- */}
            <div className="px-4 -mt-4 relative z-10">
                <div className="bg-white rounded-2xl py-4 px-2 shadow-lg border border-gray-100">
                    <div className="grid grid-cols-3 gap-y-3">
                        <ToolkitItem label="Qaribu" icon={<GatePassIcon />} onClick={() => onNavigate('qaribu')} />
                        <ToolkitItem label="Invoices" icon={<InvoiceIcon />} onClick={() => onNavigate('invoices')} />
                        <ToolkitItem label="My Places" icon={<PlacesIcon />} onClick={() => onNavigate('myplaces')} />
                        <ToolkitItem label="NikoSoko" icon={<ProsIcon />} onClick={() => onNavigate('services')} />
                        <ToolkitItem label="Tukosoko" icon={<MarketIcon />} onClick={() => onNavigate('tukosoko')} />
                        <ToolkitItem label="Journey" icon={<JourneyIcon />} onClick={() => onNavigate('journey')} />
                    </div>
                </div>
            </div>

            {/* --- Content Grid --- */}
            <div className="px-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-brand-navy text-sm uppercase tracking-wide">
                        {nearbyFilter !== 'all' ? nearbyFilter : 'Nearby Highlights'}
                    </h3>
                    {nearbyFilter !== 'all' && (
                         <button onClick={() => {setSearchTerm(''); setNearbyFilter('all');}} className="text-brand-gold text-xs font-bold">
                            Clear Filter
                        </button>
                    )}
                </div>
                
                {nearbyProviders.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        {nearbyProviders.map(provider => (
                            <ServiceCard 
                                key={provider.id} 
                                provider={provider} 
                                onClick={() => onSelectProvider(provider)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-sm">No results found nearby.</p>
                        <button onClick={() => {setSearchTerm(''); setNearbyFilter('all');}} className="mt-2 text-brand-gold font-bold text-sm">Clear Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NikoSoko;
