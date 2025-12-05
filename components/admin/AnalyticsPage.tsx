import React, { useMemo } from 'react';
import type { ServiceProvider } from '../../types';

interface AnalyticsPageProps {
    providers: ServiceProvider[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ providers }) => {
    const usersByLocation = useMemo(() => {
        const counts: Record<string, number> = {};
        providers.forEach(p => {
            const loc = p.location.split(',').pop()?.trim() || 'Unknown';
            counts[loc] = (counts[loc] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [providers]);

    const mostViewedUsers = useMemo(() => {
        return [...providers].sort((a, b) => b.views - a.views).slice(0, 5);
    }, [providers]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-lg shadow-sm p-4">
                   <h3 className="font-bold text-lg mb-3">Users by Location</h3>
                   <div className="space-y-2">
                       {usersByLocation.map(([loc, count]) => (
                           <div key={loc} className="flex justify-between items-center text-sm">
                               <span className="text-gray-700">{loc}</span>
                               <span className="font-semibold bg-gray-200 px-2 py-0.5 rounded">{count}</span>
                           </div>
                       ))}
                   </div>
               </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                   <h3 className="font-bold text-lg mb-3">Most Viewed Profiles</h3>
                    <div className="space-y-3">
                       {mostViewedUsers.map(p => (
                           <div key={p.id} className="flex justify-between items-center text-sm">
                               <div className="flex items-center gap-2">
                                   <img src={p.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                                   <div>
                                       <p className="font-semibold">{p.name}</p>
                                       <p className="text-xs text-gray-500">{p.service}</p>
                                   </div>
                               </div>
                               <span className="font-semibold">{p.views} views</span>
                           </div>
                       ))}
                   </div>
               </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
