import React, { useState } from 'react';

interface CategoriesPageProps {
    categories: string[];
    onAddCategory: (name: string) => void;
    onDeleteCategory: (name: string) => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories, onAddCategory, onDeleteCategory }) => {
    const [newCategory, setNewCategory] = useState('');

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim() && !categories.find(c => c.toLowerCase() === newCategory.trim().toLowerCase())) {
            onAddCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Manage Categories</h2>
                <form onSubmit={handleAddCategory} className="flex mb-4">
                <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="New category name..." className="flex-grow border rounded-l px-2 py-2 text-sm border-gray-300 focus:ring-brand-primary focus:border-brand-primary"/>
                <button type="submit" className="bg-brand-primary text-white px-4 rounded-r text-sm font-semibold">Add</button>
            </form>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.sort().map(cat => (
                    <div key={cat} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                        <span className="text-sm">{cat}</span>
                        <button onClick={() => onDeleteCategory(cat)} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">&times;</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoriesPage;
