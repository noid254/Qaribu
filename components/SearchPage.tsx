

import React from 'react';
import type { ServiceProvider } from '../types';
import ServiceCard from './ServiceCard';

interface SearchPageProps {
    providers: ServiceProvider[];
    onSelectProvider: (provider: ServiceProvider) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ providers, onSelectProvider }) => {
    return (
        <div className="bg-gray-100 min-h-screen pt-4">
             <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                    {providers.map(provider => (
                        <ServiceCard key={provider.id} provider={provider} onClick={() => onSelectProvider(provider)} />
                    ))}
                    {providers.length === 0 && <p className="col-span-2 text-center text-gray-500 mt-8">No services found. Try a different search term or filter.</p>}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
