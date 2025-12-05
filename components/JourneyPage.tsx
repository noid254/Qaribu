
import React, { useState, useMemo } from 'react';
import type { ServiceProvider } from '../types';
import ServiceCard from './ServiceCard';

interface JourneyPageProps {
    providers: ServiceProvider[];
    currentUser: ServiceProvider | null;
    onSelectProvider: (provider: ServiceProvider) => void;
    onBack: () => void;
}

// Icons
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const FootstepsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;

const SkillProgressCard: React.FC<{ skillName: string; progress: number }> = ({ skillName, progress }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex justify-between items-center mb-1">
            <p className="font-bold text-gray-800">{skillName}</p>
            <p className="text-sm font-semibold text-brand-navy">{progress}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-brand-gold h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
    </div>
);

// Mock Data for History Views
const HISTORY_DATA = {
    daily: [
        { label: 'Mon', value: 4500 },
        { label: 'Tue', value: 6200 },
        { label: 'Wed', value: 8900 },
        { label: 'Thu', value: 5100 },
        { label: 'Fri', value: 10200 },
        { label: 'Sat', value: 12500 },
        { label: 'Sun', value: 3200 },
    ],
    weekly: [
        { label: 'Wk 1', value: 45000 },
        { label: 'Wk 2', value: 52000 },
        { label: 'Wk 3', value: 38000 },
        { label: 'Wk 4', value: 61000 },
    ],
    monthly: [
        { label: 'May', value: 180000 },
        { label: 'Jun', value: 210000 },
        { label: 'Jul', value: 195000 },
        { label: 'Aug', value: 230000 },
        { label: 'Sep', value: 205000 },
        { label: 'Oct', value: 85000 },
    ]
};

const JourneyPage: React.FC<JourneyPageProps> = ({ providers, currentUser, onSelectProvider, onBack }) => {
    const [activeTab, setActiveTab] = useState<'steps' | 'skills'>('steps');
    const [historyView, setHistoryView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [rankFilter, setRankFilter] = useState<'neighbourhood' | 'country'>('neighbourhood');
    const [professionFilter, setProfessionFilter] = useState<string>('All');
    
    const userSkills = currentUser?.skillProgress || [];
    const institutions = providers.filter(p => p.accountType === 'organization').sort((a, b) => a.distanceKm - b.distanceKm);
    const myCurrentSteps = 3200; // Mocked current user steps for today

    const userLocationName = useMemo(() => {
        if (!currentUser || !currentUser.location) return 'Nearby';
        // Take the first part of "Ruaka, Nairobi" -> "Ruaka"
        return currentUser.location.split(',')[0].trim();
    }, [currentUser]);

    // Generate mock step data and include currentUser in the list
    const leaderboardData = useMemo(() => {
        const others = providers.map(p => {
            const seed = p.id.charCodeAt(0) * 1000;
            const steps = Math.floor((seed + Math.random() * 20000) % 35000) + 2000; 
            return { ...p, steps };
        });

        // Add "Me" to the list if logged in
        const me = currentUser ? { ...currentUser, steps: myCurrentSteps, isMe: true } : null;
        
        const all = me ? [...others, me] : others;
        return all.sort((a, b) => b.steps - a.steps);
    }, [providers, currentUser]);

    // Calculate Ranks for Display
    const myRanks = useMemo(() => {
        if (!currentUser) return { overall: 0, profession: 0 };
        
        // 1. Filter based on Location Scope (Neighbourhood vs Country) to get the base list
        let locationScopeData = leaderboardData;
        if (rankFilter === 'neighbourhood') {
             // Assuming "Me" is always local (distance 0 or matches location)
             locationScopeData = leaderboardData.filter(p => p.distanceKm < 10 || (p as any).isMe); 
        }
        
        const overall = locationScopeData.findIndex(p => p.id === currentUser.id) + 1;

        // 2. Filter the location-scoped list by Profession
        const professionScopeData = locationScopeData.filter(p => 
            p.service.toLowerCase() === currentUser.service.toLowerCase() || 
            p.category === currentUser.category
        );
        const profession = professionScopeData.findIndex(p => p.id === currentUser.id) + 1;

        return { overall, profession };
    }, [leaderboardData, rankFilter, currentUser]);

    // Filter Logic for the List View
    const filteredLeaderboard = useMemo(() => {
        let data = leaderboardData;
        
        // Filter by Neighbourhood (Mock logic: filter by distance < 10km or if it is Me)
        if (rankFilter === 'neighbourhood') {
            data = data.filter(p => p.distanceKm < 10 || (p as any).isMe); 
        }

        // Filter by Profession
        if (professionFilter !== 'All') {
            data = data.filter(p => p.service.toLowerCase().includes(professionFilter.toLowerCase()) || p.category.toLowerCase() === professionFilter.toLowerCase());
        }

        return data;
    }, [leaderboardData, rankFilter, professionFilter]);

    const uniqueProfessions = useMemo(() => {
        const jobs = new Set(providers.map(p => p.service));
        return ['All', ...Array.from(jobs)];
    }, [providers]);

    const currentChartData = HISTORY_DATA[historyView];
    const maxChartValue = Math.max(...currentChartData.map(d => d.value));

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={onBack} className="text-gray-600">
                        <BackIcon />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">My Journey</h1>
                </div>
                
                {/* Tabs */}
                <div className="flex px-4 pb-0 space-x-6 border-b border-gray-200">
                     <button 
                        onClick={() => setActiveTab('steps')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'steps' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-gray-500'}`}
                    >
                        <FootstepsIcon /> Step Up
                    </button>
                    <button 
                        onClick={() => setActiveTab('skills')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'skills' ? 'border-brand-navy text-brand-navy' : 'border-transparent text-gray-500'}`}
                    >
                        <BookIcon /> Skill Progress
                    </button>
                </div>
            </header>

            <main className="p-4 flex-1 overflow-y-auto no-scrollbar pb-24">
                
                {/* --- STEPS DASHBOARD --- */}
                {activeTab === 'steps' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Personal Stats */}
                        <div className="bg-brand-navy rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Total Steps</h2>
                                    <div className="flex items-end gap-2 mt-1">
                                        <span className="text-4xl font-bold">{myCurrentSteps.toLocaleString()}</span>
                                        <span className="text-xs mb-1.5 opacity-80">Today</span>
                                    </div>
                                </div>
                                
                                {/* History Toggle */}
                                <div className="flex bg-white/10 rounded-lg p-0.5">
                                    {(['daily', 'weekly', 'monthly'] as const).map((view) => (
                                        <button
                                            key={view}
                                            onClick={() => setHistoryView(view)}
                                            className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase transition-all ${historyView === view ? 'bg-white text-brand-navy' : 'text-gray-300 hover:text-white'}`}
                                        >
                                            {view === 'daily' ? 'Days' : view === 'weekly' ? 'Wks' : 'Mos'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Dynamic Chart */}
                            <div className="mt-4 flex items-end justify-between h-32 gap-2">
                                {currentChartData.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
                                        <div className="relative w-full h-full flex items-end justify-center">
                                            {/* Tooltip */}
                                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                                {d.value.toLocaleString()}
                                            </div>
                                            <div 
                                                className={`w-full rounded-t-sm transition-all duration-500 ${d.label === 'Sun' || d.label === 'Oct' || d.label === 'Wk 4' ? 'bg-brand-gold' : 'bg-white/30 group-hover:bg-white/50'}`} 
                                                style={{ height: `${(d.value / maxChartValue) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[9px] text-gray-400">{d.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ranking Controls */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-lg text-gray-800">Leaderboard</h2>
                                <div className="bg-white border rounded-lg p-1 flex text-xs font-semibold">
                                    <button 
                                        onClick={() => setRankFilter('neighbourhood')}
                                        className={`px-3 py-1.5 rounded-md transition-all ${rankFilter === 'neighbourhood' ? 'bg-brand-navy text-white shadow-sm' : 'text-gray-600'}`}
                                    >
                                        {userLocationName}
                                    </button>
                                    <button 
                                        onClick={() => setRankFilter('country')}
                                        className={`px-3 py-1.5 rounded-md transition-all ${rankFilter === 'country' ? 'bg-brand-navy text-white shadow-sm' : 'text-gray-600'}`}
                                    >
                                        Kenya
                                    </button>
                                </div>
                            </div>

                            {/* Profession Filter */}
                            <div className="mb-4">
                                <select 
                                    value={professionFilter}
                                    onChange={(e) => setProfessionFilter(e.target.value)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-brand-gold outline-none"
                                >
                                    {uniqueProfessions.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            
                            {/* Rank Highlight Card */}
                            {currentUser && myRanks.overall > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-center justify-between shadow-sm animate-fade-in">
                                    <div>
                                        <p className="text-sm text-blue-900">
                                            You are position <span className="font-bold text-lg text-brand-navy">#{myRanks.overall}</span> in <span className="font-bold">{rankFilter === 'neighbourhood' ? userLocationName : 'Kenya'}</span>
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            and <span className="font-bold">#{myRanks.profession}</span> amongst <span className="font-semibold capitalize">{currentUser.service}s</span>
                                        </p>
                                    </div>
                                    <div className="text-3xl bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-sm border border-blue-100">🏆</div>
                                </div>
                            )}

                            {/* Leaderboard List */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                                {filteredLeaderboard.map((user, index) => {
                                    const isMe = (user as any).isMe;
                                    return (
                                        <div 
                                            key={user.id} 
                                            onClick={() => onSelectProvider(user)} 
                                            className={`flex items-center p-4 gap-3 cursor-pointer transition-colors ${isMe ? 'bg-blue-50 border-l-4 border-brand-navy pl-3' : 'hover:bg-gray-50 border-l-4 border-transparent pl-3'}`}
                                        >
                                            <div className={`w-6 text-center font-bold ${index < 3 ? 'text-brand-gold' : 'text-gray-400'}`}>
                                                {index + 1}
                                            </div>
                                            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1">
                                                    <p className={`font-bold text-sm truncate ${isMe ? 'text-brand-navy' : 'text-gray-800'}`}>
                                                        {user.name} {isMe && '(You)'}
                                                    </p>
                                                    {user.isVerified && <span className="text-blue-500 text-[10px]">✓</span>}
                                                </div>
                                                {/* Specific formatting: Name - Profession - Rate */}
                                                <p className="text-xs text-gray-600 truncate mt-0.5">
                                                    {user.service} - {user.currency}{user.hourlyRate}/hr
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-brand-gold text-sm">{user.steps.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">steps</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredLeaderboard.length === 0 && (
                                    <div className="p-8 text-center text-gray-500 text-sm">
                                        No professionals found in this category.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}


                {/* --- SKILLS DASHBOARD --- */}
                {activeTab === 'skills' && (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">My Skill Progress</h2>
                            {userSkills.length > 0 ? (
                                <div className="space-y-3">
                                    {userSkills.map((skill, index) => (
                                        <SkillProgressCard key={index} skillName={skill.skillName} progress={skill.progress} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 px-4 bg-white rounded-xl border border-dashed">
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Skills Tracked</h3>
                                    <p className="mt-1 text-sm text-gray-500">Start a course to track your progress here.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">Recommended Training Centers</h2>
                            {institutions.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {institutions.map(inst => (
                                        <ServiceCard key={inst.id} provider={inst} onClick={() => onSelectProvider(inst)} />
                                    ))}
                                </div>
                            ) : (
                                 <div className="text-center py-10 px-4 bg-white rounded-xl border">
                                    <p className="text-sm text-gray-500">No training institutions found nearby.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default JourneyPage;
