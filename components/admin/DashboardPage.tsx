import React from 'react';
import type { ServiceProvider } from '../../types';
import type { AdminPage } from '../SuperAdminDashboard';

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-3-5.197M15 21a9 9 0 00-3-5.197" /></svg>;
const UserPlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const MouseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>;


const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, change: string, onClick?: () => void }> = ({ title, value, icon, change, onClick }) => (
    <div onClick={onClick} className={`bg-white p-6 rounded-lg shadow ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 transition-transform' : ''}`}>
        <div className="flex items-start justify-between">
            <div className="flex flex-col space-y-2">
                <span className="text-gray-500 font-medium">{title}</span>
                <span className="text-3xl font-bold text-gray-800">{value}</span>
            </div>
            <div className="p-3 bg-gray-100 rounded-full text-brand-primary">
                {icon}
            </div>
        </div>
        <p className="text-sm text-green-500 mt-2">{change}</p>
    </div>
);

interface DashboardPageProps {
    providers: ServiceProvider[];
    onSwitchPage: (page: AdminPage) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ providers, onSwitchPage }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Users" value={providers.length.toString()} icon={<UsersIcon />} change="+2 this week" onClick={() => onSwitchPage('Users')} />
            <StatCard title="New Sign-ups" value="5" icon={<UserPlusIcon />} change="+5 this week" onClick={() => onSwitchPage('Users')} />
            <StatCard title="Profile Clicks" value="1.2k" icon={<MouseIcon />} change="+12% this week" />
        </div>
    );
};

export default DashboardPage;
