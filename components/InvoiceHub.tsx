
import React from 'react';

// Added 'scanDocument' to HubView to allow direct navigation to the scanning interface.
type HubView = 'myDocuments' | 'quoteGenerator' | 'invoiceGenerator' | 'brandKit' | 'receiptGenerator' | 'scanDocument';

interface InvoiceHubProps {
    onNavigate: (view: HubView) => void;
    onBack: () => void;
}

// --- NEW ICONS for the "Blue Collar Professional" theme ---
const InvoiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const QuoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const ReceiptIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const ScanIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6.5 6.5v-1m-6.5-13L5.5 1m-4 4.5h1m13.5 6.5l-1-1M5.5 12.5v1m13.5-6.5L18 5m-1 6.5v-1m-6.5 6.5L5.5 18m13.5-6.5h-1M10 14v-4m-2 4h4" /></svg>;
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const ToolboxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;


const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="text-center">
        <p className="text-2xl font-bold font-mono text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
    </div>
);

const ActionCard: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void }> = ({ title, icon, onClick }) => (
    <button onClick={onClick} className="bg-blue-800 text-white p-4 rounded-xl shadow-lg text-left w-full h-32 flex flex-col justify-between hover:bg-blue-700 hover:-translate-y-1 transition-all duration-200">
        <div className="text-amber-400">
            {icon}
        </div>
        <h3 className="font-bold uppercase tracking-wide">{title}</h3>
    </button>
);

const FileLink: React.FC<{ title: string, onClick: () => void, icon: React.ReactNode, stat: string }> = ({ title, onClick, icon, stat }) => (
     <button onClick={onClick} className="bg-white p-4 rounded-xl shadow-sm text-left w-full hover:shadow-md hover:bg-gray-50 transition-all duration-200 border border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
             <div className="text-gray-500">
                {icon}
            </div>
            <h3 className="font-semibold text-gray-700">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">{stat}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </div>
    </button>
);


const InvoiceHub: React.FC<InvoiceHubProps> = ({ onNavigate, onBack }) => {
    return (
        <div className="p-4 bg-gray-100 min-h-full font-sans">
            <header className="mb-6 flex justify-between items-start">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Workshop</h1>
                    <p className="text-gray-600 mt-1">Your command center for business operations.</p>
                 </div>
                 <button onClick={onBack} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
            </header>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-around">
                <Stat value="3" label="Invoices" />
                <Stat value="1" label="Quotes" />
                <Stat value="5" label="Assets" />
            </div>
            
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Create New...</h2>
                <div className="grid grid-cols-2 gap-4">
                    <ActionCard 
                        title="New Invoice" 
                        icon={<InvoiceIcon/>} 
                        onClick={() => onNavigate('invoiceGenerator')} 
                    />
                     <ActionCard 
                        title="New Quote" 
                        icon={<QuoteIcon/>} 
                        onClick={() => onNavigate('quoteGenerator')} 
                    />
                     <ActionCard 
                        title="New Receipt" 
                        icon={<ReceiptIcon/>} 
                        onClick={() => onNavigate('receiptGenerator')} 
                    />
                    <ActionCard 
                        title="Scan Asset" 
                        icon={<ScanIcon/>} 
                        onClick={() => onNavigate('scanDocument')} 
                    />
                </div>
            </section>
            
            <section className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">My Files</h2>
                 <div className="space-y-3">
                    <FileLink 
                        title="All Documents" 
                        stat="12 items"
                        icon={<FolderIcon />} 
                        onClick={() => onNavigate('myDocuments')} 
                    />
                    <FileLink 
                        title="Brand Kit" 
                        stat="Setup"
                        icon={<ToolboxIcon />} 
                        onClick={() => onNavigate('brandKit')} 
                    />
                </div>
            </section>
        </div>
    );
};

export default InvoiceHub;
