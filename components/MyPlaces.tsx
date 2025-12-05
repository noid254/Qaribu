
import React, { useState, useMemo } from 'react';
import type { ServiceProvider, CurrentPage } from '../types';
import ServiceCard from './ServiceCard';

interface MyPlacesProps {
    providers: ServiceProvider[];
    onSelectProvider: (provider: ServiceProvider) => void;
    onNavigate: (page: CurrentPage) => void;
}

// Category Definitions with Icons
const CATEGORIES = [
    { 
        id: 'all', 
        label: 'All', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
        match: [] 
    },
    { 
        id: 'hospitality', 
        label: 'Hospitality', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, 
        match: ['RESTAURANT', 'HOTEL', 'CAFE', 'BAR']
    },
    { 
        id: 'real_estate', 
        label: 'Real Estate', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        match: ['HOME', 'OFFICE', 'APARTMENT', 'ESTATE']
    },
    { 
        id: 'entertainment', 
        label: 'Entertainment', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        match: ['EVENT', 'CLUB', 'CINEMA', 'PARK']
    },
    { 
        id: 'health', 
        label: 'Health', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
        match: ['HEALTH', 'MEDICAL', 'GYM', 'CLINIC']
    },
    { 
        id: 'education', 
        label: 'Learning', 
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>,
        match: ['EDUCATION', 'SCHOOL', 'COLLEGE', 'TRAINING']
    },
    {
        id: 'shopping',
        label: 'Shopping',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
        match: ['SHOP', 'MALL', 'STORE']
    }
];

const MyPlaces: React.FC<MyPlacesProps> = ({ providers, onSelectProvider, onNavigate }) => {
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredProviders = useMemo(() => {
        // First, filter only "Places" (organizations or building managers)
        let places = providers.filter(p => p.accountType === 'organization' || p.role === 'BuildingManager');
        
        if (activeCategory !== 'all') {
            const categoryDef = CATEGORIES.find(c => c.id === activeCategory);
            if (categoryDef) {
                places = places.filter(p => 
                    categoryDef.match.some(tag => 
                        p.category.toUpperCase().includes(tag) || 
                        p.service.toUpperCase().includes(tag)
                    )
                );
            }
        }
        
        return places.sort((a, b) => a.distanceKm - b.distanceKm);
    }, [providers, activeCategory]);

    return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
            <header className="p-4 bg-white sticky top-0 z-10 shadow-sm">
                 <div className="flex items-center gap-4 mb-4">
                     <button onClick={() => onNavigate('home')} className="text-gray-600 hover:text-gray-900 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     </button>
                     <h1 className="text-2xl font-bold text-gray-900">My Places</h1>
                 </div>
                 
                 {/* Horizontal Scrolling Categories */}
                 <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
                    {CATEGORIES.map(cat => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <button 
                                key={cat.id} 
                                onClick={() => setActiveCategory(cat.id)}
                                className="flex flex-col items-center gap-2 flex-shrink-0 snap-start group"
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-brand-navy text-white shadow-md scale-110' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                                    {cat.icon}
                                </div>
                                <span className={`text-xs transition-colors ${isActive ? 'font-bold text-brand-navy' : 'font-medium text-gray-500'}`}>
                                    {cat.label}
                                </span>
                            </button>
                        );
                    })}
                 </div>
            </header>

            <main className="px-4 py-6 flex-1">
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-lg font-bold text-gray-800">
                         {activeCategory === 'all' ? 'All Places Nearby' : `${CATEGORIES.find(c => c.id === activeCategory)?.label} Nearby`}
                     </h2>
                     <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{filteredProviders.length} results</span>
                 </div>

                {filteredProviders.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        {filteredProviders.map(provider => (
                            <ServiceCard key={provider.id} provider={provider} onClick={() => onSelectProvider(provider)} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <p className="text-sm font-medium">No places found in this category.</p>
                        <button onClick={() => setActiveCategory('all')} className="mt-3 text-brand-gold font-bold text-sm hover:underline">View All Places</button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyPlaces;
