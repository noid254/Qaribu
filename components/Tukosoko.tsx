
import React, { useState, useMemo, useEffect } from 'react';
// FIX: Import CurrentPage to use in props
import type { CatalogueItem, ServiceProvider, SpecialBanner, CurrentPage } from '../types';

// --- Icons ---
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

// --- Card Component ---
const TukosokoItemCard: React.FC<{
    item: CatalogueItem;
    provider?: ServiceProvider;
    onClick: () => void;
}> = ({ item, provider, onClick }) => {
    return (
        <div onClick={onClick} className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="overflow-hidden">
                <img src={item.imageUrls[0]} alt={item.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-3">
                <h3 className="font-bold text-gray-800 text-sm mt-1 truncate group-hover:underline">{item.title}</h3>
                <p className="text-sm font-semibold text-gray-600 mt-2">{item.price}</p>
                {!item.isVerified && (
                    <p className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">Unverified</p>
                )}
                {provider && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                        <img src={provider.avatarUrl} alt={provider.name} className="w-6 h-6 rounded-full object-cover" />
                        <p className="text-xs text-gray-500 truncate">{provider.name}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const tukosokoFilters = {
    VEHICLES: {
        title: 'Hit the Road',
        subtitle: 'Find cars, bikes, and parts for your next journey.',
        bannerUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
        children: ['All', 'Cars', 'Motorcycles', 'Spare Parts']
    },
    ELECTRONICS: {
        title: 'Get Connected',
        subtitle: 'The latest in phones, laptops, and home entertainment.',
        bannerUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop',
        children: ['All', 'Phones', 'Computers', 'TVs', 'Cameras']
    },
    FASHION: {
        title: 'Style Redefined',
        subtitle: 'Discover trends in clothing, shoes, and accessories.',
        bannerUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop',
        children: ['All', 'Clothing', 'Shoes', 'Watches', 'Bags']
    },
    HOME: {
        title: 'Upgrade Your Home',
        subtitle: 'Furniture, appliances, and decor for every room.',
        bannerUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
        children: ['All', 'Furniture', 'Appliances', 'Decor']
    },
};

type ParentCategory = keyof typeof tukosokoFilters;

const rateSuffix: Record<ServiceProvider['rateType'], string> = {
    'per hour': 'hr', 'per day': 'day', 'per task': 'task', 'per month': 'mo', 'per piece work': 'item', 'per km': 'km', 'per sqm': 'm²', 'per cbm': 'm³', 'per appearance': 'show'
};

interface TukosokoProps {
    items: CatalogueItem[];
    providers: ServiceProvider[];
    specialBanners: SpecialBanner[];
    onSelectProvider: (provider: ServiceProvider) => void;
    onBack: () => void;
    onMessagesClick: () => void;
    hasNewMessages: boolean;
    // FIX: Add onNavigate prop to match what's passed from App.tsx
    onNavigate: (page: CurrentPage) => void;
}

const Tukosoko: React.FC<TukosokoProps> = ({ items, providers, specialBanners, onSelectProvider, onBack, onMessagesClick, hasNewMessages }) => {
    const [activeParent, setActiveParent] = useState<ParentCategory>('ELECTRONICS');
    const [activeChild, setActiveChild] = useState<string>('All');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    
    const providerMap = useMemo(() => new Map(providers.map(p => [p.id, p])), [providers]);
    const findProvider = (providerId: string) => providerMap.get(providerId);

    const handleParentClick = (parent: ParentCategory) => {
        setActiveParent(parent);
        setActiveChild('All');
    };
    
    const BellIcon: React.FC<{ hasNotification: boolean }> = ({ hasNotification }) => (
        <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            {hasNewMessages && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></div>}
        </div>
    );

    const categoryKeywords: Record<ParentCategory, string[]> = {
        VEHICLES: ['car', 'vehicle', 'motorcycle', 'scooter', 'prado', 'tx', 'brake'],
        ELECTRONICS: ['phone', 'laptop', 'tv', 'camera', 'audio', 'iphone', 'samsung'],
        FASHION: ['shirt', 'dress', 'shoes', 'watch', 'jewellery', 'bag', 'wallet'],
        HOME: ['sofa', 'table', 'chair', 'fridge', 'cooker', 'bed', 'box'],
    };

    const displayedItems = useMemo(() => {
        let baseItems = items.filter(i => i.category === 'Product' || i.category === 'For Sale');
        let parentFilteredItems = baseItems.filter(item => {
            const searchString = `${item.title.toLowerCase()} ${item.description.toLowerCase()}`;
            return categoryKeywords[activeParent].some(keyword => searchString.includes(keyword));
        });
        let childFilteredItems = parentFilteredItems;
        if (activeChild !== 'All') {
            const childKeyword = activeChild.toLowerCase().replace(/s$/, '');
            childFilteredItems = parentFilteredItems.filter(item => item.title.toLowerCase().includes(childKeyword));
        }
        const filtered = searchTerm
            ? childFilteredItems.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            ) : childFilteredItems;

        return filtered.sort((a, b) => {
            const providerA = providerMap.get(a.providerId);
            const providerB = providerMap.get(b.providerId);
            const distanceA = providerA?.distanceKm ?? Infinity;
            const distanceB = providerB?.distanceKm ?? Infinity;
            return distanceA - distanceB;
        });
    }, [items, activeParent, activeChild, searchTerm, providerMap]);

    const bannerData = useMemo(() => {
        const matchingAdminBanner = specialBanners.find(banner => banner.targetCategory === activeParent);
        if (matchingAdminBanner) {
             return { type: 'admin', imageUrl: matchingAdminBanner.imageUrl };
        }
        
        // Pick random items from displayedItems to show as featured
        // Ideally we filter for those with good images
        const potentialFeatures = displayedItems.filter(i => i.imageUrls.length > 0);
        
        if (potentialFeatures.length > 0) {
            const item = potentialFeatures[currentBannerIndex % potentialFeatures.length];
            return {
                type: 'carousel',
                imageUrl: item.imageUrls[0],
                title: item.title,
                subtitle: item.price,
                itemId: item.id,
                providerId: item.providerId
            };
        }

        // Fallback
        return { type: 'static', ...tukosokoFilters[activeParent] };
    }, [activeParent, specialBanners, displayedItems, currentBannerIndex]);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBannerIndex(prev => prev + 1);
        }, 5000);
        return () => clearInterval(timer);
    }, []);
    
    const parentCategories = Object.keys(tukosokoFilters) as ParentCategory[];
    
    let bannerImageUrl: string;
    let bannerContent: React.ReactNode;
    let currentKey: string | number = activeParent;

    if (bannerData.type === 'admin') {
        bannerImageUrl = bannerData.imageUrl!;
        bannerContent = (
            <>
                <h2 className="text-3xl font-bold font-serif leading-tight">Special Offer</h2>
                <p className="mt-1 opacity-90 text-base">Check out deals from our partners!</p>
            </>
        );
    } else if (bannerData.type === 'carousel') {
        bannerImageUrl = bannerData.imageUrl!;
        currentKey = bannerData.itemId!;
        const provider = findProvider(bannerData.providerId!);
        bannerContent = (
            <div onClick={() => onSelectProvider(provider!)} className="cursor-pointer">
                 <h1 className="text-3xl font-bold font-serif truncate px-4">{bannerData.title}</h1>
                 <p className="mt-2 text-lg font-bold text-brand-gold">{bannerData.subtitle}</p>
                 {provider && (
                     <p className="mt-1 text-xs opacity-90 flex items-center justify-center gap-1">
                        Sold by {provider.name}
                     </p>
                 )}
                 <p className="text-[10px] bg-white/20 px-2 py-1 rounded-full inline-block mt-2 backdrop-blur-sm">Featured Product</p>
            </div>
        );
    } else {
        const staticData = bannerData as typeof tukosokoFilters[ParentCategory] & { type: 'static' };
        bannerImageUrl = staticData.bannerUrl;
        bannerContent = (
             <>
                <h1 className="text-4xl font-bold font-serif">{staticData.title}</h1>
                <p className="mt-2 max-w-sm text-base opacity-90">{staticData.subtitle}</p>
            </>
        );
    }
    
    const filterControls = (
         <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {parentCategories.map(parent => (
                <React.Fragment key={parent}>
                    <button 
                        onClick={() => handleParentClick(parent)}
                        className={`flex-shrink-0 px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-200 shadow-md ${activeParent === parent ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}
                    >
                        {parent.replace('_', ' & ')}
                    </button>
                    {activeParent === parent && tukosokoFilters[parent].children.map(child => (
                        <button
                            key={child}
                            onClick={() => setActiveChild(child)}
                            className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full capitalize transition-colors ${activeChild === child ? 'bg-slate-400 text-white' : 'bg-slate-200 text-slate-600'}`}
                        >
                            {child}
                        </button>
                    ))}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
             <style>{`
              @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }
              .animate-fade-in-down { animation: fade-in-down 0.3s ease-out; }
            `}</style>

            {isSearchActive && (
                <div className="sticky top-0 z-30 bg-white shadow-md p-4 animate-fade-in-down">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="relative flex-grow">
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-2 pl-10 pr-4 text-sm rounded-full bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                autoFocus
                            />
                        </div>
                        <button onClick={() => { setIsSearchActive(false); setSearchTerm(''); }} className="text-sm font-semibold text-slate-600 flex-shrink-0">
                            Cancel
                        </button>
                    </div>
                    {filterControls}
                </div>
            )}
            
            {!isSearchActive && (
                <>
                    <div className="relative w-full h-80 shadow-lg">
                        <img src={bannerImageUrl} key={currentKey} alt="Tukosoko Banner" className="absolute inset-0 w-full h-full object-cover animate-fade-in" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20"></div>
                        
                        <header className="absolute top-0 left-0 right-0 pt-4 px-4 flex justify-between items-center text-white z-10">
                            <button onClick={onBack} className="p-2 -ml-2"><BackIcon /></button>
                            <span className="font-bold tracking-widest text-sm">TUKOSOKO</span>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsSearchActive(true)}><SearchIcon /></button>
                                <button onClick={onMessagesClick}><BellIcon hasNotification={hasNewMessages} /></button>
                            </div>
                        </header>

                        <div className="relative h-full flex flex-col items-center justify-end text-center text-white p-4 pb-8">
                            <div key={currentKey} className="animate-fade-in">
                               {bannerContent}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 relative z-10">
                        {filterControls}
                    </div>
                </>
            )}

            <main className="px-4 pb-24">
                 <h2 className="text-center font-serif font-bold text-2xl text-slate-800 my-4">
                    {activeChild === 'All' ? `All ${activeParent.replace('_', ' & ')}` : `Featured ${activeChild}`}
                </h2>
                {displayedItems.length > 0 ? (
                    <div key={`${activeParent}-${activeChild}-${searchTerm}`} className="grid grid-cols-2 gap-4 animate-fade-in">
                        {displayedItems.map(item => {
                            const provider = findProvider(item.providerId);
                            // This check is important because a provider might not be found
                            if (!provider) return null;
                            return (
                                <TukosokoItemCard 
                                    key={item.id} 
                                    item={item} 
                                    provider={provider} 
                                    onClick={() => onSelectProvider(provider)} 
                                />
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        <p>No products found matching your criteria.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Tukosoko;
