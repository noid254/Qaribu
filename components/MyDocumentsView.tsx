
import React, { useState, useMemo } from 'react';
import type { Document, DocumentType, ServiceProvider } from '../types';

const statusStyles: Record<Document['paymentStatus'], string> = {
    Paid: 'bg-green-100 text-green-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Overdue: 'bg-red-100 text-red-800',
    Draft: 'bg-gray-100 text-gray-800',
};

const documentIcons: Record<DocumentType, React.ReactNode> = {
    Invoice: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Quote: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
    Receipt: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>,
};

const DocumentListItem: React.FC<{ doc: Document; onClick: () => void }> = ({ doc, onClick }) => {
    return (
        <button onClick={onClick} className="w-full text-left bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">{documentIcons[doc.type]}</div>
                    <div>
                        <p className="font-bold text-gray-800">{doc.type} <span className="text-gray-500 font-medium text-sm">#{doc.number}</span></p>
                        <p className="text-xs text-gray-600">
                            {doc.clientName ? `To: ${doc.clientName}` : `From: ${doc.issuerName}`}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-base font-bold text-gray-800">{doc.currency} {doc.amount.toLocaleString()}</p>
                    <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyles[doc.paymentStatus]}`}>{doc.paymentStatus}</span>
                </div>
            </div>
        </button>
    );
};

interface MyDocumentsViewProps {
    documents: Document[];
    onScan: () => void;
    onSelectDocument: (doc: Document) => void;
    currentUser: Partial<ServiceProvider> | null;
    onBack: () => void;
}

const MyDocumentsView: React.FC<MyDocumentsViewProps> = ({ documents, onScan, onSelectDocument, currentUser, onBack }) => {
    const [filter, setFilter] = useState<'Sent' | 'Received'>('Sent');
    
    const financialDocuments = useMemo(() => documents.filter(doc => !doc.isAsset), [documents]);

    const filteredDocuments = useMemo(() => {
        const sorted = [...financialDocuments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        switch (filter) {
            case 'Sent':
                return sorted.filter(doc => doc.issuerName === currentUser?.name);
            case 'Received':
                return sorted.filter(doc => doc.issuerName !== currentUser?.name);
            default:
                return sorted;
        }
    }, [financialDocuments, filter, currentUser]);
    
    const filters: ('Sent' | 'Received')[] = ['Sent', 'Received'];

    const handleDocumentClick = (doc: Document) => {
       if (typeof onSelectDocument === 'function') {
           onSelectDocument(doc);
       } else {
           console.error("MyDocumentsView: onSelectDocument prop is not a function or was not provided.");
           alert("Sorry, there was an error opening this document.");
       }
   };

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600 hover:text-gray-900 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-gray-800">My Documents</h1>
            </header>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                
                <button onClick={onScan} className="w-full bg-brand-dark text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-black transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Scan New Receipt
                </button>

                <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
                    {filters.map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-full flex-shrink-0 border transition-colors ${filter === f ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-700 border-gray-200'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {filteredDocuments.length > 0 ? (
                    <div className="space-y-3">
                        {filteredDocuments.map(doc => <DocumentListItem key={doc.id} doc={doc} onClick={() => handleDocumentClick(doc)} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                        <p className="mt-1 text-sm text-gray-500">Your documents in this category will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDocumentsView;
