import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import type { BusinessAssets as BusinessAssetsType, ServiceProvider } from '../types';
import LoadingSpinner from './LoadingSpinner';

// --- Helper Functions ---
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const imageUrlToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image at ${url}: ${response.statusText}`);
        }
        const blob = await response.blob();
        return blobToBase64(blob);
    } catch (error) {
        console.error(`Error converting URL to base64: ${url}`, error);
        throw new Error(`Could not load image from URL. Please check the link or try another image.`);
    }
};


interface MerchTemplate {
    id: string;
    name: string;
    price: number;
    imageUrl: string; // This is the base template image (e.g., blank mug)
}

const MERCH_TEMPLATES: MerchTemplate[] = [
    { id: 'tshirt-white', name: 'T-Shirt', price: 1200, imageUrl: 'https://i.imgur.com/27b1H2g.png' },
    { id: 'mug-white', name: 'Coffee Mug', price: 800, imageUrl: 'https://i.imgur.com/kFLT3P5.png' },
    { id: 'cap-black', name: 'Baseball Cap', price: 1000, imageUrl: 'https://i.imgur.com/p1v7Lqj.png' },
    { id: 'hoodie-gray', name: 'Hoodie', price: 2500, imageUrl: 'https://i.imgur.com/79z9S9E.png' },
];

type CartItem = {
    item: MerchTemplate;
    quantity: number;
    generatedImageUrl: string;
}

// --- MODALS ---

const CustomizationModal: React.FC<{
    item: MerchTemplate;
    assets: BusinessAssetsType;
    onClose: () => void;
    onAddToCart: (item: MerchTemplate, generatedImageUrl: string) => void;
    onAddToCatalogue: (itemData: { name: string; price: number; generatedImageUrl: string; }) => void;
}> = ({ item, assets, onClose, onAddToCart, onAddToCatalogue }) => {
    const [prompt, setPrompt] = useState('');
    const [qrUrl, setQrUrl] = useState('');
    const [userImage, setUserImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const userImageInputRef = useRef<HTMLInputElement>(null);

    const handleUserImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setUserImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleRegenerate = async () => {
        setIsLoading(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let parts: any[] = [
                { text: `Task: Create a professional design for a piece of merchandise.
                - Base Merchandise: A ${item.name}. Use the provided blank merchandise image as the canvas.
                - Branding: Use the provided company logo.
                - User's Design Prompt: "${prompt || 'Place the logo tastefully on the merchandise.'}"
                - Additional Elements: If a user-uploaded image is provided, incorporate it into the design. If a QR code URL is provided, generate the QR code and place it on the merchandise appropriately.
                - Output: Return only the final merchandise image with the complete design applied.` },
                { inlineData: { mimeType: 'image/png', data: await imageUrlToBase64(item.imageUrl) } }
            ];

            if (assets.logo) {
                // FIX: Check if logo is a data URL or a regular URL
                if (assets.logo.startsWith('data:image')) {
                    // It's a data URL from a local upload
                    parts.push({ inlineData: { mimeType: 'image/png', data: assets.logo.split(',')[1] } });
                } else {
                    // It's a regular URL from the user's profile, convert it
                    parts.push({ inlineData: { mimeType: 'image/png', data: await imageUrlToBase64(assets.logo) } });
                }
            }
            if (userImage) {
                 // userImage comes from FileReader, it's a data URL
                 parts.push({ inlineData: { mimeType: 'image/png', data: userImage.split(',')[1] } });
            }
            if (qrUrl) {
                const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`;
                parts.push({ inlineData: { mimeType: 'image/png', data: await imageUrlToBase64(qrCodeImageUrl) } });
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: parts },
                config: { responseModalities: [Modality.IMAGE] },
            });
            
            const generatedPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            if (generatedPart?.inlineData) {
                setGeneratedImage(`data:${generatedPart.inlineData.mimeType};base64,${generatedPart.inlineData.data}`);
            } else {
                 setError('Could not generate image. Try adjusting your prompt.');
            }

        } catch (err: any) {
            console.error("AI generation failed:", err);
            if (err.message && err.message.includes('Unable to process input image')) {
                 setError('AI failed to process an input image. Please ensure your logo is a valid image file and try again.');
            } else {
                 setError('An error occurred during image generation. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const currentImageUrl = generatedImage || item.imageUrl;

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-lg h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Customize {item.name}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 font-bold text-2xl">&times;</button>
                </header>

                <main className="flex-1 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
                    {/* Preview */}
                    <div className="w-full md:w-1/2 bg-white rounded-lg shadow-inner border flex items-center justify-center p-4 relative">
                        {isLoading ? <LoadingSpinner message="Generating..." /> : <img src={currentImageUrl} alt="Merchandise Preview" className="max-w-full max-h-full object-contain"/>}
                    </div>

                    {/* Controls */}
                    <div className="w-full md:w-1/2 flex flex-col gap-4 overflow-y-auto pr-2">
                        <div>
                            <label className="text-sm font-semibold text-slate-600">AI Prompt</label>
                            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} placeholder="e.g., a vintage, retro look with the logo on the left chest" className="mt-1 w-full p-2 border rounded-md"/>
                        </div>
                         <div>
                            <label className="text-sm font-semibold text-slate-600">QR Code (from URL)</label>
                            <input type="url" value={qrUrl} onChange={e => setQrUrl(e.target.value)} placeholder="https://example.com" className="mt-1 w-full p-2 border rounded-md"/>
                        </div>
                        <div>
                             <label className="text-sm font-semibold text-slate-600">Upload Image</label>
                             <div className="mt-1 flex items-center gap-2">
                                <button onClick={() => userImageInputRef.current?.click()} className="flex-1 bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-md text-sm">Choose File</button>
                                {userImage && <img src={userImage} alt="user upload" className="w-10 h-10 object-cover rounded"/>}
                             </div>
                             <input type="file" ref={userImageInputRef} onChange={handleUserImageUpload} accept="image/*" className="hidden"/>
                        </div>
                        <button onClick={handleRegenerate} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-slate-400 flex items-center justify-center gap-2">
                            {isLoading ? 'Generating...' : 'Regenerate Design'}
                        </button>
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                    </div>
                </main>
                
                <footer className="p-4 border-t border-slate-200 bg-white/50 flex flex-col sm:flex-row gap-2">
                    <button onClick={() => onAddToCatalogue({ name: item.name, price: item.price, generatedImageUrl: currentImageUrl })} className="flex-1 bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-lg">Add to Catalogue</button>
                    <button onClick={() => onAddToCart(item, currentImageUrl)} className="flex-1 bg-blue-900 text-white font-bold py-3 px-4 rounded-lg">Add to Cart</button>
                </footer>
            </div>
        </div>
    );
};


const AddToCatalogueModal: React.FC<{
    itemData: { name: string; price: number; generatedImageUrl: string; };
    brandName: string;
    onClose: () => void;
    onConfirm: (sellingPrice: number) => void;
}> = ({ itemData, brandName, onClose, onConfirm }) => {
    const [price, setPrice] = useState('');
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-2">Add to Your Catalogue</h2>
                <p className="text-sm text-gray-600 mb-4">Set a selling price for the "{brandName} {itemData.name}".</p>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Ksh</span>
                    <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder={`e.g., ${itemData.price + 300}`}
                        className="w-full p-2 pl-10 border rounded-md"
                        autoFocus
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">Base cost is Ksh {itemData.price}. You set the final price.</p>
                <div className="flex gap-2 mt-4">
                    <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded-lg">Cancel</button>
                    <button onClick={() => onConfirm(parseFloat(price))} disabled={!price || parseFloat(price) <= 0} className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg disabled:bg-gray-400">Confirm</button>
                </div>
            </div>
        </div>
    );
};


interface BrandKitViewProps {
    assets: BusinessAssetsType;
    currentUser: Partial<ServiceProvider> | null;
    onSave: (assets: BusinessAssetsType) => void;
    onOrder: (cart: { item: { name: string }; quantity: number }[]) => void;
    onAddToCatalogue: (itemData: { name: string; price: number; generatedImageUrl: string; }) => void;
}

const MerchCard: React.FC<{
    template: MerchTemplate;
    onClick: () => void;
}> = ({ template, onClick }) => (
    <div onClick={onClick} className="bg-white rounded-xl shadow-sm group cursor-pointer hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-slate-200 flex items-center justify-center p-4">
            <img src={template.imageUrl} alt={template.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"/>
        </div>
        <div className="p-3">
            <h3 className="font-bold text-slate-800">{template.name}</h3>
            <p className="text-sm font-semibold text-slate-600">from Ksh {template.price.toLocaleString()}</p>
        </div>
    </div>
);


const BrandKitView: React.FC<BrandKitViewProps> = ({ assets, currentUser, onSave, onOrder, onAddToCatalogue }) => {
    const [isSetupComplete, setIsSetupComplete] = useState(assets.name !== 'Your Company Name');
    const [name, setName] = useState(assets.name === 'Your Company Name' ? (currentUser?.name || '') : assets.name);
    const [address, setAddress] = useState(assets.address);
    const [logo, setLogo] = useState<string | null>(assets.logo);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [editingItem, setEditingItem] = useState<MerchTemplate | null>(null);
    const [itemToCatalogue, setItemToCatalogue] = useState<{ name: string; price: number; generatedImageUrl: string; } | null>(null);

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setLogo(reader.result as string);
          reader.readAsDataURL(file);
        }
    };

    const handleSaveSetup = () => {
        onSave({ name, address, logo });
        setIsSetupComplete(true);
    };
    
    const addToCart = (item: MerchTemplate, generatedImageUrl: string) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(ci => ci.item.id === item.id && ci.generatedImageUrl === generatedImageUrl);
            if (existingItem) {
                return prevCart.map(ci => ci.item.id === item.id && ci.generatedImageUrl === generatedImageUrl ? { ...ci, quantity: ci.quantity + 1 } : ci);
            }
            return [...prevCart, { item, quantity: 1, generatedImageUrl }];
        });
        setEditingItem(null);
        setShowCart(true);
    };
    
    const handlePlaceOrder = () => {
        onOrder(cart.map(c => ({ item: { name: c.item.name }, quantity: c.quantity })));
        setCart([]);
        setShowCart(false);
    }
    
    const handleConfirmAddToCatalogue = (sellingPrice: number) => {
        if (itemToCatalogue) {
            onAddToCatalogue({
                name: `${name} ${itemToCatalogue.name}`,
                price: sellingPrice,
                generatedImageUrl: itemToCatalogue.generatedImageUrl,
            });
        }
        setItemToCatalogue(null);
        setEditingItem(null);
    }

    if (!isSetupComplete) {
        return (
            <div className="p-4 bg-slate-50 min-h-full">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Set Up Your Brand Kit</h1>
                <p className="text-slate-600 mb-6">Provide your branding details to generate merchandise mockups.</p>
                <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo</label>
                       <div className="flex items-center gap-4">
                           <div className="w-24 h-24 border border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 overflow-hidden">
                                {logo ? <img src={logo} alt="logo" className="h-full w-full object-contain"/> : <span className="text-xs text-slate-500 text-center">Upload Logo</span>}
                           </div>
                           <button onClick={() => logoInputRef.current?.click()} className="bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-lg text-sm">Upload</button>
                           <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden"/>
                       </div>
                   </div>

                    <div>
                       <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">Company Name</label>
                       <input id="companyName" type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                   </div>
                   
                   <div>
                       <label htmlFor="companyAddress" className="block text-sm font-medium text-slate-700">Company Address</label>
                       <input id="companyAddress" type="text" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                   </div>

                   <button onClick={handleSaveSetup} className="w-full bg-blue-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-800 transition-colors">
                       Save & View Merch
                   </button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-100 min-h-full">
            {editingItem && <CustomizationModal item={editingItem} assets={{ name, address, logo }} onClose={() => setEditingItem(null)} onAddToCart={addToCart} onAddToCatalogue={setItemToCatalogue} />}
            {itemToCatalogue && <AddToCatalogueModal itemData={itemToCatalogue} brandName={name} onClose={() => setItemToCatalogue(null)} onConfirm={handleConfirmAddToCatalogue} />}

            <main className="p-4">
                <div className="grid grid-cols-2 gap-4">
                    {MERCH_TEMPLATES.map(template => (
                        <MerchCard key={template.id} template={template} onClick={() => setEditingItem(template)} />
                    ))}
                </div>
            </main>
            
            <button onClick={() => setShowCart(true)} className="fixed bottom-4 right-4 bg-blue-900 text-white rounded-full p-4 shadow-lg z-30 hover:bg-blue-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {cart.length > 0 && <span className="absolute -top-1 -right-1 block h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center border-2 border-blue-900">{cart.reduce((sum, i) => sum + i.quantity, 0)}</span>}
            </button>
            
            {showCart && (
                 <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={() => setShowCart(false)}>
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4">Your Order</h2>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                           {cart.map(({item, quantity, generatedImageUrl}, index) => (
                               <div key={`${item.id}-${index}`} className="flex justify-between items-center gap-2">
                                   <img src={generatedImageUrl} alt={item.name} className="w-12 h-12 rounded object-cover border"/>
                                   <div className="flex-1">
                                       <p className="font-semibold text-sm">{item.name}</p>
                                       <p className="text-xs text-slate-500">{quantity} x Ksh {item.price.toLocaleString()}</p>
                                   </div>
                                   <p className="font-bold text-sm">Ksh {(quantity * item.price).toLocaleString()}</p>
                               </div>
                           ))}
                           {cart.length === 0 && <p className="text-center text-slate-500 py-4">Your cart is empty.</p>}
                        </div>
                         <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                            <span>Total</span>
                            <span>Ksh {cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">This is a quote request. Our team will contact you to finalize the order and payment.</p>
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setShowCart(false)} className="flex-1 bg-slate-200 text-slate-800 font-bold py-2 rounded-lg">Close</button>
                            <button onClick={handlePlaceOrder} disabled={cart.length === 0} className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg disabled:bg-slate-400">Request Quote</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BrandKitView;