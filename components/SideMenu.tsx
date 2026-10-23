
import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
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
const IdIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>;
const AssetsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
const BookingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>;
const DocumentsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
const PlacesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 7.142-9 11.25-9 11.25S3 17.642 3 10.5a9 9 0 1118 0z" /></svg>;
const SkillsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>;
const GatepassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>;
const AdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>;
const ToolboxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate, currentUser, isSuperAdmin, onLogout }) => {
  // The Skill ID photo is the picture people see for you, so the menu shows it when there is one.
  const [skillPhoto, setSkillPhoto] = useState<string | null>(null);
  const signedIn = !!currentUser;
  useEffect(() => {
    if (!isOpen || !signedIn) return;
    let live = true;
    let url: string | null = null;
    api
      .getSkillIdState()
      .then((state) => (state.me.has_photo ? api.fetchSkillIdPhotoUrl() : null))
      .then((u) => {
        url = u;
        if (live) setSkillPhoto(u);
      })
      .catch(() => undefined);
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [isOpen, signedIn]);

  const menuItems: { label: string; page: CurrentPage | 'profile'; icon: React.ReactNode }[] = [
    { label: 'Assets', page: 'assetRegistry', icon: <AssetsIcon /> },
    { label: 'Bookings', page: 'bookings', icon: <BookingsIcon /> },
    { label: 'Catalogue', page: 'mycatalogue', icon: <CatalogueIcon /> },
    { label: 'Documents', page: 'myDocuments', icon: <DocumentsIcon /> },
    { label: 'Places', page: 'myplaces', icon: <PlacesIcon /> },
    { label: 'Skills', page: 'skills', icon: <SkillsIcon /> },
    { label: 'Gatepass', page: 'invite', icon: <GatepassIcon /> },
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
            <button onClick={() => handleNavigate('identity')} className="w-full text-left">
              <header className="p-6 border-b border-white/10 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                      <img src={skillPhoto || currentUser.avatarUrl || 'https://i.pravatar.cc/150?img=5'} alt="User Avatar" className="w-14 h-14 rounded-full border-2 border-white/30" />
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
