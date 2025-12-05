import React, { useState } from 'react';
// FIX: Update import path for CurrentPage to avoid circular dependency
import type { CurrentPage } from '../types';

// Define a type for the action object
interface ToolAction {
    label: string;
    icon: React.ReactNode;
    page: CurrentPage;
}

interface MyToolkitProps {
    allTools: ToolAction[];
    selectedTools: CurrentPage[];
    onSave: (newSelection: CurrentPage[]) => void;
    onNavigate: (page: CurrentPage) => void;
    onBack: () => void;
}

const CheckIcon = () => (
    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

const MyToolkit: React.FC<MyToolkitProps> = ({ allTools, selectedTools, onSave, onNavigate, onBack }) => {
    const [currentSelection, setCurrentSelection] = useState<CurrentPage[]>(selectedTools);

    const handleToggle = (page: CurrentPage) => {
        setCurrentSelection(prev => {
            if (prev.includes(page)) {
                return prev.filter(p => p !== page);
            } else {
                if (prev.length < 6) {
                    return [...prev, page];
                }
                alert("You can only select up to 6 tools for your homepage.");
                return prev;
            }
        });
    };

    const handleSave = () => {
        if (currentSelection.length !== 6) {
            alert("Please select exactly 6 tools.");
            return;
        }
        onSave(currentSelection);
    };
    
    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-24">
            <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800">Customize My Toolkit</h1>
            </header>
            
            <main className="p-4">
                <p className="text-center text-gray-600 mb-4">Select your top 6 tools for quick access from the homepage.</p>
                
                <div className="grid grid-cols-2 gap-4">
                    {allTools.map(tool => {
                        const isSelected = currentSelection.includes(tool.page);
                        return (
                            <div key={tool.page} className="relative">
                                <button 
                                    onClick={() => onNavigate(tool.page)}
                                    className={`bg-white p-4 rounded-2xl shadow-sm text-center active-scale transition-all flex flex-col items-center justify-center aspect-square w-full border-2 ${isSelected ? 'border-brand-gold' : 'border-transparent'}`}
                                >
                                    {tool.icon}
                                    <span className="text-sm font-semibold text-gray-700 mt-2">{tool.label}</span>
                                </button>
                                <button 
                                    onClick={() => handleToggle(tool.page)}
                                    className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-brand-gold' : 'bg-gray-300'}`}
                                >
                                    {isSelected && <CheckIcon />}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
                 <button onClick={handleSave} className="w-full bg-brand-navy text-white font-bold py-4 px-4 rounded-2xl hover:opacity-90 transition-colors shadow-lg">
                    Save Changes ({currentSelection.length}/6)
                </button>
            </footer>
        </div>
    );
};

export default MyToolkit;