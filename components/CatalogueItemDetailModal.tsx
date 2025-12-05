import React from 'react';
import type { CatalogueItem, ServiceProvider } from '../types';

interface CatalogueItemDetailModalProps {
  item: CatalogueItem;
  onClose: () => void;
  provider: ServiceProvider | null;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onInitiateContact: (provider: ServiceProvider) => boolean;
}

const CallIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const CatalogueItemDetailModal: React.FC<CatalogueItemDetailModalProps> = ({ item, onClose, provider, isAuthenticated, onAuthClick, onInitiateContact }) => {
  const handleCall = () => {
    if (!provider) return;
    if (!isAuthenticated) {
        onAuthClick();
    } else {
        if (onInitiateContact(provider)) {
            window.location.href = `tel:${provider.phone}`;
        }
    }
  }

  const handleWhatsApp = () => {
    if (!provider || !provider.whatsapp) return;
    if (!isAuthenticated) {
        onAuthClick();
    } else {
        if (onInitiateContact(provider)) {
            window.open(`https://wa.me/${provider.whatsapp}`, '_blank');
        }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-end z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gray-50 rounded-t-3xl shadow-2xl w-full max-w-sm h-[95vh] flex flex-col animate-slide-in-up" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex-shrink-0 text-center relative cursor-grab" onTouchStart={onClose}>
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto"></div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
            <div className="snap-x snap-mandatory flex overflow-x-auto no-scrollbar">
                {item.imageUrls.map((url, index) => (
                    <div key={index} className="flex-shrink-0 w-full h-72 snap-center">
                        <img 
                            src={url || 'https://picsum.photos/seed/placeholder/800/600'} 
                            alt={`${item.title} image ${index + 1}`} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                ))}
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm font-bold text-brand-gold uppercase tracking-wider">{item.category}</p>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{item.title}</h1>
              <p className="text-3xl font-bold text-brand-navy">{item.price}</p>

              {item.serialNumber && (
                <p className="text-sm text-gray-500 font-mono">SN: {item.serialNumber}</p>
              )}

              <div className={`p-3 rounded-lg text-sm ${item.isVerified ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-yellow-50 border border-yellow-200 text-yellow-800'}`}>
                <p className="font-semibold">
                    {item.isVerified
                        ? "Seller has confirmed they have proof of purchase."
                        : "Unverified: Seller has not confirmed proof of purchase. Proceed with caution."
                    }
                </p>
              </div>
              
              {item.duration && (
                <div className="flex items-center gap-2 text-gray-600">
                    <ClockIcon />
                    <p className="text-sm font-semibold">{item.duration}</p>
                </div>
              )}
              
              {item.discountInfo && (
                <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg text-center">
                  <p className="font-bold text-green-800">{item.discountInfo}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                  <h2 className="text-md font-semibold text-gray-800 mb-2">Description</h2>
                  <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
              </div>

              {item.externalLink && (
                    <div className="pt-4">
                        <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className="block w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl text-center transition-colors hover:bg-green-700 active-scale">
                            Visit Course Page
                        </a>
                    </div>
                )}
            </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex items-center gap-3">
          {provider?.phone && (
              <button onClick={handleCall} className="flex-1 bg-gray-200 text-gray-800 font-bold py-4 px-4 rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 active-scale">
                  <CallIcon /> Call
              </button>
          )}
          {provider?.whatsapp && (
              <button onClick={handleWhatsApp} className="flex-1 bg-brand-navy text-white font-bold py-4 px-4 rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2 active-scale">
                  <WhatsAppIcon /> WhatsApp
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogueItemDetailModal;