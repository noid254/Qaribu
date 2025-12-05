
import React, { useState, useRef } from 'react';
import type { BusinessAssets } from '../types';

interface WorkshopSetupProps {
    onSetupComplete: (assets: BusinessAssets) => void;
    onBack: () => void; // Added for the main back button
}

const ProgressBar: React.FC<{ current: number, total: number }> = ({ current, total }) => {
    const progress = (current / total) * 100;
    return (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
                className="bg-brand-navy h-1.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};

const InputField: React.FC<{ label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, placeholder: string, required?: boolean, isTextarea?: boolean }> = ({ label, value, onChange, placeholder, required = false, isTextarea = false }) => (
    <div>
        <label className="font-semibold text-gray-700 mb-2 block">{label}</label>
        {isTextarea ? (
            <textarea value={value} onChange={onChange} placeholder={placeholder} required={required} rows={4} className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-gold focus:outline-none transition" />
        ) : (
            <input value={value} onChange={onChange} placeholder={placeholder} required={required} className="w-full p-3 border-2 border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-gold focus:outline-none transition" />
        )}
    </div>
);

const WorkshopSetup: React.FC<WorkshopSetupProps> = ({ onSetupComplete, onBack }) => {
    const [step, setStep] = useState(1);
    const [businessName, setBusinessName] = useState('');
    const [logo, setLogo] = useState<string | null>(null);
    const [address, setAddress] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setLogo(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleNext = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (step < 4) setStep(s => s + 1);
    };
    const handleBack = () => {
        if (step > 1) setStep(s => s - 1);
    };

    const handleSubmit = () => {
        if (!termsAccepted) {
            alert("You must accept the terms and conditions.");
            return;
        }
        const fullAddress = `${address}\n${contactInfo}\n\nPayment Details:\n${paymentDetails}`;
        onSetupComplete({ name: businessName, address: fullAddress, logo });
    };

    const totalSteps = 4;
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleNext} className="space-y-6">
                        <InputField label="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g., John's Electricals" required />
                        <div>
                            <label className="font-semibold text-gray-700 mb-2 block">Logo (Optional)</label>
                            <div onClick={() => logoInputRef.current?.click()} className="cursor-pointer w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                                {logo ? (
                                    <img src={logo} alt="logo" className="h-full w-full object-contain p-2"/>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <p className="mt-1 text-sm font-semibold">Click to upload logo</p>
                                    </div>
                                )}
                            </div>
                           <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden"/>
                        </div>
                        <button type="submit" className="w-full bg-brand-navy text-white font-bold py-4 rounded-xl shadow-lg mt-4">Next</button>
                    </form>
                );
            case 2:
                return (
                     <form onSubmit={handleNext} className="space-y-6">
                        <InputField label="Business Address" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g., 123 Main St, Nairobi" isTextarea required />
                        <InputField label="Contact Details (Phone/Email)" value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="e.g., 0712345678 / info@john.co.ke" required />
                        <div className="flex gap-3">
                            <button type="button" onClick={handleBack} className="flex-1 bg-gray-200 text-gray-800 font-bold py-4 rounded-xl">Back</button>
                            <button type="submit" className="flex-1 bg-brand-navy text-white font-bold py-4 rounded-xl shadow-lg">Next</button>
                        </div>
                    </form>
                );
            case 3:
                return (
                    <form onSubmit={handleNext} className="space-y-6">
                        <InputField label="How You Get Paid" value={paymentDetails} onChange={e => setPaymentDetails(e.target.value)} placeholder="e.g., M-Pesa Paybill: 123456, Acc: Your Name&#10;Bank: ABC Bank, Acc: 987654321" isTextarea required />
                         <div className="flex gap-3">
                            <button type="button" onClick={handleBack} className="flex-1 bg-gray-200 text-gray-800 font-bold py-4 rounded-xl">Back</button>
                            <button type="submit" className="flex-1 bg-brand-navy text-white font-bold py-4 rounded-xl shadow-lg">Review</button>
                        </div>
                    </form>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="space-y-4 text-sm">
                            <h3 className="font-bold text-gray-500 uppercase text-xs">Review Details</h3>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span>Business Name</span><span className="font-semibold text-right">{businessName}</span></div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span>Address</span><span className="font-semibold text-right whitespace-pre-line">{address}</span></div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span>Contact</span><span className="font-semibold text-right">{contactInfo}</span></div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"><span>Payment Info</span><span className="font-semibold text-right whitespace-pre-line">{paymentDetails}</span></div>
                        </div>
                         <div className="text-xs p-3 border rounded-lg h-24 overflow-y-auto bg-gray-50">
                           <p>By using this service, you agree to generate documents accurately and lawfully. The developers of this app are not responsible for any misuse or inaccuracies in the generated documents. All data is stored locally on your device.</p>
                        </div>
                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                            <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="h-5 w-5 rounded text-brand-navy focus:ring-brand-gold"/>
                            <span className="font-semibold text-sm">I agree to the terms and conditions</span>
                        </label>
                        <div className="flex gap-3">
                             <button type="button" onClick={handleBack} className="flex-1 bg-gray-200 text-gray-800 font-bold py-4 rounded-xl">Back</button>
                            <button onClick={handleSubmit} disabled={!termsAccepted} className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl disabled:bg-gray-400 shadow-lg">Complete Setup</button>
                        </div>
                    </div>
                );
            default: return null;
        }
    }

    const titles = ["Business Profile", "Contact Details", "Payment Information", "Review & Confirm"];

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
             <header className="p-4 bg-gray-50 sticky top-0 z-10">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold font-serif text-brand-navy">{titles[step - 1]}</h1>
                    <button onClick={onBack} className="text-sm font-semibold text-gray-600 bg-gray-200 px-3 py-1 rounded-lg">Exit Setup</button>
                </div>
                <ProgressBar current={step} total={totalSteps} />
            </header>
            
            <main className="p-4">
                <div key={step} className="bg-white p-6 rounded-2xl shadow-sm animate-fade-in">
                    {renderStepContent()}
                </div>
            </main>
        </div>
    );
};

export default WorkshopSetup;
