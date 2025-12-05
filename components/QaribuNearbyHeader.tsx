import React, { useState } from 'react';

// Icons
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const QRIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6.5 6.5v-1m-6.5-13L5.5 1m-4 4.5h1m13.5 6.5l-1-1M5.5 12.5v1m13.5-6.5L18 5m-1 6.5v-1m-6.5 6.5L5.5 18m13.5-6.5h-1M10 14v-4m-2 4h4" /></svg>;
const BellIcon: React.FC<{ hasNotification: boolean }> = ({ hasNotification }) => (
    <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        {hasNotification && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></div>}
    </div>
);


const qaribuFilters = {
    PLACES: ['all', 'restaurants', 'hotels', 'shops', 'offices'],
    PEOPLE: ['all', 'electricians', 'plumbers', 'cleaners', 'tutors'],
    SERVICES: ['all', 'delivery', 'repair', 'consulting', 'events'],
};
type ParentCategory = keyof typeof qaribuFilters;


interface QaribuNearbyHeaderProps {
    onBack: () => void;
    searchTerm: string;
    onSearch: (term: string) => void;
    onScan: () => void;
    onMessagesClick: () => void;
    hasNewMessages: boolean;
    onFilterChange: (filters: { parent: string, child: string }) => void;
}

const QaribuNearbyHeader: React.FC<QaribuNearbyHeaderProps> = ({ onBack, searchTerm, onSearch, onScan, onMessagesClick, hasNewMessages, onFilterChange }) => {
    const [activeParent, setActiveParent] = useState<ParentCategory | null>('PLACES');
    const [activeChild, setActiveChild] = useState<string>('all');
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
    };
    
    const handleParentClick = (parent: ParentCategory) => {
        const newParent = activeParent === parent ? null : parent;
        setActiveParent(newParent);
        const newChild = 'all';
        setActiveChild(newChild);
        onFilterChange({ parent: newParent || '', child: newChild });
    };

    const handleChildClick = (child: string) => {
        setActiveChild(child);
        onFilterChange({ parent: activeParent || '', child: child });
    };

    return (
        <div className="sticky top-0 z-20 bg-white shadow-md p-4 animate-fade-in">
            {/* Top row: Back, Search, Notifications */}
            <div className="flex items-center gap-2 mb-3">
                <button onClick={onBack} className="p-2 -ml-2 text-gray-700">
                    <BackIcon />
                </button>
                <div className="relative flex-grow">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search nearby..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full bg-gray-100 rounded-full pl-10 pr-24 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    />
                    <button onClick={onScan} className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-brand-navy font-semibold bg-gray-200 hover:bg-gray-300 rounded-full px-3 py-1 text-xs">
                        <QRIcon />
                        <span>Scan</span>
                    </button>
                </div>
                <button onClick={onMessagesClick} className="p-2 text-gray-700">
                    <BellIcon hasNotification={hasNewMessages} />
                </button>
            </div>

            {/* Bottom row: Filters */}
            <div className="flex space-x-4 overflow-x-auto no-scrollbar">
                {(Object.keys(qaribuFilters) as ParentCategory[]).map((parent) => (
                    <React.Fragment key={parent}>
                        <button
                            onClick={() => handleParentClick(parent)}
                            className={`flex-shrink-0 font-bold uppercase text-sm transition-colors py-1 ${activeParent === parent ? 'text-brand-navy' : 'text-gray-500'}`}
                        >
                            {parent}
                        </button>
                        {activeParent === parent && qaribuFilters[parent].map(child => (
                             <button
                                key={child}
                                onClick={() => handleChildClick(child)}
                                className={`flex-shrink-0 lowercase text-sm transition-colors py-1 ${activeChild === child ? 'text-brand-navy font-semibold' : 'text-gray-500'}`}
                            >
                                {child}
                            </button>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
export default QaribuNearbyHeader;