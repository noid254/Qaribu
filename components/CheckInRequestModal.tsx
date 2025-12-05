
import React, { useState, useMemo } from 'react';
import type { Premise, ServiceProvider, QaRibuRequest } from '../types';

interface CheckInRequestModalProps {
    premise: Premise;
    tenants: ServiceProvider[];
    onClose: () => void;
    onSubmit: (data: Partial<QaRibuRequest>) => void;
    initialHost?: ServiceProvider | null;
}

type Step = 'type-selection' | 'commercial-select' | 'residence-input' | 'visitor-details';

const CheckInRequestModal: React.FC<CheckInRequestModalProps> = ({ premise, tenants, onClose, onSubmit, initialHost }) => {
    const [step, setStep] = useState<Step>(initialHost ? 'visitor-details' : 'type-selection');
    const [premiseType, setPremiseType] = useState<'Commercial' | 'Residence'>('Commercial');
    const [selectedTenant, setSelectedTenant] = useState<ServiceProvider | null>(initialHost || null);
    const [manualUnit, setManualUnit] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Visitor Details
    const [purpose, setPurpose] = useState('');
    const [vehicleReg, setVehicleReg] = useState('');

    const filteredTenants = useMemo(() => {
        if (!searchQuery) return tenants;
        return tenants.filter(t => 
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.service.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tenants, searchQuery]);

    const handleTenantSelect = (tenant: ServiceProvider) => {
        setSelectedTenant(tenant);
        setManualUnit('');
        setStep('visitor-details');
    };

    const handleManualUnitSubmit = () => {
        if (!manualUnit.trim()) {
            alert("Please enter a Unit or Door Number.");
            return;
        }
        setSelectedTenant(null);
        setStep('visitor-details');
    };

    const handleFinalSubmit = () => {
        const requestData: Partial<QaRibuRequest> = {
            premiseId: premise.id,
            premiseName: premise.name,
            tenantId: selectedTenant?.id || '',
            hostId: selectedTenant?.id || 'admin',
            hostName: selectedTenant ? selectedTenant.name : `Unit ${manualUnit}`,
            targetUnit: manualUnit,
            visitorName: 'Guest', // Typically filled by user profile in real app
            visitorPhone: 'Hidden', 
            visitorPurpose: purpose || 'Visit',
            vehicleReg: vehicleReg || undefined,
            requestType: selectedTenant ? 'Mediated' : 'Direct',
            status: 'Pending',
            premiseType: premiseType
        };

        onSubmit(requestData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
            <div 
                className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Check In Request</h2>
                        <p className="text-xs text-gray-500">{premise.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    
                    {step === 'type-selection' && (
                        <div className="space-y-4">
                            <h3 className="text-center font-semibold text-gray-700 mb-4">Where are you visiting?</h3>
                            <button 
                                onClick={() => { setPremiseType('Commercial'); setStep('commercial-select'); }}
                                className="w-full p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-brand-gold transition active:scale-95"
                            >
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-800">Commercial / Office</p>
                                    <p className="text-xs text-gray-500">Select a business from the directory</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => { setPremiseType('Residence'); setStep('residence-input'); }}
                                className="w-full p-4 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-brand-gold transition active:scale-95"
                            >
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-800">Residence</p>
                                    <p className="text-xs text-gray-500">Enter door/unit number manually</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {step === 'commercial-select' && (
                        <div className="space-y-4">
                            <button onClick={() => setStep('type-selection')} className="text-xs font-bold text-gray-500 mb-2">&larr; Back</button>
                            <div className="bg-white p-4 rounded-xl shadow-sm border">
                                <h3 className="font-semibold text-gray-700 mb-3">Select Host</h3>
                                <input 
                                    type="text" 
                                    placeholder="Search business..." 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-gold mb-3"
                                />
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {filteredTenants.map(tenant => (
                                        <button 
                                            key={tenant.id} 
                                            onClick={() => handleTenantSelect(tenant)}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition text-left border border-transparent hover:border-gray-200"
                                        >
                                            <img src={tenant.avatarUrl} alt={tenant.name} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{tenant.name}</p>
                                                <p className="text-xs text-gray-500">{tenant.service}</p>
                                            </div>
                                        </button>
                                    ))}
                                    {filteredTenants.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No tenants found.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'residence-input' && (
                        <div className="space-y-4">
                            <button onClick={() => setStep('type-selection')} className="text-xs font-bold text-gray-500 mb-2">&larr; Back</button>
                            <div className="bg-white p-4 rounded-xl shadow-sm border">
                                <h3 className="font-semibold text-gray-700 mb-3">Residence Details</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Unit / Door Number</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 4B or 102" 
                                            value={manualUnit}
                                            onChange={e => setManualUnit(e.target.value)}
                                            className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleManualUnitSubmit}
                                        className="w-full bg-brand-navy text-white font-bold py-3 rounded-lg mt-2 hover:opacity-90"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'visitor-details' && (
                        <div className="space-y-4">
                            <button onClick={() => setStep(premiseType === 'Commercial' ? 'commercial-select' : 'residence-input')} className="text-xs font-bold text-gray-500 mb-2">&larr; Back</button>
                            
                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4">
                                <p className="text-xs text-blue-800">
                                    Visiting: <span className="font-bold">{selectedTenant ? selectedTenant.name : `Unit ${manualUnit}`}</span>
                                </p>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Purpose of Visit</label>
                                    <select 
                                        value={purpose} 
                                        onChange={e => setPurpose(e.target.value)}
                                        className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                    >
                                        <option value="">Select Purpose</option>
                                        <option value="Meeting">Meeting / Official</option>
                                        <option value="Delivery">Delivery</option>
                                        <option value="Personal">Personal / Family</option>
                                        <option value="Maintenance">Maintenance / Works</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Vehicle Reg. (Optional)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. KDA 123X" 
                                        value={vehicleReg}
                                        onChange={e => setVehicleReg(e.target.value.toUpperCase())}
                                        className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                    />
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleFinalSubmit}
                                disabled={!purpose}
                                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Send Request
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckInRequestModal;
