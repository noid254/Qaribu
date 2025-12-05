import React, { useState, useMemo } from 'react';
import type { ServiceProvider } from '../../types';

interface BroadcastPageProps {
    onBroadcast: (message: string, filters: Record<string, string>) => void;
    providers: ServiceProvider[];
    categories: string[];
}

const BroadcastPage: React.FC<BroadcastPageProps> = ({ onBroadcast, providers, categories }) => {
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [broadcastLocation, setBroadcastLocation] = useState('All');
    const [broadcastCategory, setBroadcastCategory] = useState('All');
    const [broadcastRating, setBroadcastRating] = useState('All');
    
    const uniqueLocations = useMemo(() => ['All', ...Array.from(new Set(providers.map(p => p.location.split(',').pop()?.trim()).filter(Boolean)))], [providers]);
    const uniqueCategoriesForBroadcast = useMemo(() => ['All', ...categories], [categories]);
    const ratingOptions = ['All', 'Above 4.5', 'Below 3.0', 'Unrated (0)'];

    const handleBroadcast = () => {
        if (broadcastMessage.trim()) {
             const filters = {
                location: broadcastLocation,
                category: broadcastCategory,
                rating: broadcastRating,
            };
            onBroadcast(broadcastMessage.trim(), filters);
            setBroadcastMessage('');
        }
    };
    
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 max-w-md mx-auto">
           <h2 className="text-lg font-bold text-gray-800 mb-4">Broadcast Message</h2>
           
           <div className="space-y-3 mb-4">
                <label className="text-xs font-medium text-gray-500">FILTERS</label>
               <select value={broadcastLocation} onChange={e => setBroadcastLocation(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                   {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
               </select>
               <select value={broadcastCategory} onChange={e => setBroadcastCategory(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                   {uniqueCategoriesForBroadcast.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
               <select value={broadcastRating} onChange={e => setBroadcastRating(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                   {ratingOptions.map(r => <option key={r} value={r}>{r}</option>)}
               </select>
           </div>

           <textarea rows={5} value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Type your notification message to all users here..." className="w-full p-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"/>
           <button onClick={handleBroadcast} className="mt-3 w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700">Send Broadcast</button>
       </div>
    );
};

export default BroadcastPage;
