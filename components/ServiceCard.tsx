import React from 'react';
import type { ServiceProvider } from '../types';

const VerifiedIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
);

const StarIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
);

const rateSuffix: Record<ServiceProvider['rateType'], string> = {
    'per hour': 'hr', 'per day': 'day', 'per task': 'task', 'per month': 'mo', 'per piece work': 'item', 'per km': 'km', 'per sqm': 'm²', 'per cbm': 'm³', 'per appearance': 'show'
};

const ServiceCard: React.FC<{ provider: ServiceProvider; onClick: () => void }> = ({ provider, onClick }) => {
    return (
        <div onClick={onClick} className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer w-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative h-40">
                <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={provider.coverImageUrl} alt={provider.service} />
                {provider.isVerified && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-md">
                        <VerifiedIcon className="w-4 h-4"/>
                    </div>
                )}
                <img src={provider.avatarUrl} alt={provider.name} className="absolute -bottom-6 left-3 w-12 h-12 rounded-full border-4 border-white shadow-lg" />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-[10px] px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    <span>{provider.distanceKm}km Near you</span>
                </div>
            </div>
            <div className="p-3 pt-8 space-y-1">
                <h3 className="font-bold text-base text-slate-800 truncate">{provider.service}</h3>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600 truncate">{provider.name}</p>
                    <div className="flex items-center gap-1 text-sm">
                        <StarIcon className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold text-slate-700">{provider.rating.toFixed(1)}</span>
                    </div>
                </div>
                <p className="text-lg font-bold text-slate-900 pt-1">
                    {provider.currency}
                    {provider.hourlyRate.toLocaleString()}
                    <span className="text-sm font-medium text-slate-500">/{rateSuffix[provider.rateType]}</span>
                </p>
            </div>
        </div>
    );
};

export default ServiceCard;