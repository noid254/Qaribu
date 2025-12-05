import React, { useState, useRef, useMemo } from 'react';
import type { CatalogueItem, CatalogueCategory, ServiceProvider } from '../types';
import CatalogueItemDetailModal from './CatalogueItemDetailModal';

interface CatalogueViewProps {
    items: CatalogueItem[];
    onUpdateItems: (items: CatalogueItem[]) => void;
    currentUser: ServiceProvider | null;
    onUpdateUser: (user: ServiceProvider) => void;
    isAuthenticated: boolean;
    onAuthClick: () => void;
    onInitiateContact: (provider: ServiceProvider) => boolean;
    onBack: () => void;
}

// --- Icons ---
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>;

const CatalogueCard: React.FC<{item: CatalogueItem, onClick: () => void}> = ({ item, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer group">
        <img src={item.imageUrls[0] || 'https://picsum.photos/seed/placeholder/400/300'} alt={item.title} className="w-full h-32 object-cover" />
        <div className="p-3">
            <p className="text-xs font-bold text-brand-primary group-hover:underline">{item.category}</p>
            <h3 className="font-bold text-gray-800 mt-1 truncate">{item.title}</h3>
            <p className="text-sm font-semibold text-gray-600 mt-2">{item.price}</p>
        </div>
    </div>
);

const CatalogueFormModal: React.FC<{ onSave: (item: Omit<CatalogueItem, 'id' | 'providerId'>) => void, onCancel: () => void }> = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<CatalogueCategory>('Product');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [duration, setDuration] = useState('');
    const [discountInfo, setDiscountInfo] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const categories: CatalogueCategory[] = ['Product', 'Service', 'Professional Service', 'For Rent', 'For Sale'];
    const maxImages = ['For Rent', 'For Sale'].includes(category) ? 5 : 3;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;
        
        const filesToRead = Array.from(files).slice(0, maxImages - imagePreviews.length);
        // FIX: Explicitly type 'file' as File to resolve type inference issue where it was treated as 'unknown'.
        filesToRead.forEach((file: File) => {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };
    
    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (!title || !price || !description) {
            alert("Please fill title, price, and description.");
            return;
        }
        onSave({
            title, category, price, description,
            imageUrls: imagePreviews.length > 0 ? imagePreviews : [`https://picsum.photos/seed/${title.replace(/\s/g, '')}/400/300`],
            duration: category === 'Professional Service' ? duration : undefined,
            discountInfo: category === 'Professional Service' ? discountInfo : undefined,
            // FIX: Add missing 'isVerified' property, defaulting to false for new items.
            isVerified: false,
        });
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onCancel}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Add to Catalogue</h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="Item Title" className="w-full p-2 border rounded"/>
                    <select value={category} onChange={e => setCategory(e.target.value as CatalogueCategory)} className="w-full p-2 border rounded bg-white">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input value={price} onChange={e => setPrice(e.target.value)} type="text" placeholder="Price (e.g., Ksh 5,000)" className="w-full p-2 border rounded"/>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} className="w-full p-2 border rounded"/>
                    
                    {category === 'Professional Service' && (
                        <>
                            <input value={duration} onChange={e => setDuration(e.target.value)} type="text" placeholder="Duration (e.g., 7 hours total)" className="w-full p-2 border rounded"/>
                            <input value={discountInfo} onChange={e => setDiscountInfo(e.target.value)} type="text" placeholder="Discount Info (e.g., 30% off full course)" className="w-full p-2 border rounded"/>
                        </>
                    )}

                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Images (up to {maxImages})</label>
                        <div className="grid grid-cols-3 gap-2">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="relative aspect-square">
                                    <img src={src} className="w-full h-full object-cover rounded-md" alt={`preview ${index}`}/>
                                    <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-mono leading-none">&times;</button>
                                </div>
                            ))}
                            {imagePreviews.length < maxImages && (
                                <button onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </button>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                    </div>
                </div>
                <div className="flex gap-2 pt-4 mt-4 border-t">
                    <button onClick={onCancel} className="flex-1 bg-gray-200 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="flex-1 bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">Save Item</button>
                </div>
            </div>
        </div>
    );
};

const ShareCatalogueModal: React.FC<{ catalogueUrl: string; onClose: () => void }> = ({ catalogueUrl, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-center mb-4">Share Your Catalogue</h2>
            <div className="flex justify-center">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(catalogueUrl)}`} alt="Catalogue QR Code" className="w-48 h-48 rounded-lg"/>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">Scan this code to view and share your public catalogue page.</p>
            <button onClick={onClose} className="mt-4 w-full bg-brand-dark text-white font-bold py-2 rounded-lg">Done</button>
        </div>
    </div>
);

const CatalogueView: React.FC<CatalogueViewProps> = ({ items, onUpdateItems, currentUser, onUpdateUser, isAuthenticated, onAuthClick, onInitiateContact, onBack }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CatalogueItem | null>(null);
    const [activeFilter, setActiveFilter] = useState<CatalogueCategory | 'All'>('All');
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const catalogueUrl = `https://nikosoko.app/catalogue/${currentUser?.id}`;
    
    const handleSaveItem = (item: Omit<CatalogueItem, 'id' | 'providerId'>) => {
        // FIX: Ensure currentUser and id exist before creating an item. Convert Date.now() to a string for the ID.
        if (!currentUser?.id) return;
        const newItem: CatalogueItem = { id: Date.now().toString(), providerId: currentUser.id, ...item };
        onUpdateItems([...items, newItem]);
        setIsAdding(false);
    };

    const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && currentUser) {
            const reader = new FileReader();
            reader.onloadend = () => onUpdateUser({ ...currentUser, catalogueBannerUrl: reader.result as string });
            reader.readAsDataURL(file);
        }
    };
    
    const filteredItems = useMemo(() => {
        if (activeFilter === 'All') return items;
        return items.filter(item => item.category === activeFilter);
    }, [items, activeFilter]);
    
    const filterOptions: (CatalogueCategory | 'All')[] = ['All', 'Product', 'Service', 'Professional Service', 'For Rent', 'For Sale'];

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <style>{`.animate-fade-in { animation: fade-in 0.6s ease-in-out; } @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }`}</style>
            <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />

            {/* Banner Section */}
            <div className="relative w-full h-80 shadow-lg group">
                <img 
                    src={currentUser?.catalogueBannerUrl || 'https://picsum.photos/seed/defaultcatbanner/800/400'} 
                    alt="Catalogue Banner" 
                    className="absolute inset-0 w-full h-full object-cover animate-fade-in" 
                />
                <button 
                    onClick={() => bannerInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-semibold transition-opacity"
                >
                    Change Banner
                </button>
                <header className="absolute top-0 left-0 right-0 pt-4 px-4 flex justify-between items-center text-white z-10">
                    <button onClick={onBack} className="p-2 -ml-2"><BackIcon /></button>
                    <span className="font-bold tracking-widest text-sm">{currentUser?.accountType === 'organization' ? 'MY COURSES' : 'MY CATALOGUE'}</span>
                    {items.length > 0 && <button onClick={() => setIsShareModalOpen(true)} className="p-2 -mr-2"><ShareIcon /></button>}
                </header>
                <div className="relative h-full flex flex-col items-center justify-center text-center text-white p-4">
                    <h1 className="text-5xl font-bold font-serif">{currentUser?.accountType === 'organization' ? `${currentUser?.name}'s Courses` : `${currentUser?.name}'s Collection`}</h1>
                    <p className="mt-2 max-w-sm text-lg opacity-90">{currentUser?.service}</p>
                </div>
            </div>

            {/* Filtering Controls */}
            <div className="p-4 -mt-16 relative z-10">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    {filterOptions.map(filter => (
                        <button 
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`flex-shrink-0 px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-200 shadow-md ${activeFilter === filter ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Item Grid */}
            <main className="px-4 pb-24">
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredItems.map(item => <CatalogueCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7s0 4 8 4 8-4 8-4" /></svg>
                        <h3 className="mt-2 text-sm font-medium text-slate-900">Your catalogue is empty</h3>
                        <p className="mt-1 text-sm text-slate-500">Tap the '+' button to add your first item.</p>
                    </div>
                )}
            </main>

            {/* Modals & FAB */}
            {isShareModalOpen && <ShareCatalogueModal catalogueUrl={catalogueUrl} onClose={() => setIsShareModalOpen(false)} />}
            {selectedItem && <CatalogueItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} provider={currentUser} isAuthenticated={isAuthenticated} onAuthClick={onAuthClick} onInitiateContact={onInitiateContact} />}
            {isAdding && <CatalogueFormModal onSave={handleSaveItem} onCancel={() => setIsAdding(false)} />}
            
            <button onClick={() => setIsAdding(true)} className="fixed bottom-6 right-6 bg-brand-dark text-white rounded-full p-4 shadow-lg z-30 hover:bg-black transition-transform hover:scale-110 active:scale-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
        </div>
    );
};

export default CatalogueView;