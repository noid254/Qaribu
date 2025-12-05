
import React, { useState } from 'react';
import type { ServiceProvider, UnitDetails, SetupData } from '../types';

interface HostSetupProps {
    setupData: SetupData;
    currentUser: ServiceProvider;
    onSave: (details: UnitDetails) => void;
    onBack: () => void;
}

// Icons for Toggle
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const BellOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>;

const HostSetup: React.FC<HostSetupProps> = ({ setupData, currentUser, onSave, onBack }) => {
    const [type, setType] = useState<'Business' | 'Residence'>('Business');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [status, setStatus] = useState<UnitDetails['availabilityStatus']>('Available');
    const [doorNote, setDoorNote] = useState('');

    const handleSubmit = () => {
        const details: UnitDetails = {
            type,
            availabilityStatus: status,
            operatingHours: type === 'Business' ? `${startTime} - ${endTime}` : undefined,
            doorNote: doorNote || undefined,
        };
        onSave(details);
    };

    const toggleDoNotDisturb = () => {
        setStatus(prev => prev === 'Do Not Disturb' ? 'Available' : 'Do Not Disturb');
    };

    // 1. GATEMAN SETUP
    if (setupData.role === 'Gateman') {
        return (
            <div className="bg-gray-50 min-h-screen font-sans flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Security Role</h2>
                <p className="text-gray-600 mb-8">You are accepting the role of <strong>Gateman</strong> for premise <strong>{setupData.premiseId}</strong>.</p>
                
                <button onClick={handleSubmit} className="w-full bg-brand-navy text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black transition active:scale-95">
                    Accept & Start Shift
                </button>
                <button onClick={onBack} className="mt-4 text-gray-500 font-bold text-sm">Cancel</button>
            </div>
        );
    }

    // 2. CO-HOST SETUP
    if (setupData.role === 'Staff') {
        return (
            <div className="bg-gray-50 min-h-screen font-sans flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Become a Co-host</h2>
                <p className="text-gray-600 mb-8">You have been invited to co-manage <strong>Unit {setupData.unitId}</strong>.</p>
                
                <button onClick={handleSubmit} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition active:scale-95">
                    Accept Invitation
                </button>
                <button onClick={onBack} className="mt-4 text-gray-500 font-bold text-sm">Decline</button>
            </div>
        );
    }

    // 3. TENANT/HOST SETUP (Default)
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center gap-4">
                <button onClick={onBack} className="text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800">Setup Your Unit</h1>
            </header>

            <main className="flex-1 p-4 pb-24 overflow-y-auto">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase mb-2">Location</h2>
                    <p className="text-lg font-bold text-brand-navy">Unit {setupData.unitId}</p>
                    <p className="text-sm text-gray-600">Premise ID: {setupData.premiseId}</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">I am setting up as a...</h2>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setType('Business')}
                            className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${type === 'Business' ? 'border-brand-navy bg-blue-50 text-brand-navy' : 'border-gray-200 bg-white text-gray-500'}`}
                        >
                            Business
                        </button>
                        <button 
                            onClick={() => setType('Residence')}
                            className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${type === 'Residence' ? 'border-brand-navy bg-blue-50 text-brand-navy' : 'border-gray-200 bg-white text-gray-500'}`}
                        >
                            Residence
                        </button>
                    </div>
                </div>

                {type === 'Business' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-3">Current Status</h3>
                            <select 
                                value={status} 
                                onChange={e => setStatus(e.target.value as any)}
                                className="w-full p-3 border rounded-lg bg-gray-50 font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            >
                                <option value="Available">Open / Available</option>
                                <option value="Busy">Busy / In Meeting</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-3">Operating Hours</h3>
                            <div className="flex items-center gap-2">
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="flex-1 p-3 border rounded-lg bg-gray-50" />
                                <span className="text-gray-400">to</span>
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="flex-1 p-3 border rounded-lg bg-gray-50" />
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-3">Public Profile Preview</h3>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <img src={currentUser.avatarUrl} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <p className="font-bold text-gray-900">{currentUser.name}</p>
                                    <p className="text-xs text-gray-500">{currentUser.service}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Visitors will see your NikoSoko profile details when they scan your door.</p>
                        </div>
                    </div>
                )}

                {type === 'Residence' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Large DND Toggle Switch */}
                        <div 
                            onClick={toggleDoNotDisturb}
                            className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all duration-300 ${status === 'Do Not Disturb' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${status === 'Do Not Disturb' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {status === 'Do Not Disturb' ? <BellOffIcon/> : <BellIcon/>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{status === 'Do Not Disturb' ? 'Do Not Disturb' : 'Available'}</h3>
                                    <p className="text-xs text-gray-600">{status === 'Do Not Disturb' ? 'Visitors cannot ring doorbell' : 'Visitors can ring doorbell'}</p>
                                </div>
                            </div>
                            <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center ${status === 'Do Not Disturb' ? 'bg-red-500' : 'bg-green-500'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${status === 'Do Not Disturb' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-3">Door Note</h3>
                            <textarea 
                                value={doorNote}
                                onChange={e => setDoorNote(e.target.value)}
                                placeholder="e.g. Please leave packages at the reception. Ring doorbell twice."
                                rows={4}
                                className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                            />
                        </div>
                    </div>
                )}
            </main>

            <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-gray-200">
                <button onClick={handleSubmit} className="w-full bg-brand-navy text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition active:scale-95">
                    Save & Complete Setup
                </button>
            </footer>
        </div>
    );
};

export default HostSetup;
