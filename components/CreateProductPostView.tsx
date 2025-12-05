import React, { useState, useRef } from 'react';
import type { CatalogueItem } from '../types';

interface CreateProductPostViewProps {
    onBack: () => void;
    onSave: (item: Omit<CatalogueItem, 'id' | 'providerId'>) => void;
}

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

const CreateProductPostView: React.FC<CreateProductPostViewProps> = ({ onBack, onSave }) => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [serialNumber, setSerialNumber] = useState('');
    const [hasReceipt, setHasReceipt] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const maxImages = 3;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;
        
        const filesToRead = Array.from(files).slice(0, maxImages - imagePreviews.length);
        filesToRead.forEach((file: File) => {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };
    
    const removeImage = (index: number) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !price || !description || imagePreviews.length === 0) {
            alert("Please fill all fields and upload at least one image.");
            return;
        }
        onSave({
            title,
            category: 'Product',
            price: `Ksh ${parseInt(price, 10).toLocaleString()}`,
            description,
            imageUrls: imagePreviews,
            serialNumber: serialNumber || undefined,
            isVerified: hasReceipt,
        });
    };
    
    const inputClass = "w-full p-3 border rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-brand-gold focus:outline-none transition";

    return (
        <div className="w-full max-w-sm mx-auto h-screen bg-gray-50 flex flex-col font-sans">
            <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600">
                    <BackIcon />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Post a New Product</h1>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Product Images (up to {maxImages})</label>
                    <div className="grid grid-cols-3 gap-2">
                        {imagePreviews.map((src, index) => (
                            <div key={index} className="relative aspect-square">
                                <img src={src} className="w-full h-full object-cover rounded-md" alt={`preview ${index}`}/>
                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-mono leading-none">&times;</button>
                            </div>
                        ))}
                        {imagePreviews.length < maxImages && (
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </button>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
                
                <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="Product Title" className={inputClass} required/>
                
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Ksh</span>
                    <input value={price} onChange={e => setPrice(e.target.value)} type="number" placeholder="Price" className={`${inputClass} pl-10`} required/>
                </div>
                
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Product Description" rows={5} className={inputClass} required/>

                <div className="p-3 bg-gray-100 rounded-lg">
                    <h3 className="font-semibold text-gray-800 text-sm mb-2">Item Verification</h3>
                    <input value={serialNumber} onChange={e => setSerialNumber(e.target.value)} type="text" placeholder="Serial Number / IMEI (Optional)" className={`${inputClass} bg-white`} />
                    <label className="flex items-center gap-3 mt-3 cursor-pointer">
                        <input type="checkbox" checked={hasReceipt} onChange={e => setHasReceipt(e.target.checked)} className="h-5 w-5 rounded text-brand-gold focus:ring-brand-gold" />
                        <span className="text-sm text-gray-700">I have the original receipt for this item.</span>
                    </label>
                </div>
            </form>
            
            <footer className="p-4 bg-white border-t">
                <button onClick={handleSubmit} className="w-full bg-brand-navy text-white font-bold py-4 px-4 rounded-xl hover:opacity-90 transition-colors shadow-lg active-scale">
                    Save Product
                </button>
            </footer>
        </div>
    );
};

export default CreateProductPostView;