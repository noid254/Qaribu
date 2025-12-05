
import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { BusinessAssets, Document } from '../types';

// html2pdf is not used by the seller anymore, but would be used on the client-facing page.
// We'll leave the import in case it's needed for other generators.
declare const html2pdf: any;

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

interface InvoiceGeneratorProps {
    assets: BusinessAssets;
    onSave: (doc: Omit<Document, 'id'>) => void;
    onBack: () => void;
    onComplete?: () => void; // Added onComplete prop
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ assets, onSave, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Invoice Data State
  const [fromName, setFromName] = useState(assets.name);
  const [fromDetails, setFromDetails] = useState(`${assets.address}\ninfo@tukosoko.com`);
  const [toName, setToName] = useState('Client Company Name');
  const [toDetails, setToDetails] = useState('123 Client Address\nNairobi, Kenya\nVAT # P012345678X');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-4)}`);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));

  const [lineItems, setLineItems] = useState<LineItem[]>([
      {id: 1, description: 'Sample Item 1', quantity: 10, unitPrice: 100},
      {id: 2, description: 'Sample Service', quantity: 1, unitPrice: 5000},
  ]);
  const [paymentInstructions, setPaymentInstructions] = useState('Scan this code to verify online.\nSWIFT: Acc. 19001010\nPayPal: iworksesire.com');
  const [notes, setNotes] = useState('Thank you for your business.');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(16); // as percentage
  const [shipping, setShipping] = useState(0);
  const [depositPaid, setDepositPaid] = useState(0);
  
  const invoicePreviewRef = useRef<HTMLDivElement>(null);

  const { subtotal, taxAmount, total, totalDue } = useMemo(() => {
    const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const total = subtotal - discount + taxAmount + shipping;
    const totalDue = total - depositPaid;
    return { subtotal, taxAmount, total, totalDue };
  }, [lineItems, discount, taxRate, shipping, depositPaid]);
  
  
  useEffect(() => {
    setFromName(assets.name);
    setFromDetails(`${assets.address}\n${'info@' + assets.name.toLowerCase().replace(/\s/g, '')}.com`);
  }, [assets]);


  const handleSaveAndShare = () => {
      const newDoc: Omit<Document, 'id'> = {
        type: 'Invoice',
        number: invoiceNumber,
        issuerName: fromName,
        clientName: toName,
        date: new Date(date).toISOString(),
        amount: totalDue,
        currency: 'KES', // Standard currency code
        paymentStatus: 'Pending',
        items: lineItems.map(i => ({ description: i.description, quantity: i.quantity, price: i.unitPrice })),
      };
      onSave(newDoc);
      setIsShareModalOpen(true);
  };
  
  const StepIndicator: React.FC<{currentStep: number}> = ({currentStep}) => (
    <div className="flex justify-center items-center mb-4">
      {[1,2,3].map(s => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= s ? 'bg-brand-navy text-white' : 'bg-gray-200 text-gray-500'}`}>
            {s}
          </div>
          {s < 3 && <div className={`h-1 w-8 ${currentStep > s ? 'bg-brand-navy' : 'bg-gray-200'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
       <div className="p-4 bg-white sticky top-0 z-10 shadow-sm border-b">
          <div className="flex justify-between items-center">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h2 className="font-bold text-lg text-brand-navy">New Invoice</h2>
            <div className="w-6"></div>
          </div>
          <StepIndicator currentStep={step} />
      </div>
      
       <div className="p-4 pb-20">
        {step === 1 && (
            <AddressStep 
                fromName={fromName} setFromName={setFromName} fromDetails={fromDetails} setFromDetails={setFromDetails}
                toName={toName} setToName={setToName} toDetails={toDetails} setToDetails={setToDetails}
                invoiceNumber={invoiceNumber} setInvoiceNumber={setInvoiceNumber}
                date={date} setDate={setDate} dueDate={dueDate} setDueDate={setDueDate}
                onNext={() => setStep(2)}
            />
        )}
        {step === 2 && (
            <ItemsStep
                lineItems={lineItems}
                setLineItems={setLineItems}
                discount={discount} setDiscount={setDiscount}
                taxRate={taxRate} setTaxRate={setTaxRate}
                shipping={shipping} setShipping={setShipping}
                depositPaid={depositPaid} setDepositPaid={setDepositPaid}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
            />
        )}
        {step === 3 && (
            <InvoicePreview
                ref={invoicePreviewRef}
                assets={assets} fromName={fromName} fromDetails={fromDetails}
                toName={toName} toDetails={toDetails}
                invoiceNumber={invoiceNumber} date={date} dueDate={dueDate}
                lineItems={lineItems} 
                subtotal={subtotal} discount={discount} taxAmount={taxAmount} shipping={shipping} depositPaid={depositPaid} totalDue={totalDue}
                taxRate={taxRate}
                paymentInstructions={paymentInstructions} notes={notes}
                onBack={() => setStep(2)}
                onShare={handleSaveAndShare}
            />
        )}
       </div>
       {isShareModalOpen && (
           <ShareInvoiceModal 
               clientPhone={""} 
               onClose={() => setIsShareModalOpen(false)} 
               invoiceNumber={invoiceNumber} 
               fromName={fromName} 
               onDone={onComplete || onBack} 
            />
        )}
    </div>
  );
};

const formInputClass = "mt-1 w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all";
const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1";

const AddressStep: React.FC<any> = ({ fromName, setFromName, fromDetails, setFromDetails, toName, setToName, toDetails, setToDetails, invoiceNumber, setInvoiceNumber, date, setDate, dueDate, setDueDate, onNext }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-brand-navy border-b pb-2">Invoice Details</h2>
            
            <div className="space-y-4">
                 <div>
                    <label className={labelClass}>From (Your Business)</label>
                    <input value={fromName} onChange={e => setFromName(e.target.value)} type="text" placeholder="Business Name" className={formInputClass} />
                    <textarea value={fromDetails} onChange={e => setFromDetails(e.target.value)} rows={3} placeholder="Address, Email, Phone" className={formInputClass} />
                </div>
                
                <div>
                    <label className={labelClass}>To (Client)</label>
                    <input value={toName} onChange={e => setToName(e.target.value)} type="text" placeholder="Client Name" className={formInputClass} required/>
                     <textarea value={toDetails} onChange={e => setToDetails(e.target.value)} rows={3} placeholder="Client Address" className={formInputClass} />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className={labelClass}>Invoice #</label>
                        <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} type="text" className={formInputClass} required/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className={labelClass}>Date</label>
                            <input value={date} onChange={e => setDate(e.target.value)} type="date" className={formInputClass} required/>
                        </div>
                         <div>
                            <label className={labelClass}>Due Date</label>
                            <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className={formInputClass} required/>
                        </div>
                    </div>
                </div>
                
                <button onClick={onNext} className="w-full bg-brand-navy text-white font-bold py-4 rounded-xl shadow-lg mt-4 active:scale-95 transition-transform">
                    Next: Add Items
                </button>
            </div>
        </div>
    );
}

const ItemsStep: React.FC<{lineItems: LineItem[], setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>, discount: number, setDiscount: (d:number)=>void, taxRate: number, setTaxRate: (r:number)=>void, shipping:number, setShipping:(s:number)=>void, depositPaid:number, setDepositPaid:(d:number)=>void, onBack: () => void, onNext: () => void}> = ({ lineItems, setLineItems, discount, setDiscount, taxRate, setTaxRate, shipping, setShipping, depositPaid, setDepositPaid, onBack, onNext }) => {
    const [desc, setDesc] = useState('');
    const [qty, setQty] = useState('1');
    const [unitPrice, setUnitPrice] = useState('');

    const addItem = () => {
        const qtyNum = parseFloat(qty);
        const priceNum = parseFloat(unitPrice);
        if (!desc || isNaN(qtyNum) || isNaN(priceNum)) return;
        setLineItems(prev => [...prev, { id: Date.now(), description: desc, quantity: qtyNum, unitPrice: priceNum }]);
        setDesc(''); setQty('1'); setUnitPrice('');
        document.getElementById('item-description-input')?.focus();
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addItem();
    };

    const handlePriceKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addItem();
        }
    };

    const removeItem = (id: number) => {
        setLineItems(lineItems.filter(item => item.id !== id));
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-brand-navy border-b pb-2">Items & Calculations</h2>
            
            <div className="space-y-4">
                <form onSubmit={handleFormSubmit} className="space-y-3 p-4 border border-brand-gold/30 bg-brand-gold/5 rounded-xl">
                     <h3 className="font-bold text-sm text-brand-navy mb-2">Add New Item</h3>
                     <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500">Description</label>
                        <input id="item-description-input" value={desc} onChange={e => setDesc(e.target.value)} type="text" placeholder="Product or Service Name" className={formInputClass} required autoFocus/>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500">Quantity</label>
                            <input value={qty} onChange={e => setQty(e.target.value)} type="number" placeholder="1" className={formInputClass} required/>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500">Unit Price</label>
                            <input value={unitPrice} onChange={e => setUnitPrice(e.target.value)} type="number" step="0.01" placeholder="0.00" className={formInputClass} required onKeyDown={handlePriceKeyDown} />
                        </div>
                     </div>
                     
                     <button type="submit" className="w-full bg-brand-navy text-white font-bold py-3 rounded-lg text-sm shadow-md mt-2">+ Add to List</button>
                </form>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {lineItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl">
                            <div>
                                <p className="font-bold text-gray-800">{item.description}</p>
                                <p className="text-xs text-gray-500">{item.quantity} x {currencyFormatter.format(item.unitPrice)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="font-bold text-brand-navy">{currencyFormatter.format(item.quantity * item.unitPrice)}</p>
                                <button onClick={() => removeItem(item.id)} className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-200 transition">&times;</button>
                            </div>
                        </div>
                    ))}
                    {lineItems.length === 0 && <p className="text-center text-sm text-gray-400 py-4">No items added yet.</p>}
                </div>

                <div className="pt-4 border-t space-y-3">
                    <h3 className="font-bold text-sm text-gray-600">Adjustments</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500">Discount</label>
                            <input value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} type="number" className={formInputClass}/>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500">Tax Rate (%)</label>
                            <input value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} type="number" className={formInputClass}/>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500">Shipping</label>
                            <input value={shipping} onChange={e => setShipping(parseFloat(e.target.value) || 0)} type="number" className={formInputClass}/>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500">Deposit Paid</label>
                            <input value={depositPaid} onChange={e => setDepositPaid(parseFloat(e.target.value) || 0)} type="number" className={formInputClass}/>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={onBack} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-xl">Back</button>
                    <button onClick={onNext} className="flex-1 bg-brand-navy text-white font-bold py-3 rounded-xl shadow-lg">Preview Invoice</button>
                </div>
            </div>
        </div>
    )
}

const InvoicePreview = React.forwardRef<HTMLDivElement, any>(({ assets, fromName, fromDetails, toName, toDetails, invoiceNumber, date, dueDate, lineItems, subtotal, discount, taxRate, taxAmount, shipping, depositPaid, totalDue, paymentInstructions, notes, onBack, onShare }, ref) => {
    return (
        <div className="flex flex-col h-full">
            {/* Scale Wrapper for Fit-to-Page Effect on Mobile */}
            <div className="flex-1 overflow-auto bg-gray-200 p-2 md:p-4 rounded-xl border border-gray-300 flex justify-center mb-4 relative">
                 {/* The visual scaling container */}
                 <div className="transform scale-[0.45] origin-top md:scale-100 md:origin-top w-[210mm] h-[297mm] bg-white shadow-2xl">
                    <div ref={ref} className="bg-white p-12 h-full w-full font-sans text-sm relative text-gray-800" style={{ width: '210mm', height: '297mm' }}>
                        {/* Brand Header */}
                        <div className="flex justify-between items-start pb-8 border-b-2 border-gray-800 mb-8">
                            <div className="flex items-center gap-6">
                                {assets.logo && <img src={assets.logo} alt="logo" className="h-24 w-auto object-contain"/>}
                                <div>
                                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-wider">INVOICE</h1>
                                    <p className="text-gray-500 font-medium mt-1">#{invoiceNumber}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="font-bold text-lg">{fromName}</h3>
                                <p className="whitespace-pre-line text-gray-600 text-xs mt-1">{fromDetails}</p>
                            </div>
                        </div>

                        {/* Bill To & Dates */}
                        <div className="flex justify-between mb-12">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bill To</h3>
                                <p className="font-bold text-lg text-gray-900">{toName}</p>
                                <p className="whitespace-pre-line text-gray-600">{toDetails}</p>
                            </div>
                            <div className="text-right space-y-2">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Date</span>
                                    <span className="font-bold">{new Date(date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Due Date</span>
                                    <span className="font-bold text-red-600">{new Date(dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <table className="w-full mb-8">
                            <thead>
                                <tr className="border-b-2 border-gray-800 text-left">
                                    <th className="py-3 font-bold uppercase text-xs tracking-wider">Description</th>
                                    <th className="py-3 text-center font-bold uppercase text-xs tracking-wider w-20">Qty</th>
                                    <th className="py-3 text-right font-bold uppercase text-xs tracking-wider w-32">Price</th>
                                    <th className="py-3 text-right font-bold uppercase text-xs tracking-wider w-32">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.map((item: LineItem) => (
                                    <tr key={item.id} className="border-b border-gray-200">
                                        <td className="py-4 font-medium">{item.description}</td>
                                        <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                                        <td className="py-4 text-right text-gray-600">{currencyFormatter.format(item.unitPrice)}</td>
                                        <td className="py-4 text-right font-bold">{currencyFormatter.format(item.quantity * item.unitPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Summary */}
                        <div className="flex justify-end mb-12">
                            <div className="w-1/2 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{currencyFormatter.format(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Discount</span>
                                        <span>- {currencyFormatter.format(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax ({taxRate}%)</span>
                                    <span>{currencyFormatter.format(taxAmount)}</span>
                                </div>
                                {shipping > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span>{currencyFormatter.format(shipping)}</span>
                                    </div>
                                )}
                                {depositPaid > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Deposit Paid</span>
                                        <span>- {currencyFormatter.format(depositPaid)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-xl text-gray-900 border-t-2 border-gray-800 pt-3">
                                    <span>Total Due</span>
                                    <span>{currencyFormatter.format(totalDue)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-12 left-12 right-12">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Details</h3>
                                    <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{paymentInstructions}</p>
                                </div>
                                <div className="flex justify-end items-end">
                                     <div className="text-center">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://tukosoko.com/verify/${invoiceNumber}`)}`} 
                                            alt="QR Code" className="w-16 h-16 opacity-80"
                                        />
                                        <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wide">Scan to Verify</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 border-t pt-4 text-center text-gray-400 text-xs">
                                <p>{notes}</p>
                                <p className="mt-1">Generated by Niko Soko App</p>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button onClick={onBack} className="flex-1 bg-gray-200 text-gray-800 font-bold py-4 rounded-xl">Back to Edit</button>
                <button onClick={onShare} className="flex-1 bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <span>Save & Share</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                </button>
            </div>
        </div>
    )
});

const ShareInvoiceModal: React.FC<{clientPhone: string, onClose: () => void, invoiceNumber: string, fromName: string, onDone: () => void}> = ({ clientPhone, onClose, invoiceNumber, fromName, onDone }) => {
    const [phone, setPhone] = useState(clientPhone);
    
    const handleSendSMS = () => {
        const invoiceLink = `https://nikosoko.app/invoice/${invoiceNumber}`;
        const message = `Hello, here is your invoice ${invoiceNumber} from ${fromName}. You can view it here: ${invoiceLink}`;
        window.open(`sms:${phone}?body=${encodeURIComponent(message)}`);
        onClose();
    };

    const handleSendWhatsApp = () => {
        const invoiceLink = `https://nikosoko.app/invoice/${invoiceNumber}`;
        const message = `Hello, here is your invoice *${invoiceNumber}* from *${fromName}*.\n\nYou can view and download it here:\n${invoiceLink}`;
        // Ensure phone is formatted for WhatsApp (remove leading 0 or +, add 254 if missing)
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);
        if (formattedPhone.length === 9) formattedPhone = '254' + formattedPhone;
        
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-brand-navy">Share Invoice</h2>
                <p className="text-sm text-gray-600 mb-4">Enter client's phone number to send the invoice link.</p>
                <div className="flex items-center border rounded-xl bg-gray-50 mb-6 focus-within:ring-2 focus-within:ring-brand-gold">
                    <span className="pl-4 text-gray-500 font-bold">+254</span>
                    <input 
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        className="w-full p-3 bg-transparent outline-none font-semibold text-gray-800" 
                        placeholder="712 345 678" 
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleSendSMS} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition">
                        SMS
                    </button>
                    <button onClick={handleSendWhatsApp} className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                        WhatsApp
                    </button>
                </div>
                <div className="flex gap-2 mt-4">
                    <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 text-sm font-semibold py-2 rounded-lg">Cancel</button>
                    <button onClick={onDone} className="flex-1 bg-brand-navy text-white text-sm font-semibold py-2 rounded-lg">Done</button>
                </div>
            </div>
        </div>
    );
};


export default InvoiceGenerator;
