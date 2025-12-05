
import React from 'react';
import type { ServiceProvider, CurrentPage } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: CurrentPage | 'profile' | 'login') => void;
  currentUser: ServiceProvider | null;
  isSuperAdmin: boolean;
  onLogout: () => void;
}

// --- Icons for the new side menu design ---
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const CatalogueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const LoginIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>;
const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>;
const ToolboxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate, currentUser, isSuperAdmin, onLogout }) => {
  const menuItems: { label: string; page: CurrentPage | 'profile'; icon: React.ReactNode }[] = [
    { label: 'My Wallet', page: 'qaribu', icon: <WalletIcon /> },
    { label: 'My Catalogue', page: 'mycatalogue', icon: <CatalogueIcon /> },
    { label: 'My Toolkit', page: 'mytoolkit', icon: <ToolboxIcon /> },
    { label: 'Settings', page: 'settings', icon: <SettingsIcon /> },
  ];

  const handleNavigate = (page: CurrentPage | 'profile' | 'login') => {
    onNavigate(page);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] mx-auto max-w-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
      <div
        className={`relative w-4/5 max-w-xs h-full bg-brand-navy text-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Logo Section */}
        <div className="p-4 text-center border-b border-white/10">
            <img src="https://i.imgur.com/I5MaTM3.png" alt="Qaribu Logo" className="h-24 mx-auto" />
        </div>
        
        {/* User Profile Section */}
        {currentUser ? (
            <button onClick={() => handleNavigate('profile')} className="w-full text-left">
              <header className="p-6 border-b border-white/10 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                      <img src={currentUser.avatarUrl || 'https://i.pravatar.cc/150?img=5'} alt="User Avatar" className="w-14 h-14 rounded-full border-2 border-white/30" />
                      <div>
                          <p className="font-semibold text-lg">{currentUser.name}</p>
                          <p className="text-xs text-gray-400">{currentUser.service}</p>
                      </div>
                  </div>
              </header>
            </button>
        ) : (
            <div className="p-6 border-b border-white/10">
                <button
                    onClick={() => handleNavigate('login')}
                    className="w-full flex items-center justify-center gap-3 text-left px-4 py-3 rounded-lg bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 transition-colors"
                >
                    <LoginIcon />
                    <span className="font-medium">Login / Sign Up</span>
                </button>
            </div>
        )}

        {/* Navigation Section */}
        {currentUser && (
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map(item => (
                <button
                key={item.page}
                onClick={() => handleNavigate(item.page)}
                className="w-full flex items-center gap-4 text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                </button>
            ))}
            {/* ADMIN BUTTON */}
            {isSuperAdmin && (
                <button
                onClick={() => handleNavigate('admin')}
                className="w-full flex items-center gap-4 text-left px-4 py-3 rounded-lg text-yellow-400 hover:bg-white/10 transition-colors font-bold border border-yellow-400/30 mt-4"
                >
                <AdminIcon />
                <span>Admin Panel</span>
                </button>
            )}
            </nav>
        )}
        
        {/* Logout Section */}
        <footer className="p-4 border-t border-white/10 mt-auto">
          {currentUser && (
            <button onClick={handleLogout} className="w-full flex items-center gap-4 text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
              <LogoutIcon />
              <span className="font-medium">Logout</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default SideMenu;
