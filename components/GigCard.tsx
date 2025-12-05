import React from 'react';
import type { Gig, ServiceProvider } from '../types';

interface GigCardProps {
    gig: Gig;
    provider?: ServiceProvider;
    onClick: () => void;
    layout?: 'horizontal' | 'vertical';
}

const GigCard: React.FC<GigCardProps> = ({ gig, provider, onClick, layout = 'horizontal' }) => {
    
    const budgetTypeSuffix: Record<Gig['budgetType'], string> = {
        'fixed': 'total',
        'per hour': '/hr',
        'per day': '/day'
    };

    if (layout === 'vertical') {
         return (
            <div onClick={onClick} className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer w-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center gap-4 group">
                <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={gig.imageUrl} alt={gig.title} />
                </div>
                <div className="p-2 flex-grow overflow-hidden">
                    <p className="font-bold text-md text-gray-900 truncate">{gig.title}</p>
                    <p className="text-sm text-gray-500 truncate">{gig.location}</p>
                    <p className="font-bold text-brand-dark mt-1">{gig.currency} {gig.budget.toLocaleString()} <span className="text-xs font-normal text-gray-600">{budgetTypeSuffix[gig.budgetType]}</span></p>
                    {provider && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                            <img src={provider.avatarUrl} alt={provider.name} className="w-6 h-6 rounded-full object-cover" />
                            <p className="text-xs text-gray-500 truncate">{provider.name}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Default horizontal layout
    return (
        <div onClick={onClick} className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer w-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="relative h-32 overflow-hidden">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={gig.imageUrl} alt={gig.title} />
                 <div className="absolute top-1.5 left-1.5 bg-black bg-opacity-50 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    {gig.location}
                </div>
            </div>
            <div className="p-3">
                <p className="font-bold text-sm text-gray-900 truncate h-10">{gig.title}</p>
                <p className="font-bold text-brand-dark mt-1">{gig.currency} {gig.budget.toLocaleString()} <span className="text-xs font-normal text-gray-600">{budgetTypeSuffix[gig.budgetType]}</span></p>
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

export default GigCard;