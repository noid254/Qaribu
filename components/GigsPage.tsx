import React, { useState } from 'react';
import type { Gig, ServiceProvider } from '../types';

interface GigsPageProps {
    gigs: Gig[];
    providers: ServiceProvider[];
    onSelectProvider: (provider: ServiceProvider) => void;
    onApply: (gig: Gig) => void;
    isAuthenticated: boolean;
    onAuthClick: () => void;
}

const budgetTypeSuffix: Record<Gig['budgetType'], string> = {
    'fixed': 'total',
    'per hour': '/hr',
    'per day': '/day'
};

const BidModal: React.FC<{ gig: Gig; onClose: () => void; }> = ({ gig, onClose }) => {
    const [amount, setAmount] = useState('');
    const [proposal, setProposal] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !proposal) {
            alert("Please enter a bid amount and a proposal.");
            return;
        }
        alert(`Bid submitted for ${gig.title}!\nAmount: ${gig.currency} ${amount}\nProposal: ${proposal}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-2">Place Your Bid</h2>
                <p className="text-sm text-ink-soft mb-4">for "{gig.title}"</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="bidAmount" className="block text-sm font-medium text-ink">Your Bid Amount ({gig.currency})</label>
                        <input
                            type="number"
                            id="bidAmount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-md"
                            placeholder={`e.g., ${gig.budget}`}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="proposal" className="block text-sm font-medium text-ink">Your Proposal</label>
                        <textarea
                            id="proposal"
                            rows={4}
                            value={proposal}
                            onChange={e => setProposal(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-md"
                            placeholder="Explain why you're a good fit for this gig..."
                            required
                        ></textarea>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 bg-surface-sunken text-ink font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="flex-1 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Submit Bid</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface GigDetailViewProps {
    gig: Gig;
    provider?: ServiceProvider;
    onBack: () => void;
    onSelectProvider: (provider: ServiceProvider) => void;
    onApply: (gig: Gig) => void;
    isAuthenticated: boolean;
    onAuthClick: () => void;
}

const GigDetailView: React.FC<GigDetailViewProps> = ({ gig, provider, onBack, onSelectProvider, onApply, isAuthenticated, onAuthClick }) => {
    const [isBidding, setIsBidding] = useState(false);
    
    const handleApply = () => {
        if (!isAuthenticated) {
            onAuthClick();
        } else {
            onApply(gig);
            onBack();
        }
    }

    const handleBidClick = () => {
        if (!isAuthenticated) {
            onAuthClick();
        } else {
            setIsBidding(true);
        }
    };

    return (
        <>
        {isBidding && <BidModal gig={gig} onClose={() => setIsBidding(false)} />}
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end z-40" onClick={onBack}>
            <div 
                className="bg-surface-muted rounded-t-2xl shadow-xl w-full max-w-sm h-[85vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex-shrink-0 relative">
                    <img src={gig.imageUrl} alt={gig.title} className="w-full h-48 object-cover rounded-t-2xl" />
                    <button onClick={onBack} className="absolute top-3 right-3 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl z-10">&times;</button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                    <span className="text-sm font-bold text-brand-primary uppercase">{gig.category}</span>
                    <h1 className="text-3xl font-bold text-ink">{gig.title}</h1>
                    <p className="text-ink-soft">{gig.location}</p>

                    <div className="text-3xl font-bold text-brand-dark mt-3">
                        {gig.currency} {gig.budget.toLocaleString()}
                        <span className="text-base font-medium text-ink-soft"> {budgetTypeSuffix[gig.budgetType]}</span>
                    </div>

                    <p className="text-sm text-ink mt-4 leading-relaxed whitespace-pre-wrap">{gig.description}</p>
                    
                    {provider && (
                        <div>
                            <h2 className="font-bold text-lg text-ink mt-4 border-t pt-4">Posted By</h2>
                            <button onClick={() => onSelectProvider(provider)} className="flex items-center gap-3 p-3 bg-white border border-line rounded-lg mt-2 w-full text-left hover:bg-surface-sunken">
                                <img src={provider.avatarUrl} alt={provider.name} className="w-12 h-12 rounded-full object-cover"/>
                                <div>
                                    <p className="font-bold text-ink">{provider.name}</p>
                                    <p className="text-sm text-ink-soft">{provider.service}</p>
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white border-t flex-shrink-0 flex items-center gap-3">
                    <button onClick={handleBidClick} className="flex-1 bg-surface-sunken text-ink font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors">
                        Bid
                    </button>
                    <button onClick={handleApply} className="flex-1 bg-brand-dark text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors">
                        Apply
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

const GigsPage: React.FC<GigsPageProps> = ({ gigs, providers, onSelectProvider, onApply, isAuthenticated, onAuthClick }) => {
    const [selectedGig, setSelectedGig] = useState<Gig | null>(null);

    return (
        <div className="p-4 bg-surface-muted min-h-full">
            <h1 className="text-3xl font-bold text-ink mb-4">Available Gigs</h1>

            {gigs.length > 0 ? (
                <div className="space-y-3">
                    {gigs.map(gig => {
                        const provider = providers.find(p => p.id === gig.providerId);
                        return (
                            <button key={gig.id} onClick={() => setSelectedGig(gig)} className="w-full text-left bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 border border-line">
                                <img src={gig.imageUrl} alt={gig.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-surface-sunken" />
                                <div className="flex-grow overflow-hidden">
                                    <p className="text-xs text-ink-soft">{gig.location}</p>
                                    <h3 className="font-bold text-ink truncate">{gig.title}</h3>
                                    <p className="text-sm font-semibold text-brand-dark mt-1">
                                        {gig.currency} {gig.budget.toLocaleString()}
                                        <span className="text-xs font-normal text-ink-soft"> {budgetTypeSuffix[gig.budgetType]}</span>
                                    </p>
                                    {provider && <p className="text-xs text-ink-soft mt-1">by {provider.name}</p>}
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-ink-faint flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-16 text-ink-soft">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-ink">No gigs available right now</h3>
                    <p className="mt-1 text-sm text-ink-soft">Please check back later for new opportunities.</p>
                </div>
            )}
            
            {selectedGig && (
                <GigDetailView 
                    gig={selectedGig}
                    provider={providers.find(p => p.id === selectedGig.providerId)}
                    onBack={() => setSelectedGig(null)}
                    onSelectProvider={onSelectProvider}
                    onApply={onApply}
                    isAuthenticated={isAuthenticated}
                    onAuthClick={onAuthClick}
                />
            )}
        </div>
    );
};

export default GigsPage;