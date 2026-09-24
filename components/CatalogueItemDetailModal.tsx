import React from 'react';
import type { CatalogueItem, ServiceProvider } from '../types';
import { CallIcon, WhatsAppIcon, ClockIcon } from './Icons';

interface CatalogueItemDetailModalProps {
  item: CatalogueItem;
  onClose: () => void;
  provider: ServiceProvider | null;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onInitiateContact: (provider: ServiceProvider) => boolean;
}

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
        className="bg-surface-muted rounded-t-sheet shadow-2xl w-full max-w-sm h-[95vh] flex flex-col animate-slide-in-up" 
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
              <p className="text-body font-bold text-brand-gold uppercase tracking-wider">{item.category}</p>
              <h1 className="text-3xl font-bold text-ink leading-tight">{item.title}</h1>
              <p className="text-3xl font-bold text-brand-navy">{item.price}</p>

              {item.serialNumber && (
                <p className="text-body text-ink-soft font-mono">SN: {item.serialNumber}</p>
              )}

              <div className={`p-3 rounded-Nonecontrol text-body ${item.isVerified ? 'bg-info-soft border border-info-soft text-info-strong' : 'bg-warning-soft border border-warning-soft text-warning-strong'}`}>
                <p className="font-semibold">
                    {item.isVerified
                        ? "Seller has confirmed they have proof of purchase."
                        : "Unverified: Seller has not confirmed proof of purchase. Proceed with caution."
                    }
                </p>
              </div>
              
              {item.duration && (
                <div className="flex items-center gap-2 text-ink-soft">
                    <ClockIcon />
                    <p className="text-body font-semibold">{item.duration}</p>
                </div>
              )}
              
              {item.discountInfo && (
                <div className="mt-4 p-3 bg-success-soft border border-success-soft rounded-Nonecontrol text-center">
                  <p className="font-bold text-success-strong">{item.discountInfo}</p>
                </div>
              )}

              <div className="pt-4 border-t border-line">
                  <h2 className="text-md font-semibold text-ink mb-2">Description</h2>
                  <p className="text-body text-ink leading-relaxed">{item.description}</p>
              </div>

              {item.externalLink && (
                    <div className="pt-4">
                        <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className="block w-full bg-success text-white font-bold py-3 px-4 rounded-Nonecontrol text-center transition-colors hover:bg-success-strong active-scale">
                            Visit Course Page
                        </a>
                    </div>
                )}
            </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-line shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex items-center gap-3">
          {provider?.phone && (
              <button onClick={handleCall} className="flex-1 bg-surface-sunken text-ink font-bold py-4 px-4 rounded-Nonecontrol hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 active-scale">
                  <CallIcon /> Call
              </button>
          )}
          {provider?.whatsapp && (
              <button onClick={handleWhatsApp} className="flex-1 bg-brand-navy text-white font-bold py-4 px-4 rounded-Nonecontrol hover:opacity-90 transition-colors flex items-center justify-center gap-2 active-scale">
                  <WhatsAppIcon /> WhatsApp
              </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogueItemDetailModal;