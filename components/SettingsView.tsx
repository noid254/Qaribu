import React, { useState } from 'react';

interface SettingsViewProps {
    onBack: () => void;
}

const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
    const [isDark, setIsDark] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [isClearing, setIsClearing] = useState(false);

    const handleHardRefresh = async () => {
        setIsClearing(true);
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
        }
        await caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))));
        window.location.reload();
    };

    const handleClearData = () => {
        if(confirm("Are you sure? This will log you out and clear all saved data on this device.")) {
            localStorage.clear();
            handleHardRefresh();
        }
    };

    const SettingItem: React.FC<{ icon: React.ReactNode, label: string, action?: React.ReactNode, onClick?: () => void, isDestructive?: boolean }> = ({ icon, label, action, onClick, isDestructive }) => (
        <div onClick={onClick} className={`flex items-center justify-between p-4 bg-white border-b border-gray-100 last:border-0 ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {icon}
                </div>
                <span className={`font-medium ${isDestructive ? 'text-red-600' : 'text-gray-800'}`}>{label}</span>
            </div>
            <div>
                {action || <ChevronRightIcon />}
            </div>
        </div>
    );

    const Toggle: React.FC<{ checked: boolean, onChange: (val: boolean) => void }> = ({ checked, onChange }) => (
        <div 
            onClick={() => onChange(!checked)} 
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-brand-gold' : 'bg-gray-300'}`}
        >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-5' : ''}`}></div>
        </div>
    );

    return (
        <div className="w-full max-w-sm mx-auto bg-gray-50 min-h-screen font-sans">
            <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800">Settings</h1>
            </header>
            
            <div className="p-4 space-y-6">
                
                {/* Preferences */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Preferences</h3>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <SettingItem 
                            icon={<MoonIcon />} 
                            label="Dark Mode" 
                            action={<Toggle checked={isDark} onChange={setIsDark} />} 
                        />
                        <SettingItem 
                            icon={<BellIcon />} 
                            label="Notifications" 
                            action={<Toggle checked={notifications} onChange={setNotifications} />} 
                        />
                    </div>
                </div>

                {/* System */}
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">System & Data</h3>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <SettingItem 
                            icon={<RefreshIcon />} 
                            label={isClearing ? "Refreshing..." : "Hard Refresh"} 
                            onClick={handleHardRefresh}
                        />
                        <SettingItem 
                            icon={<TrashIcon />} 
                            label="Reset App Data" 
                            isDestructive
                            onClick={handleClearData}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 px-1">
                        Version 1.2.1 • Build 2025.05.28
                    </p>
                </div>

            </div>
        </div>
    );
};

export default SettingsView;