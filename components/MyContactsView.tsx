import React from 'react';
import type { ServiceProvider } from '../types';

interface MyContactsViewProps {
    contacts: ServiceProvider[];
    onSelectContact: (contact: ServiceProvider) => void;
    onBack: () => void;
}

const MyContactsView: React.FC<MyContactsViewProps> = ({ contacts, onSelectContact, onBack }) => {
    return (
        <div className="w-full max-w-sm mx-auto bg-surface-muted min-h-screen">
            <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={onBack} className="text-ink-soft">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-ink">My Contacts</h1>
            </header>
            <div className="p-4 space-y-3">
                {contacts.length > 0 ? (
                    contacts.map(contact => (
                        <button key={contact.id} onClick={() => onSelectContact(contact)} className="w-full text-left bg-white p-3 rounded-Nonecard shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                            <img src={contact.avatarUrl} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                            <div>
                                <p className="font-bold text-ink">{contact.name}</p>
                                <p className="text-body text-ink-soft">{contact.service}</p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="text-center py-16 text-ink-soft">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-3-5.197M15 21a9 9 0 00-3-5.197" /></svg>
                        <h3 className="mt-2 text-body font-medium text-ink">No Contacts Yet</h3>
                        <p className="mt-1 text-body text-ink-soft">You haven't saved any contacts yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyContactsView;
