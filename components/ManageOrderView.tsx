
import React, { useState } from 'react';
import type { ServiceProvider, OrderData } from '../types';
import { WhatsAppIcon, PhoneIcon as SharedPhoneIcon } from './Icons';

interface ManageOrderViewProps {
    orderData: OrderData;
    nearbyRiders: ServiceProvider[];
    onBack: () => void;
}

const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>;
const PhoneIcon = () => <SharedPhoneIcon className="h-4 w-4" />;

const RiderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-ink-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

const ManageOrderView: React.FC<ManageOrderViewProps> = ({ orderData, nearbyRiders, onBack }) => {
    const [status, setStatus] = useState<'Pending' | 'Dispatched'>('Pending');

    const handleDispatch = (rider: ServiceProvider) => {
        const message = `Hello ${rider.name}, I have a delivery request.\n\nPickup: ${orderData.restaurantName}\nDropoff: ${orderData.customer.location} (${orderData.customer.name}, ${orderData.customer.phone})\nOrder Value: Ksh ${orderData.total}\n\nPlease confirm if you can take this.`;
        const url = `https://wa.me/${rider.phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        setStatus('Dispatched');
    };

    return (
        <div className="bg-surface-sunken min-h-screen font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center">
                <button onClick={onBack} className="text-ink-soft font-semibold text-body">Back to Dashboard</button>
                <h1 className="font-bold text-lg text-ink">Manage Order</h1>
                <div className={`px-3 py-1 rounded-full text-caption font-bold uppercase ${status === 'Pending' ? 'bg-warning-soft text-warning-strong' : 'bg-success-soft text-success-strong'}`}>
                    {status}
                </div>
            </header>

            <div className="p-4 space-y-6 max-w-lg mx-auto">
                {/* Customer Card */}
                <div className="bg-white rounded-Nonecard shadow-md p-5 border-l-4 border-brand-navy">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-caption text-ink-soft font-bold uppercase mb-1">Customer</p>
                            <h2 className="text-2xl font-bold text-ink">{orderData.customer.name}</h2>
                            <div className="flex items-center gap-2 mt-2 text-ink-soft">
                                <MapPinIcon />
                                <span className="text-body font-medium">{orderData.customer.location}</span>
                            </div>
                        </div>
                        <a href={`tel:${orderData.customer.phone}`} className="bg-surface-sunken hover:bg-surface-sunken p-3 rounded-full text-brand-navy transition">
                            <PhoneIcon />
                        </a>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-Nonecard shadow-sm p-5">
                    <p className="text-caption text-ink-soft font-bold uppercase mb-3 border-b pb-2">Order Details • {new Date(orderData.date).toLocaleTimeString()}</p>
                    <div className="space-y-3 mb-4">
                        {orderData.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="bg-surface-sunken text-ink-soft font-bold text-caption w-6 h-6 flex items-center justify-center rounded">{item.qty}x</span>
                                    <span className="text-ink font-medium text-body">{item.name}</span>
                                </div>
                                <span className="text-ink-soft text-body">Ksh {item.price.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                        <span className="font-bold text-ink-soft">Total Amount</span>
                        <span className="font-bold text-xl text-brand-navy">Ksh {orderData.total.toLocaleString()}</span>
                    </div>
                </div>

                {/* Dispatch Section */}
                <div>
                    <h3 className="font-bold text-ink mb-3 flex items-center gap-2">
                        <RiderIcon /> Select Delivery Rider
                    </h3>
                    {nearbyRiders.length > 0 ? (
                        <div className="space-y-3">
                            {nearbyRiders.map(rider => (
                                <div key={rider.id} className="bg-white rounded-Nonecard p-4 shadow-sm border border-line flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={rider.avatarUrl} alt={rider.name} className="w-12 h-12 rounded-full object-cover bg-surface-sunken" />
                                        <div>
                                            <p className="font-bold text-ink text-body">{rider.name}</p>
                                            <p className="text-caption text-ink-soft">{rider.distanceKm}km away • ⭐ {rider.rating}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDispatch(rider)}
                                        className="bg-success-soft text-success-strong hover:bg-success hover:text-white border border-success-soft font-bold text-caption px-3 py-2 rounded-Nonecontrol transition flex items-center gap-1"
                                    >
                                        <WhatsAppIcon /> Dispatch
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-Nonecontrol p-6 text-center border border-dashed">
                            <p className="text-ink-soft text-body">No registered riders found nearby.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageOrderView;
