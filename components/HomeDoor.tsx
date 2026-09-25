import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ServiceProvider, CatalogueItem, Document, Premise, CurrentPage } from '../types';
import ServiceCard from './ServiceCard';

// --- Icons (24px outline, one visual weight) ---
const Ico: React.FC<{ d: string | string[]; className?: string }> = ({ d, className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    </svg>
);
const I = {
    menu: 'M4 7h16M4 12h16M4 17h10',
    bell: ['M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5', 'M9 17a3 3 0 006 0'],
    search: 'M21 21l-5.2-5.2M17 10a7 7 0 11-14 0 7 7 0 0114 0z',
    scan: ['M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M8 20H6a2 2 0 01-2-2v-2', 'M8 12h8'],
    plus: 'M12 5v14M5 12h14',
    swap: ['M7 7h11l-3-3', 'M17 17H6l3 3'],
    shield: ['M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z', 'M9 12l2 2 4-4'],
    key: ['M14 10a4 4 0 11-3.9 3.1L4 19.2V21h2v-2h2v-2h2l1.1-1.1', 'M16 8h.01'],
    spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
    box: ['M21 8l-9-5-9 5v8l9 5 9-5V8z', 'M3 8l9 5 9-5M12 13v8'],
    home: 'M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8z',
    doc: ['M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z', 'M14 3v5h5M9 13h6M9 17h4'],
    compass: ['M12 21a9 9 0 100-18 9 9 0 000 18z', 'M15.5 8.5l-2 5-5 2 2-5 5-2z'],
    wallet: ['M4 7a2 2 0 012-2h11v4', 'M4 7v10a2 2 0 002 2h13a1 1 0 001-1v-8a1 1 0 00-1-1H6a2 2 0 01-2-2z', 'M16 14h.01'],
    user: ['M12 12a4 4 0 100-8 4 4 0 000 8z', 'M4 20a8 8 0 0116 0'],
    arrow: 'M5 12h14M13 6l6 6-6 6',
    pin: ['M12 21s7-6.1 7-11.5A7 7 0 105 9.5C5 14.9 12 21 12 21z', 'M12 11.5a2 2 0 100-4 2 2 0 000 4z'],
    star: 'M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9-6.3 3.9 1.7-7-5.4-4.7 7.1-.6L12 2z',
};

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Cycles through a list on an interval, paused for prefers-reduced-motion. Returns the current index.
function useCarousel(length: number, intervalMs: number): number {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (length < 2 || prefersReducedMotion()) return;
        const id = setInterval(() => setIndex(i => (i + 1) % length), intervalMs);
        return () => clearInterval(id);
    }, [length, intervalMs]);
    return length > 0 ? index % length : 0;
}

interface HomeDoorProps {
    providers: ServiceProvider[];
    catalogueItems: CatalogueItem[];
    documents: Document[];
    premises: Premise[];
    currentUser: ServiceProvider | null;
    isAuthenticated: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    hasNewMessages: boolean;
    onOpenMenu: () => void;
    onMessagesClick: () => void;
    onAuthClick: () => void;
    onSelectProvider: (provider: ServiceProvider) => void;
    onNavigate: (page: CurrentPage) => void;
}

// The mark: Qaribu's own pin+keyhole "Q" — your door in, glowing.
const Seal: React.FC<{ size?: string }> = ({ size = 'h-20 w-20' }) => (
    <div className="relative flex items-center justify-center">
        <div className="door-breathe absolute h-28 w-28 rounded-full bg-glow/25 blur-2xl" aria-hidden="true" />
        <img src="/logo.png" alt="Qaribu" className={`relative ${size} drop-shadow-[0_6px_20px_rgba(239,176,63,0.4)]`} />
    </div>
);

// "Qaribu Ruaka." / "Qaribu CBD." — cycling through areas people are actually listed in.
const LocationLine: React.FC<{ areas: string[] }> = ({ areas }) => {
    const index = useCarousel(areas.length, 2000);
    return (
        <p className="rise-in-2 mt-3 font-serif text-headline text-brand-navy" aria-live="polite">
            Qaribu <span key={index} className="inline-block text-brand-gold-dark rise-in">{areas[index] || 'Nairobi'}</span>
            <span className="text-brand-navy">.</span>
        </p>
    );
};

// Rotates through real listed providers — a live pulse of what's on the app right now.
const Spotlight: React.FC<{ providers: ServiceProvider[]; onSelect: (p: ServiceProvider) => void }> = ({ providers, onSelect }) => {
    const index = useCarousel(providers.length, 4000);
    const p = providers[index];
    if (!p) return null;
    return (
        <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="rise-in mt-4 flex w-full items-center gap-3 rounded-card border border-line bg-surface p-2.5 text-left shadow-card transition-transform active:scale-[0.98]"
        >
            <img src={p.avatarUrl} alt="" className="h-11 w-11 flex-shrink-0 rounded-control object-cover" />
            <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                    <span className="badge-brand shrink-0 !py-0.5">Live near you</span>
                </span>
                <span className="mt-0.5 block truncate text-body font-bold text-ink">{p.name} · {p.service}</span>
            </span>
            <span className="flex flex-shrink-0 items-center gap-1 text-caption font-bold text-ink-soft">
                <Ico d={I.star} className="h-3.5 w-3.5 text-brand-gold-dark" /> {p.rating.toFixed(1)}
            </span>
        </button>
    );
};

const Home: React.FC<HomeDoorProps> = ({
    providers, catalogueItems, documents, premises, currentUser, isAuthenticated,
    searchTerm, setSearchTerm, hasNewMessages, onOpenMenu, onMessagesClick, onAuthClick,
    onSelectProvider, onNavigate,
}) => {
    const firstName = currentUser?.name?.split(' ')[0];

    const myAssets = useMemo(
        () => documents.filter(d => d.isAsset && currentUser?.phone && d.ownerPhone === currentUser.phone),
        [documents, currentUser?.phone]
    );
    const walletValue = myAssets.reduce((sum, d) => sum + (d.amount || 0), 0);
    const walletCurrency = myAssets[0]?.currency || 'Ksh';
    const verifiedCount = myAssets.filter(d => d.verificationStatus === 'Verified').length;

    const exchangeItems = useMemo(
        () => [...catalogueItems].sort((a, b) => Number(b.isVerified) - Number(a.isVerified)).slice(0, 8),
        [catalogueItems]
    );

    const nearby = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        const list = q
            ? providers.filter(p => [p.name, p.service, p.category].some(v => v?.toLowerCase().includes(q)))
            : providers;
        return [...list].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, q ? 12 : 4);
    }, [providers, searchTerm]);

    // Areas actually in use, e.g. "Kilimani, Nairobi" -> "Kilimani" — for the cycling "Qaribu {Area}." line.
    const areas = useMemo(() => {
        const seen = new Set<string>();
        for (const p of providers) {
            // Only "Neighborhood, City" formatted locations — skips one-word entries
            // like a gate post's "Gate House" or a bare "Nairobi", which read oddly as areas.
            if (!p.location?.includes(',')) continue;
            const area = p.location.split(',')[0].trim();
            if (area) seen.add(area);
        }
        return seen.size > 0 ? Array.from(seen).slice(0, 5) : ['Nairobi'];
    }, [providers]);

    // A rotating pulse of live listings for the banner — verified first, so the "lively" effect leads with trust.
    const spotlightPool = useMemo(
        () => [...providers].sort((a, b) => Number(b.isVerified) - Number(a.isVerified)).slice(0, 10),
        [providers]
    );

    const goProfile = () => (currentUser && isAuthenticated ? onSelectProvider(currentUser) : onAuthClick());

    const actions: { label: string; hint: string; icon: string | string[]; page: CurrentPage; tone: string }[] = [
        { label: 'Tokenize', hint: 'Turn it into an asset', icon: I.spark, page: 'registerAsset', tone: 'bg-glow text-night' },
        { label: 'Exchange', hint: 'Buy & sell', icon: I.swap, page: 'tukosoko', tone: 'bg-night-raised text-glow' },
        { label: 'Verify', hint: 'Check ownership', icon: I.shield, page: 'ownershipCheck', tone: 'bg-night-raised text-chain' },
        { label: 'Gate Pass', hint: 'Free entry codes', icon: I.key, page: 'qaribu', tone: 'bg-night-raised text-white' },
    ];

    const kinds: { label: string; blurb: string; icon: string | string[]; page: CurrentPage }[] = [
        { label: 'Skills', blurb: 'Your time & talent', icon: I.user, page: 'services' },
        { label: 'Products', blurb: 'Phones, gear, goods', icon: I.box, page: 'tukosoko' },
        { label: 'Property', blurb: 'Homes & land', icon: I.home, page: 'myplaces' },
        { label: 'Documents', blurb: 'Proof of ownership', icon: I.doc, page: 'myDocuments' },
    ];

    const tabs: { label: string; icon: string | string[]; onClick: () => void; active?: boolean }[] = [
        { label: 'Home', icon: I.home, onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }), active: true },
        { label: 'Explore', icon: I.compass, onClick: () => onNavigate('services') },
        { label: 'Wallet', icon: I.wallet, onClick: () => (isAuthenticated ? onNavigate('assetRegistry') : onAuthClick()) },
        { label: 'Me', icon: I.user, onClick: goProfile },
    ];

    return (
        <div className="min-h-screen bg-surface font-sans pb-28">
            {/* ===== WHITE BANNER ===== */}
            <section className="relative overflow-hidden bg-surface">
                {/* a hint of glow behind the mark, never overwhelming the white */}
                <div className="pointer-events-none absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-glow/15 blur-3xl" />

                <header className="relative z-10 mx-auto flex max-w-md items-center justify-between px-5 pt-5">
                    <button onClick={onOpenMenu} aria-label="Open menu" className="rounded-full bg-surface-sunken p-2.5 text-brand-navy hover:bg-line">
                        <Ico d={I.menu} className="h-5 w-5" />
                    </button>
                    <span className="text-caption font-semibold uppercase tracking-[0.2em] text-ink-faint">
                        {firstName ? `Karibu, ${firstName}` : 'Karibu'}
                    </span>
                    <button onClick={onMessagesClick} aria-label="Notifications" className="relative rounded-full bg-surface-sunken p-2.5 text-brand-navy hover:bg-line">
                        <Ico d={I.bell} className="h-5 w-5" />
                        {hasNewMessages && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-gold-dark ring-2 ring-surface" />}
                    </button>
                </header>

                <div className="relative z-10 mx-auto max-w-md px-6 pb-6 pt-3 text-center">
                    <div className="rise-in flex justify-center"><Seal /></div>
                    <LocationLine areas={areas} />

                    {spotlightPool.length > 0 && <Spotlight providers={spotlightPool} onSelect={onSelectProvider} />}

                    <div className="rise-in-3 mt-4 flex items-center rounded-full border border-line bg-surface p-1.5 shadow-card">
                        <div className="flex flex-1 items-center gap-2 px-3 text-ink-faint">
                            <Ico d={I.search} className="h-5 w-5" />
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Find a skill, item or place"
                                aria-label="Search"
                                className="w-full bg-transparent text-body text-ink outline-none placeholder-ink-faint"
                            />
                        </div>
                        <button onClick={() => onNavigate('qrScan')} className="flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2.5 text-caption font-bold text-white hover:bg-brand-navy-light">
                            <Ico d={I.scan} className="h-4 w-4" /> Scan
                        </button>
                    </div>
                </div>
            </section>

            {/* ===== QUICK ACTIONS ===== */}
            <section className="mx-auto max-w-md px-5 pt-1">
                <div className="grid grid-cols-4 gap-2.5">
                    {actions.map(a => (
                        <button key={a.label} onClick={() => onNavigate(a.page)} className="group flex flex-col items-center gap-2 rounded-card p-1 text-center">
                            <span className={`flex h-14 w-14 items-center justify-center rounded-card shadow-raised transition-transform group-active:scale-95 ${a.tone}`}>
                                <Ico d={a.icon} />
                            </span>
                            <span className="text-caption font-bold leading-tight text-ink">{a.label}</span>
                            <span className="-mt-1.5 text-[10px] leading-tight text-ink-faint">{a.hint}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* ===== LIGHT SHEET ===== */}
            <div className="mt-8 rounded-t-hero bg-surface-muted pb-6 pt-7">
                <div className="mx-auto max-w-md space-y-9 px-5">

                    {/* Wallet */}
                    <section>
                        {isAuthenticated && myAssets.length > 0 ? (
                            <button onClick={() => onNavigate('assetRegistry')} className="relative w-full overflow-hidden rounded-sheet bg-night p-5 text-left shadow-float">
                                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-glow/30 blur-2xl" />
                                <p className="text-caption font-semibold text-white/60">Your assets, est. value</p>
                                <p className="mt-1 font-serif text-headline text-white">{walletCurrency} {walletValue.toLocaleString()}</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-caption font-semibold text-white">{myAssets.length} asset{myAssets.length === 1 ? '' : 's'}</span>
                                    <span className="rounded-full bg-chain/20 px-2.5 py-1 text-caption font-semibold text-chain">{verifiedCount} verified</span>
                                    <span className="ml-auto text-glow"><Ico d={I.arrow} className="h-5 w-5" /></span>
                                </div>
                            </button>
                        ) : (
                            <div className="relative overflow-hidden rounded-sheet bg-night p-5 shadow-float">
                                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-glow/30 blur-2xl" />
                                <p className="font-serif text-title text-white">Open your wallet. It's free.</p>
                                <p className="mt-1 text-body text-white/70">Start with a gate pass, then bring in your first skill or item.</p>
                                <div className="mt-4 flex gap-2">
                                    <button onClick={isAuthenticated ? () => onNavigate('registerAsset') : onAuthClick} className="btn-accent">
                                        {isAuthenticated ? 'Tokenize first asset' : 'Get started'}
                                    </button>
                                    <button onClick={() => onNavigate('qaribu')} className="btn bg-white/10 text-white hover:bg-white/20">Try Gate Pass</button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Asset kinds */}
                    <section>
                        <h2 className="mb-3 font-serif text-title text-ink">Bring anything in</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {kinds.map(k => (
                                <button key={k.label} onClick={() => onNavigate(k.page)} className="card-interactive flex items-center gap-3 p-3.5 text-left">
                                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-control bg-night text-glow"><Ico d={k.icon} /></span>
                                    <span>
                                        <span className="block text-body font-bold text-ink">{k.label}</span>
                                        <span className="block text-caption text-ink-soft">{k.blurb}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Exchange */}
                    {exchangeItems.length > 0 && (
                        <section>
                            <div className="mb-3 flex items-end justify-between">
                                <h2 className="font-serif text-title text-ink">On the exchange</h2>
                                <button onClick={() => onNavigate('tukosoko')} className="text-caption font-bold text-brand-gold-dark">See all</button>
                            </div>
                            <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
                                {exchangeItems.map(item => (
                                    <button key={item.id} onClick={() => onNavigate('tukosoko')} className="card-interactive w-40 flex-shrink-0 overflow-hidden text-left">
                                        <div className="relative h-28 overflow-hidden bg-surface-sunken">
                                            {item.imageUrls?.[0] && (
                                                <img
                                                    src={item.imageUrls[0]}
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                    onError={e => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            )}
                                            {item.isVerified && (
                                                <span className="badge absolute left-2 top-2 bg-night/80 text-chain backdrop-blur">
                                                    <Ico d={I.shield} className="h-3 w-3" /> Verified
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <p className="truncate text-body font-bold text-ink">{item.title}</p>
                                            <p className="mt-0.5 text-body font-semibold text-brand-navy">{item.price}</p>
                                            <span className="badge-brand mt-2">Listed</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Property trust */}
                    <section>
                        <div className="card overflow-hidden">
                            <div className="flex items-start gap-3 p-4">
                                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-control bg-chain-soft text-chain-strong"><Ico d={I.shield} /></span>
                                <div>
                                    <p className="font-serif text-title text-ink">Buying property? Check first.</p>
                                    <p className="mt-0.5 text-body text-ink-soft">See who owns it and whether the documents were approved, in seconds.</p>
                                </div>
                            </div>
                            <div className="flex gap-2 border-t border-line bg-surface-muted p-3">
                                <button onClick={() => onNavigate('ownershipCheck')} className="btn-primary flex-1">Check ownership</button>
                                <button onClick={() => onNavigate('myplaces')} className="btn-secondary flex-1">Browse places</button>
                            </div>
                        </div>
                        {premises.length > 0 && (
                            <div className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1">
                                {premises.slice(0, 6).map(p => (
                                    <button key={p.id} onClick={() => onNavigate('myplaces')} className="card-interactive flex w-56 flex-shrink-0 items-center gap-3 p-3 text-left">
                                        <img src={p.logoUrl} alt="" className="h-11 w-11 rounded-control object-cover" />
                                        <span className="min-w-0">
                                            <span className="block truncate text-body font-bold text-ink">{p.name}</span>
                                            <span className="block truncate text-caption text-ink-soft">{[p.town, p.county].filter(Boolean).join(', ') || p.type || 'Property'}</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Nearby */}
                    <section>
                        <div className="mb-3 flex items-end justify-between">
                            <h2 className="font-serif text-title text-ink">{searchTerm ? 'Results' : 'Skills near you'}</h2>
                            {searchTerm
                                ? <button onClick={() => setSearchTerm('')} className="text-caption font-bold text-brand-gold-dark">Clear</button>
                                : <button onClick={() => onNavigate('services')} className="text-caption font-bold text-brand-gold-dark">See all</button>}
                        </div>
                        {nearby.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {nearby.map(p => <ServiceCard key={p.id} provider={p} onClick={() => onSelectProvider(p)} />)}
                            </div>
                        ) : (
                            <div className="card py-10 text-center text-body text-ink-soft">Nothing found for "{searchTerm}".</div>
                        )}
                    </section>
                </div>
            </div>

            {/* ===== TAB BAR ===== */}
            <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-night-line bg-night/90 backdrop-blur-xl">
                <div className="relative grid grid-cols-5 items-end px-2 pt-2 pb-2">
                    {tabs.slice(0, 2).map(t => <TabButton key={t.label} {...t} />)}
                    <div className="flex justify-center">
                        <button onClick={() => onNavigate('registerAsset')} aria-label="Tokenize an asset" className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-glow text-night shadow-float ring-4 ring-night transition-transform active:scale-95">
                            <Ico d={I.plus} className="h-7 w-7" />
                        </button>
                    </div>
                    {tabs.slice(2).map(t => <TabButton key={t.label} {...t} />)}
                </div>
            </nav>
        </div>
    );
};

const TabButton: React.FC<{ label: string; icon: string | string[]; onClick: () => void; active?: boolean }> = ({ label, icon, onClick, active }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-semibold ${active ? 'text-glow' : 'text-white/55 hover:text-white'}`}>
        <Ico d={icon} className="h-6 w-6" />
        {label}
    </button>
);

export default Home;
