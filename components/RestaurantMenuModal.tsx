
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { ServiceProvider, MenuItem, MenuBundle, RestaurantEvent } from '../types';

interface RestaurantMenuModalProps {
    provider: ServiceProvider;
    onClose: () => void;
    isOwner?: boolean;
    onUpdateProvider?: (updatedProvider: ServiceProvider) => void;
}

interface CartItem {
    item: MenuItem | MenuBundle;
    quantity: number;
    isBundle: boolean;
    relatedItems?: MenuItem[]; // Upsells for regular items
}

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const MinusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

// --- UI Components ---

const StoryRing: React.FC<{ label: string, isActive: boolean, image: string, onClick: () => void }> = ({ label, isActive, image, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 flex-shrink-0 active:scale-95 transition-transform">
        <div className={`w-[70px] h-[70px] rounded-full p-[3px] transition-all duration-300 ${isActive ? 'bg-gradient-to-tr from-brand-gold via-red-500 to-purple-600 shadow-md scale-105' : 'bg-gray-200'}`}>
            <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden">
                 <img src={image} alt={label} className="w-full h-full object-cover" />
            </div>
        </div>
        <span className={`text-[11px] tracking-wide ${isActive ? 'text-brand-navy font-bold' : 'text-gray-500 font-medium'}`}>{label}</span>
    </button>
);

const EventBanner: React.FC<{ event: RestaurantEvent, onReserve: (e: RestaurantEvent) => void, isOwner?: boolean, onDelete?: (id: string) => void }> = ({ event, onReserve, isOwner, onDelete }) => (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden relative group flex-shrink-0 border border-gray-100 transform transition hover:-translate-y-1">
        <div className="relative h-56">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            {/* Badge */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-brand-navy text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {event.totalSeats - event.bookedSeats} Seats Left
            </div>

            {/* Owner Controls */}
            {isOwner && onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(event.id); }} className="absolute top-4 right-4 bg-white/90 text-red-600 p-2 rounded-full shadow-md hover:bg-white transition">
                    <TrashIcon />
                </button>
            )}

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex justify-between items-end gap-3">
                    <div className="flex-1">
                         <h3 className="text-2xl font-bold font-serif leading-none mb-2 shadow-black drop-shadow-md">{event.title}</h3>
                         <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium opacity-90">
                            <div className="flex items-center gap-1"><ClockIcon /> {event.startTime} - {event.endTime}</div>
                            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                            <div>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</div>
                         </div>
                    </div>
                    <button onClick={() => onReserve(event)} className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 flex-shrink-0">
                        <WhatsAppIcon />
                        <span>Reserve</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const InfiniteSlider: React.FC<{ items: MenuItem[], onSelect: (item: MenuItem) => void }> = ({ items, onSelect }) => {
    const duplicatedItems = items.length > 0 ? [...items, ...items, ...items, ...items] : []; 
    if (duplicatedItems.length === 0) return null;

    return (
        <div className="overflow-hidden relative w-full h-40 mt-6 group">
            <div className="flex absolute left-0 animate-scroll gap-4 w-max px-4 hover:[animation-play-state:paused]">
                {duplicatedItems.map((item, index) => (
                    <div 
                        key={`${item.id}-${index}`} 
                        onClick={() => onSelect(item)}
                        className="w-48 h-40 bg-white rounded-2xl shadow-md flex-shrink-0 overflow-hidden relative cursor-pointer group/card hover:shadow-lg transition-all"
                    >
                        <img src={item.images[0]} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                            <p className="text-brand-gold font-bold text-[10px] uppercase tracking-wider mb-0.5">Top Pick</p>
                            <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">{item.name}</h4>
                            <p className="text-white/90 text-xs font-medium mt-1">Ksh {item.price}</p>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
            `}</style>
        </div>
    );
};

const BundleCard: React.FC<{ bundle: MenuBundle, onAdd: () => void, onClick: () => void }> = ({ bundle, onAdd, onClick }) => (
    <div onClick={onClick} className="w-72 flex-shrink-0 bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50 relative group hover:shadow-lg transition-all cursor-pointer">
        <div className="h-44 relative overflow-hidden">
            <img src={bundle.imageUrl} alt={bundle.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
             <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-brand-navy text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <ClockIcon /> {bundle.availableTime}
            </div>
            <div className="absolute bottom-3 right-3 bg-brand-navy text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                -{Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)}% OFF
            </div>
        </div>
        <div className="p-4">
            <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900 text-lg font-serif leading-tight">{bundle.title}</h3>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{bundle.description}</p>
            
            <div className="flex flex-wrap gap-1.5 mb-4">
                {bundle.items.slice(0, 3).map((i, idx) => (
                    <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">{i}</span>
                ))}
                {bundle.items.length > 3 && <span className="text-[10px] text-gray-400 px-1 py-1">+{bundle.items.length - 3} more</span>}
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-100">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 line-through font-medium">Ksh {bundle.originalPrice}</span>
                    <span className="font-bold text-brand-navy text-lg leading-none">Ksh {bundle.price}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onAdd(); }} className="bg-brand-gold text-brand-navy w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-brand-navy hover:text-white transition-colors active:scale-90">
                    <PlusIcon />
                </button>
            </div>
        </div>
    </div>
);

const MenuItemCard: React.FC<{ item: MenuItem, onAdd: () => void, onClick: () => void }> = ({ item, onAdd, onClick }) => (
    <div onClick={onClick} className="flex gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-50 mb-3 hover:shadow-md transition-all cursor-pointer">
        <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
             <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
             {item.isVegetarian && <div className="absolute top-1 left-1 bg-green-500 w-2 h-2 rounded-full shadow-sm ring-1 ring-white" title="Vegetarian"></div>}
             {item.isSpicy && <div className="absolute top-1 left-1 bg-red-500 w-2 h-2 rounded-full shadow-sm ring-1 ring-white" title="Spicy"></div>}
        </div>
        <div className="flex flex-col flex-grow justify-between py-1">
            <div>
                <h4 className="font-bold text-gray-800 font-serif text-lg leading-tight mb-1">{item.name}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
            </div>
            <div className="flex justify-between items-end">
                <span className="font-bold text-brand-navy text-base">Ksh {item.price}</span>
                <button onClick={(e) => { e.stopPropagation(); onAdd(); }} className="text-xs font-bold text-brand-navy bg-brand-gold/20 border border-brand-gold/30 px-4 py-1.5 rounded-full uppercase hover:bg-brand-gold transition active:scale-95">
                    Add
                </button>
            </div>
        </div>
    </div>
);

// --- Event Management Modal ---
const AddEventModal: React.FC<{ onClose: () => void, onSave: (event: Omit<RestaurantEvent, 'id' | 'bookedSeats'>) => void }> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '', description: '', imageUrl: '', date: '', startTime: '', endTime: '', price: 0, totalSeats: 20
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.date || !formData.imageUrl) return;
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-brand-navy">Create New Event</h2>
                <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
                    <input placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" required />
                    <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" />
                    <input placeholder="Image URL" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" required />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" required />
                        <input type="number" placeholder="Price (Ksh)" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" required />
                        <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" required />
                    </div>
                     <input type="number" placeholder="Total Seats" value={formData.totalSeats || ''} onChange={e => setFormData({...formData, totalSeats: parseInt(e.target.value)})} className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" required />
                    
                    <button type="submit" className="w-full bg-brand-navy text-white font-bold py-3 rounded-xl mt-4 hover:bg-black transition">Publish Event</button>
                </form>
            </div>
        </div>
    )
}

// --- Food Detail Modal (PDP) ---
const FoodDetailModal: React.FC<{ 
    item: MenuItem | MenuBundle, 
    onClose: () => void, 
    onAdd: (qty: number) => void 
}> = ({ item, onClose, onAdd }) => {
    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const images = 'images' in item ? item.images : [item.imageUrl];
    const isBundle = !('images' in item);
    
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft = e.currentTarget.scrollLeft;
        const width = e.currentTarget.offsetWidth;
        const index = Math.round(scrollLeft / width);
        setCurrentImageIndex(index);
    };

    return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in">
            <div className="relative h-[55vh] bg-gray-900">
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between z-20">
                    <button onClick={onClose} className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition">
                        <CloseIcon />
                    </button>
                    <button className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition">
                        <ShareIcon />
                    </button>
                </div>
                <div 
                    className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
                    onScroll={handleScroll}
                >
                    {images.map((img, idx) => (
                        <img 
                            key={idx} 
                            src={img} 
                            alt={`${item.name || (item as MenuBundle).title} ${idx}`} 
                            className="w-full h-full object-cover snap-center flex-shrink-0" 
                        />
                    ))}
                </div>
                {images.length > 1 && (
                    <div className="absolute bottom-8 right-6 bg-black/50 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        {currentImageIndex + 1} / {images.length}
                    </div>
                )}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-transparent"></div>
            </div>
            <div className="flex-1 bg-white -mt-6 rounded-t-3xl relative z-10 flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                    <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="flex justify-between items-start gap-4 mb-2">
                        <h1 className="text-3xl font-bold font-serif text-gray-900 leading-tight">
                            {isBundle ? (item as MenuBundle).title : item.name}
                        </h1>
                        <div className="text-xl font-bold text-brand-navy whitespace-nowrap">
                            Ksh {item.price}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {isBundle ? (
                            <span className="bg-brand-gold/10 text-brand-gold text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">Bundle Deal</span>
                        ) : (
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">{(item as MenuItem).category}</span>
                        )}
                        {'isVegetarian' in item && item.isVegetarian && (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">Veg</span>
                        )}
                        {'isSpicy' in item && item.isSpicy && (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">Spicy</span>
                        )}
                    </div>
                    <div className="space-y-4">
                        <p className="text-gray-600 leading-relaxed">
                            {item.description}
                        </p>
                        {isBundle && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-800 text-sm mb-2">Includes:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {(item as MenuBundle).items.map((i, idx) => (
                                        <li key={idx}>{i}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 bg-white pb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-100 rounded-xl p-1">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition shadow-sm"
                            >
                                <MinusIcon />
                            </button>
                            <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition shadow-sm"
                            >
                                <PlusIcon />
                            </button>
                        </div>
                        <button 
                            onClick={() => onAdd(quantity)}
                            className="flex-1 bg-brand-navy text-white font-bold text-lg py-3.5 px-4 rounded-xl shadow-lg hover:bg-gray-800 transition active:scale-95 flex justify-between items-center"
                        >
                            <span>Add to Order</span>
                            <span>Ksh {(item.price * quantity).toLocaleString()}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RestaurantMenuModal: React.FC<RestaurantMenuModalProps> = ({ provider, onClose, isOwner = false, onUpdateProvider }) => {
    const menu = provider.menu || [];
    const bundles = provider.bundles || [];
    const events = provider.events || [];
    
    const [activeCategory, setActiveCategory] = useState('Bundles');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [selectedFoodItem, setSelectedFoodItem] = useState<MenuItem | MenuBundle | null>(null);
    
    const categories = useMemo(() => ['Bundles', ...Array.from(new Set(menu.map(i => i.category)))], [menu]);

    const getCategoryIcon = (cat: string) => {
        if (cat === 'Bundles') return bundles[0]?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200';
        const item = menu.find(i => i.category === cat);
        return item?.images[0] || 'https://via.placeholder.com/150';
    };

    const handleScrollToCategory = (cat: string) => {
        setActiveCategory(cat);
        const element = document.getElementById(`section-${cat}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const addToCart = (item: MenuItem | MenuBundle, isBundle: boolean, qty: number = 1) => {
        setCart(prev => {
            const existing = prev.findIndex(c => c.item.id === item.id && c.isBundle === isBundle);
            if (existing > -1) {
                const newCart = [...prev];
                newCart[existing].quantity += qty;
                return newCart;
            }
            return [...prev, { item, quantity: qty, isBundle }];
        });
        setSelectedFoodItem(null);
    };
    
    const removeFromCart = (index: number) => {
         setCart(prev => {
            const newCart = [...prev];
            if (newCart[index].quantity > 1) {
                newCart[index].quantity -= 1;
            } else {
                newCart.splice(index, 1);
            }
            if (newCart.length === 0) setShowCart(false);
            return newCart;
        });
    };
    
    const handleCreateEvent = (eventData: Omit<RestaurantEvent, 'id' | 'bookedSeats'>) => {
        if (!onUpdateProvider) return;
        const newEvent: RestaurantEvent = {
            ...eventData,
            id: `evt_${Date.now()}`,
            bookedSeats: 0,
        };
        const updatedEvents = [...events, newEvent];
        onUpdateProvider({ ...provider, events: updatedEvents });
        setShowAddEvent(false);
    };

    const handleDeleteEvent = (id: string) => {
        if (!onUpdateProvider || !confirm("Delete this event?")) return;
        const updatedEvents = events.filter(e => e.id !== id);
        onUpdateProvider({ ...provider, events: updatedEvents });
    };

    const handleReserveSeat = (event: RestaurantEvent) => {
        const message = `Hi ${provider.name}, I'd like to reserve a seat for the event: *${event.title}* on ${new Date(event.date).toLocaleDateString()} at ${event.startTime}. Please confirm availability.`;
        const url = `https://wa.me/${provider.phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleCheckout = () => {
        const customerName = prompt("Enter your name:") || "Customer";
        const location = prompt("Enter your location/address:") || "Unknown Location";
        const phone = prompt("Enter your phone number:") || "0000000000";

        const orderItems = cart.map(c => ({
            name: 'title' in c.item ? c.item.title : c.item.name,
            qty: c.quantity,
            price: c.item.price * c.quantity
        }));

        const total = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

        const orderData = {
            customer: { name: customerName, phone, location },
            restaurantName: provider.name,
            items: orderItems,
            total: total,
            date: new Date().toISOString()
        };

        // Encode for URL
        const encodedData = btoa(JSON.stringify(orderData));
        const manageLink = `${window.location.origin}/?page=manage_order&data=${encodedData}`;

        const cartSummary = cart.map(c => 
            `- ${c.quantity}x ${'title' in c.item ? c.item.title : c.item.name} (Ksh ${c.item.price * c.quantity})`
        ).join('\n');

        const message = `Hi, I'd like to place an order:\n\n*New Order from ${customerName}*\n\n${cartSummary}\n\n*Total: Ksh ${total.toLocaleString()}*\n\nMy Location: ${location}\nMy Phone: ${phone}\n\nManager Dispatch Link: ${manageLink}`;

        const whatsappUrl = `https://wa.me/${provider.phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        onClose();
    };

    const cartTotal = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans animate-fade-in">
            {showAddEvent && <AddEventModal onClose={() => setShowAddEvent(false)} onSave={handleCreateEvent} />}
            
            {selectedFoodItem && (
                <FoodDetailModal 
                    item={selectedFoodItem} 
                    onClose={() => setSelectedFoodItem(null)} 
                    onAdd={(qty) => addToCart(selectedFoodItem, !('images' in selectedFoodItem), qty)} 
                />
            )}
            
            <div className="bg-white/80 backdrop-blur-md shadow-sm z-20 relative sticky top-0">
                <div className="flex justify-between items-center p-4">
                    <button onClick={onClose} className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition"><BackIcon /></button>
                    <div className="text-center">
                        <h2 className="font-bold text-lg font-serif text-brand-navy">{provider.name}</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Menu & Reservations</p>
                    </div>
                    {isOwner ? (
                        <button onClick={() => setShowAddEvent(true)} className="bg-brand-navy text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 hover:bg-black transition">
                            <PlusIcon /> Event
                        </button>
                    ) : (
                        <div className="w-8"></div> 
                    )}
                </div>
                
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-4 pt-2 snap-x">
                    {categories.map(cat => (
                        <StoryRing 
                            key={cat} 
                            label={cat} 
                            isActive={activeCategory === cat} 
                            image={getCategoryIcon(cat)}
                            onClick={() => handleScrollToCategory(cat)}
                        />
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-32 scroll-smooth no-scrollbar bg-gray-50">
                <InfiniteSlider items={menu.slice(0, 5)} onSelect={(i) => setSelectedFoodItem(i)} />

                {events.length > 0 && (
                     <div className="mt-8 px-4 space-y-5">
                        <div className="flex items-center gap-2">
                             <h3 className="text-xl font-bold font-serif text-gray-900">Upcoming Events</h3>
                             <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                        </div>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x pb-2">
                            {events.map(event => (
                                <EventBanner 
                                    key={event.id} 
                                    event={event} 
                                    onReserve={handleReserveSeat} 
                                    isOwner={isOwner}
                                    onDelete={handleDeleteEvent}
                                />
                            ))}
                        </div>
                     </div>
                )}

                {bundles.length > 0 && (
                    <div id="section-Bundles" className="mt-8 pl-4">
                        <div className="flex items-baseline gap-2 mb-4 pr-4 justify-between">
                            <div>
                                <h3 className="text-xl font-bold font-serif text-gray-900">Chef's Bundles</h3>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Best value meals, curated for you.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pr-4 snap-x">
                            {bundles.map(bundle => (
                                <div key={bundle.id} className="snap-center">
                                    <BundleCard 
                                        bundle={bundle} 
                                        onClick={() => setSelectedFoodItem(bundle)}
                                        onAdd={() => addToCart(bundle, true)} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="px-4 mt-4">
                    {categories.filter(c => c !== 'Bundles').map(cat => (
                        <div key={cat} id={`section-${cat}`} className="mt-8 scroll-mt-44">
                            <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm py-3 z-10 mb-2 flex items-center gap-3">
                                <h3 className="text-2xl font-bold font-serif text-gray-900">{cat}</h3>
                                <div className="h-px bg-gray-200 flex-grow"></div>
                            </div>
                            <div className="grid gap-1">
                                {menu.filter(m => m.category === cat).map(item => (
                                    <MenuItemCard 
                                        key={item.id} 
                                        item={item} 
                                        onClick={() => setSelectedFoodItem(item)}
                                        onAdd={() => addToCart(item, false)} 
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

             {cart.length > 0 && (
                <div className="absolute bottom-6 left-4 right-4 z-40 animate-slide-in-up">
                    <div className={`bg-brand-navy text-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${showCart ? 'max-h-[500px]' : 'max-h-20'}`}>
                        <div 
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-black/20 transition"
                            onClick={() => setShowCart(!showCart)}
                        >
                             <div className="flex items-center gap-4">
                                <div className="bg-brand-gold text-brand-navy w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                                    {cart.reduce((s, i) => s + i.quantity, 0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-brand-gold uppercase tracking-wide">Current Order</span>
                                    <span className="text-xl font-bold">Ksh {cartTotal.toLocaleString()}</span>
                                </div>
                            </div>
                            <button 
                                className="bg-[#25D366] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg hover:bg-[#128C7E] active:scale-95 transition-transform flex items-center gap-2" 
                                onClick={(e) => { e.stopPropagation(); handleCheckout(); }}
                            >
                                <WhatsAppIcon /> Checkout
                            </button>
                        </div>

                        {showCart && (
                            <div className="px-4 pb-4 pt-2 bg-white/5 max-h-64 overflow-y-auto no-scrollbar border-t border-white/10">
                                {cart.map((cartItem, idx) => {
                                    const isBundle = cartItem.isBundle;
                                    const item = cartItem.item;
                                    return (
                                        <div key={`${item.id}-${idx}`} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                                            <div className="flex-1 pr-4">
                                                <p className="font-bold text-sm text-white">
                                                    {isBundle ? `[Bundle] ${(item as MenuBundle).title}` : (item as MenuItem).name}
                                                </p>
                                                <p className="text-xs text-gray-300">Ksh {item.price}</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-black/30 rounded-lg p-1">
                                                <button onClick={() => removeFromCart(idx)} className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 rounded transition"><MinusIcon /></button>
                                                <span className="text-sm font-bold w-4 text-center">{cartItem.quantity}</span>
                                                <button onClick={() => addToCart(item, isBundle)} className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/20 rounded transition"><PlusIcon /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantMenuModal;
