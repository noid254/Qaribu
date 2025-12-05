

import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { BusinessAssets, Document } from '../types';

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

interface QuoteGeneratorProps {
    assets: BusinessAssets;
    onSave: (doc: Omit<Document, 'id'>) => void;
    onBack: () => void;
}

const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ assets, onSave, onBack }) => {
  const [step, setStep] = useState(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Quote Data State
  const [fromName, setFromName] = useState(assets.name);
  const [fromDetails, setFromDetails] = useState(`${assets.address}\ninfo@tukosoko.com`);
  const [toName, setToName] = useState('Client Company Name');
  const [toDetails, setToDetails] = useState('123 Client Address\nNairobi, Kenya\nVAT # P012345678X');
  const [quoteNumber, setQuoteNumber] = useState(`QTE-${Date.now().toString().slice(-4)}`);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'));

  const [lineItems, setLineItems] = useState<LineItem[]>([
      {id: 1, description: 'Sample Service', quantity: 10, unitPrice: 500},
      {id: 2, description: 'Consultation Fee', quantity: 1, unitPrice: 2500},
  ]);
  const [paymentInstructions, setPaymentInstructions] = useState('Payment to be made upon acceptance of quote.\nBank Transfer: ABC Bank, Acc. 123456789');
  const [notes, setNotes] = useState('This quote is valid for 30 days.');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(16); // as percentage
  const [shipping, setShipping] = useState(0);
  
  const quotePreviewRef = useRef<HTMLDivElement>(null);

  const { subtotal, taxAmount, totalDue } = useMemo(() => {
    const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const totalDue = subtotal - discount + taxAmount + shipping;
    return { subtotal, taxAmount, totalDue };
  }, [lineItems, discount, taxRate, shipping]);
  
  
  useEffect(() => {
    setFromName(assets.name);
    setFromDetails(`${assets.address}\n${'info@' + assets.name.toLowerCase().replace(/\s/g, '')}.com`);
  }, [assets]);


  const handleSaveAndShare = () => {
      const newDoc: Omit<Document, 'id'> = {
        type: 'Quote',
        number: quoteNumber,
        issuerName: fromName,
        clientName: toName,
        date: new Date(date).toISOString(),
        amount: totalDue,
        currency: 'KES',
        paymentStatus: 'Draft',
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
            <button onClick={onBack} className="text-gray-500">&times;</button>
            <h2 className="font-bold text-lg">New Quote</h2>
            <div className="w-6"></div>
          </div>
          <StepIndicator currentStep={step} />
      </div>
      
       <div className="p-4">
        {step === 1 && (
            <AddressStep 
                fromName={fromName} setFromName={setFromName} fromDetails={fromDetails} setFromDetails={setFromDetails}
                toName={toName} setToName={setToName} toDetails={toDetails} setToDetails={setToDetails}
                quoteNumber={quoteNumber} setQuoteNumber={setQuoteNumber}
                date={date} setDate={setDate} validUntil={validUntil} setValidUntil={setValidUntil}
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
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
            />
        )}
        {step === 3 && (
            <QuotePreview
                ref={quotePreviewRef}
                assets={assets} fromName={fromName} fromDetails={fromDetails}
                toName={toName} toDetails={toDetails}
                quoteNumber={quoteNumber} date={date} validUntil={validUntil}
                lineItems={lineItems} 
                subtotal={subtotal} discount={discount} taxAmount={taxAmount} shipping={shipping} totalDue={totalDue}
                taxRate={taxRate}
                paymentInstructions={paymentInstructions} notes={notes}
                onBack={() => setStep(2)}
                onShare={handleSaveAndShare}
            />
        )}
       </div>
       {isShareModalOpen && <ShareQuoteModal clientPhone={""} onClose={() => setIsShareModalOpen(false)} quoteNumber={quoteNumber} fromName={fromName} />}
    </div>
  );
};

const AddressStep: React.FC<any> = ({ fromName, setFromName, fromDetails, setFromDetails, toName, setToName, toDetails, setToDetails, quoteNumber, setQuoteNumber, date, setDate, validUntil, setValidUntil, onNext }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Parties & Details</h2>
            <div className="space-y-4">
                 <div>
                    <label className="text-sm font-medium text-gray-700">From</label>
                    <input value={fromName} onChange={e => setFromName(e.target.value)} type="text" placeholder="Your Business Name" className="mt-1 w-full p-2 border rounded-md" />
                    <textarea value={fromDetails} onChange={e => setFromDetails(e.target.value)} rows={3} placeholder="Your Address & Contact" className="mt-1 w-full p-2 border rounded-md" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">To (Client)</label>
                    <input value={toName} onChange={e => setToName(e.target.value)} type="text" placeholder="Client Name" className="mt-1 w-full p-2 border rounded-md" required/>
                     <textarea value={toDetails} onChange={e => setToDetails(e.target.value)} rows={3} placeholder="Client Address, Country, Tax ID" className="mt-1 w-full p-2 border rounded-md" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Quote #</label>
                        <input value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} type="text" className="mt-1 w-full p-2 border rounded-md" required/>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700">Date</label>
                        <input value={date} onChange={e => setDate(e.target.value)} type="date" className="mt-1 w-full p-2 border rounded-md" required/>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700">Valid Until</label>
                        <input value={validUntil} onChange={e => setValidUntil(e.target.value)} type="date" className="mt-1 w-full p-2 border rounded-md" required/>
                    </div>
                </div>
                <button onClick={onNext} className="w-full bg-brand-navy text-white font-bold py-3 rounded-lg mt-4">Next: Add Items</button>
            </div>
        </div>
    );
}

const ItemsStep: React.FC<{lineItems: LineItem[], setLineItems: React.Dispatch<React.SetStateAction<LineItem[]>>, discount: number, setDiscount: (d:number)=>void, taxRate: number, setTaxRate: (r:number)=>void, shipping:number, setShipping:(s:number)=>void, onBack: () => void, onNext: () => void}> = ({ lineItems, setLineItems, discount, setDiscount, taxRate, setTaxRate, shipping, setShipping, onBack, onNext }) => {
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
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Quote Items & Totals</h2>
            <form onSubmit={handleFormSubmit} className="space-y-3 p-4 border rounded-lg bg-gray-50 mb-4">
                 <input id="item-description-input" value={desc} onChange={e => setDesc(e.target.value)} type="text" placeholder="Item/Service Description" className="w-full p-2 border rounded-md" required autoFocus/>
                 <input value={qty} onChange={e => setQty(e.target.value)} type="number" placeholder="Quantity" className="w-full p-2 border rounded-md" required/>
                 <input value={unitPrice} onChange={e => setUnitPrice(e.target.value)} type="number" step="0.01" placeholder="Unit Price" className="w-full p-2 border rounded-md" required onKeyDown={handlePriceKeyDown} />
                 <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg text-sm">+ Add Item</button>
            </form>

            <div className="space-y-2 mb-4">
                {lineItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                            <p className="font-semibold">{item.description}</p>
                            <p className="text-sm text-gray-600">{item.quantity} &times; {currencyFormatter.format(item.unitPrice)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="font-semibold">{currencyFormatter.format(item.quantity * item.unitPrice)}</p>
                            <button onClick={() => removeItem(item.id)} className="text-red-500 font-bold text-xl">&times;</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                    <input value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} type="number" placeholder="Discount" className="w-full p-2 border rounded-md"/>
                    <input value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} type="number" placeholder="Tax Rate (%)" className="w-full p-2 border rounded-md"/>
                    <input value={shipping} onChange={e => setShipping(parseFloat(e.target.value) || 0)} type="number" placeholder="Shipping" className="w-full p-2 border rounded-md"/>
                </div>
            </div>

            <div className="flex gap-2 pt-4">
                <button onClick={onBack} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg">Back</button>
                <button onClick={onNext} className="flex-1 bg-brand-navy text-white font-bold py-3 rounded-lg">Preview Quote</button>
            </div>
        </div>
    )
}

const QuotePreview = React.forwardRef<HTMLDivElement, any>(({ assets, fromName, fromDetails, toName, toDetails, quoteNumber, date, validUntil, lineItems, subtotal, discount, taxRate, taxAmount, shipping, totalDue, paymentInstructions, notes, onBack, onShare }, ref) => {
    return (
        <div>
            <div ref={ref} className="bg-white p-8 rounded shadow-lg max-w-4xl mx-auto border border-gray-200 font-sans text-sm" style={{ width: '210mm', minHeight: '297mm', margin: 'auto' }}>
                {/* Header */}
                <header className="flex justify-between items-start pb-4 mb-8">
                    <div className="flex items-center gap-4">
                        {assets.logo && <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden"><img src={assets.logo} alt="logo" className="max-w-full max-h-full object-contain"/></div>}
                        <h1 className="text-4xl font-bold text-gray-800 tracking-wide">QUOTE</h1>
                    </div>
                    <div className="text-right text-gray-600">
                        <p><span className="font-semibold">Ref. #</span>{quoteNumber}</p>
                        <p><span className="font-semibold">Date: </span>{new Date(date).toLocaleDateString()}</p>
                        <p><span className="font-semibold">Valid Until: </span>{new Date(validUntil).toLocaleDateString()}</p>
                    </div>
                </header>

                {/* Addresses */}
                <section className="grid grid-cols-3 gap-8 mb-8 text-xs">
                    <div className="col-span-1">
                        <h3 className="font-bold text-gray-500 uppercase tracking-wider mb-2">PREPARED FOR</h3>
                        <p className="font-semibold text-gray-800">{toName}</p>
                        <p className="whitespace-pre-line text-gray-600">{toDetails}</p>
                    </div>
                     <div className="col-span-1"></div>
                     <div className="col-span-1">
                        <h3 className="font-bold text-gray-500 uppercase tracking-wider mb-2">PREPARED BY</h3>
                        <p className="font-semibold text-gray-800">{fromName}</p>
                        <p className="whitespace-pre-line text-gray-600">{fromDetails}</p>
                    </div>
                </section>
                
                <hr className="mb-8"/>

                {/* Items Table */}
                <table className="w-full text-sm mb-8">
                    <thead>
                        <tr className="text-left text-gray-500 font-semibold uppercase text-xs border-b-2 border-gray-300">
                            <th className="py-2 pr-4 w-1/2">Description</th>
                            <th className="py-2 px-4 text-center">Qty</th>
                            <th className="py-2 px-4 text-right">Unit Price</th>
                            <th className="py-2 pl-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.map((item: LineItem) => (
                            <tr key={item.id} className="border-b border-gray-200">
                                <td className="py-2 pr-4 font-semibold text-gray-800">{item.description}</td>
                                <td className="py-2 px-4 text-center text-gray-600">{item.quantity}</td>
                                <td className="py-2 px-4 text-right text-gray-600">{currencyFormatter.format(item.unitPrice)}</td>
                                <td className="py-2 pl-4 text-right font-semibold text-gray-800">{currencyFormatter.format(item.quantity * item.unitPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals & Notes */}
                <section className="grid grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-2">Payment Instructions</h3>
                        <p className="text-xs text-gray-600 whitespace-pre-line">{paymentInstructions}</p>
                    </div>
                    <div className="text-right">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{currencyFormatter.format(subtotal)}</span></div>
                            {discount > 0 && <div className="flex justify-between"><span className="text-gray-600">Discount</span><span>- {currencyFormatter.format(discount)}</span></div>}
                            <div className="flex justify-between"><span className="text-gray-600">Tax ({taxRate}%)</span><span>{currencyFormatter.format(taxAmount)}</span></div>
                            {shipping > 0 && <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{currencyFormatter.format(shipping)}</span></div>}
                            <div className="flex justify-between font-bold text-base border-t-2 border-gray-800 pt-2 mt-2"><span className="text-gray-800">Total</span><span>{currencyFormatter.format(totalDue)}</span></div>
                        </div>
                    </div>
                </section>

                <hr className="my-8"/>
                
                 {/* Footer */}
                <footer className="relative">
                    <section>
                        <div>
                            <h3 className="font-bold text-gray-500 uppercase tracking-wider mb-1 text-xs">Notes / Terms & Conditions</h3>
                            <p className="text-xs text-gray-600">{notes}</p>
                        </div>
                    </section>
                    <div className="text-center text-xs text-gray-400 pt-8 mt-8 border-t border-gray-200">
                        <p>[Your Website] | [Your Email] | [Your Phone]</p>
                        <p className="mt-2">Powered by tukosoko.com</p>
                    </div>
                </footer>
            </div>

            <div className="flex gap-2 pt-4">
                <button onClick={onBack} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg">Back</button>
                <button onClick={onShare} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-lg">Save & Share</button>
            </div>
        </div>
    )
});

const ShareQuoteModal: React.FC<{clientPhone: string, onClose: () => void, quoteNumber: string, fromName: string}> = ({ clientPhone, onClose, quoteNumber, fromName }) => {
    const [phone, setPhone] = useState(clientPhone);
    
    const handleSend = () => {
        const quoteLink = `https://nikosoko.app/quote/${quoteNumber}`;
        const message = `Hello, here is your quote ${quoteNumber} from ${fromName}. You can view it here: ${quoteLink}`;
        window.open(`sms:${phone}?body=${encodeURIComponent(message)}`);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Share via SMS</h2>
                <p className="text-sm text-gray-600 mb-2">Enter your client's phone number to send them a link to the quote.</p>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded-md mb-4" placeholder="Client's phone number" />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded-lg">Cancel</button>
                    <button onClick={handleSend} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg">Send SMS</button>
                </div>
            </div>
        </div>
    );
};

export default QuoteGenerator;
