
import React, { useState } from 'react';
import type { ServiceProvider, OrderData } from '../types';

interface ManageOrderViewProps {
    orderData: OrderData;
    nearbyRiders: ServiceProvider[];
    onBack: () => void;
}

const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99 0-3.903-.52-5.586-1.456l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.474 1.039-1.04 3.833 3.855-1.017z" /></svg>;
const RiderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

const ManageOrderView: React.FC<ManageOrderViewProps> = ({ orderData, nearbyRiders, onBack }) => {
    const [status, setStatus] = useState<'Pending' | 'Dispatched'>('Pending');

    const handleDispatch = (rider: ServiceProvider) => {
        const message = `Hello ${rider.name}, I have a delivery request.\n\nPickup: ${orderData.restaurantName}\nDropoff: ${orderData.customer.location} (${orderData.customer.name}, ${orderData.customer.phone})\nOrder Value: Ksh ${orderData.total}\n\nPlease confirm if you can take this.`;
        const url = `https://wa.me/${rider.phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        setStatus('Dispatched');
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center">
                <button onClick={onBack} className="text-gray-600 font-semibold text-sm">Back to Dashboard</button>
                <h1 className="font-bold text-lg text-gray-800">Manage Order</h1>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {status}
                </div>
            </header>

            <div className="p-4 space-y-6 max-w-lg mx-auto">
                {/* Customer Card */}
                <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-brand-navy">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Customer</p>
                            <h2 className="text-2xl font-bold text-gray-900">{orderData.customer.name}</h2>
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <MapPinIcon />
                                <span className="text-sm font-medium">{orderData.customer.location}</span>
                            </div>
                        </div>
                        <a href={`tel:${orderData.customer.phone}`} className="bg-gray-100 hover:bg-gray-200 p-3 rounded-full text-brand-navy transition">
                            <PhoneIcon />
                        </a>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-sm p-5">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-3 border-b pb-2">Order Details • {new Date(orderData.date).toLocaleTimeString()}</p>
                    <div className="space-y-3 mb-4">
                        {orderData.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="bg-gray-100 text-gray-600 font-bold text-xs w-6 h-6 flex items-center justify-center rounded">{item.qty}x</span>
                                    <span className="text-gray-800 font-medium text-sm">{item.name}</span>
                                </div>
                                <span className="text-gray-600 text-sm">Ksh {item.price.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                        <span className="font-bold text-gray-600">Total Amount</span>
                        <span className="font-bold text-xl text-brand-navy">Ksh {orderData.total.toLocaleString()}</span>
                    </div>
                </div>

                {/* Dispatch Section */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <RiderIcon /> Select Delivery Rider
                    </h3>
                    {nearbyRiders.length > 0 ? (
                        <div className="space-y-3">
                            {nearbyRiders.map(rider => (
                                <div key={rider.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={rider.avatarUrl} alt={rider.name} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{rider.name}</p>
                                            <p className="text-xs text-gray-500">{rider.distanceKm}km away • ⭐ {rider.rating}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDispatch(rider)}
                                        className="bg-green-50 text-green-700 hover:bg-green-600 hover:text-white border border-green-200 font-bold text-xs px-3 py-2 rounded-lg transition flex items-center gap-1"
                                    >
                                        <WhatsAppIcon /> Dispatch
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-6 text-center border border-dashed">
                            <p className="text-gray-500 text-sm">No registered riders found nearby.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageOrderView;
