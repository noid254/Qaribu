
import React, { useState } from 'react';
import type { ServiceProvider } from '../types';

interface ReviewModalProps {
    pendingProviders: ServiceProvider[];
    isForced: boolean;
    onRate: (providerId: string, rating: number, comment: string) => void;
    onClose: () => void;
}

const StarInput: React.FC<{ rating: number; setRating: (r: number) => void }> = ({ rating, setRating }) => {
    return (
        <div className="flex gap-2 justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

const ReviewModal: React.FC<ReviewModalProps> = ({ pendingProviders, isForced, onRate, onClose }) => {
    // We handle one provider at a time from the list
    const currentProvider = pendingProviders[0];
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!currentProvider) return null;

    const handleSubmit = () => {
        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }
        onRate(currentProvider.id, rating, comment);
        // Reset local state for next provider
        setRating(0);
        setComment('');
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform transition-all">
                {/* Header */}
                <div className="bg-brand-navy p-6 text-white text-center relative">
                    {!isForced && (
                        <button 
                            onClick={onClose} 
                            className="absolute top-4 right-4 text-white/70 hover:text-white text-sm font-semibold"
                        >
                            Postpone
                        </button>
                    )}
                    <h2 className="text-xl font-bold font-serif">
                        {isForced ? "Rating Required" : "How was your experience?"}
                    </h2>
                    {isForced && (
                        <p className="text-xs text-brand-gold mt-2 font-medium bg-white/10 py-1 px-3 rounded-full inline-block">
                            {pendingProviders.length} pending review{pendingProviders.length > 1 ? 's' : ''} to continue
                        </p>
                    )}
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                        <img 
                            src={currentProvider.avatarUrl} 
                            alt={currentProvider.name} 
                            className="w-20 h-20 rounded-full border-4 border-gray-100 shadow-md object-cover mb-3"
                        />
                        <h3 className="font-bold text-gray-800 text-lg">{currentProvider.name}</h3>
                        <p className="text-sm text-gray-500">{currentProvider.service}</p>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">Tap to rate</p>
                        <StarInput rating={rating} setRating={setRating} />
                        
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write a brief review (optional)..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold mb-4 resize-none"
                            rows={3}
                        />

                        <button 
                            onClick={handleSubmit}
                            disabled={rating === 0}
                            className="w-full bg-brand-navy text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            Submit Review
                        </button>
                        
                        {isForced && pendingProviders.length > 1 && (
                            <p className="text-xs text-gray-400 mt-4">
                                You must review all pending providers to access new contacts.
                            </p>
                        )}
                        {!isForced && (
                            <button onClick={onClose} className="mt-3 text-xs text-gray-500 font-semibold hover:text-gray-800 underline">
                                Ask me later
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
