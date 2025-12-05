import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-dark mb-4"></div>
            <p className="text-gray-600 font-semibold">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
