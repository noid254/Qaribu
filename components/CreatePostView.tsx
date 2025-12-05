import React from 'react';
// FIX: Update import path for CurrentPage to avoid circular dependency
import type { CurrentPage } from '../types';

interface CreatePostViewProps {
    onNavigate: (page: CurrentPage) => void;
    onBack: () => void;
}

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ServiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ProductIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-brand-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;


const CreatePostView: React.FC<CreatePostViewProps> = ({ onNavigate, onBack }) => {
    return (
        <div className="w-full max-w-sm mx-auto h-screen bg-gray-50 flex flex-col font-sans">
             <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600">
                    <BackIcon />
                </button>
                <h1 className="text-xl font-bold text-gray-800">Create a New Post</h1>
            </header>

            <main className="flex-1 flex flex-col justify-center items-center p-6 space-y-6">
                <h2 className="text-2xl font-bold text-center text-brand-navy">What would you like to post?</h2>

                <div className="w-full space-y-5">
                    <button 
                        onClick={() => onNavigate('createProductPost')}
                        className="w-full bg-white p-6 rounded-2xl shadow-md border-2 border-transparent hover:border-brand-gold transition-all active-scale text-center"
                    >
                        <ProductIcon />
                        <h3 className="text-xl font-bold text-brand-navy">A Product</h3>
                        <p className="text-sm text-gray-600 mt-1">Sell a physical item in the marketplace.</p>
                    </button>

                     <button 
                        onClick={() => onNavigate('addService')}
                        className="w-full bg-white p-6 rounded-2xl shadow-md border-2 border-transparent hover:border-brand-gold transition-all active-scale text-center"
                    >
                        <ServiceIcon />
                        <h3 className="text-xl font-bold text-brand-navy">A Service</h3>
                        <p className="text-sm text-gray-600 mt-1">Offer your skills with a new service card.</p>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default CreatePostView;