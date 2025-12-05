

import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { BusinessAssets, Document } from '../types';

declare const html2pdf: any;

interface LineItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});
const formatKsh = (amount: number) => `Ksh ${currencyFormatter.format(amount)}`;

interface ReceiptGeneratorProps {
    assets: BusinessAssets;
    onSave: (doc: Omit<Document, 'id'>) => void;
    onBack: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ assets, onSave, onBack }) => {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<LineItem[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  
  const [businessName, setBusinessName] = useState(assets.name);
  const [receiptId, setReceiptId] = useState(`R${Date.now().toString().slice(-6)}`);
  const [cashierName] = useState('Admin'); // Static for now

  const receiptPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBusinessName(assets.name);
  }, [assets]);
  
  const { total } = useMemo(() => {
    const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    return { total };
  }, [items]);

  const change = useMemo(() => {
    const cash = typeof cashReceived === 'number' ? cashReceived : 0;
    return cash >= total ? cash - total : 0;
  }, [cashReceived, total]);

  const generatePdf = () => {
    const element = receiptPreviewRef.current;
    if (!element) return;
    html2pdf().from(element).set({
        margin: [2, 0, 2, 0],
        filename: `receipt-${receiptId}.pdf`,
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: [80, 297], orientation: 'portrait' }
    }).save();
  };
  
  const handleSaveAndPrint = () => {
      const newDoc: Omit<Document, 'id'> = {
          type: 'Receipt',
          number: receiptId,
          issuerName: businessName,
          clientName: clientName || undefined,
          date: new Date().toISOString(),
          amount: total,
          currency: 'Ksh',
          paymentStatus: 'Paid',
          items: items.map(i => ({ description: i.name, quantity: i.qty, price: i.price })),
      };
      onSave(newDoc);
      generatePdf();
  };
  
   const StepIndicator: React.FC<{currentStep: number}> = ({currentStep}) => (
    <div className="flex justify-center items-center mb-4">
      {[1,2].map(s => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= s ? 'bg-brand-navy text-white' : 'bg-gray-200 text-gray-500'}`}>
            {s}
          </div>
          {s < 2 && <div className={`h-1 w-8 ${currentStep > s ? 'bg-brand-navy' : 'bg-gray-200'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="p-4 bg-white sticky top-0 z-10 shadow-sm border-b">
          <div className="flex justify-between items-center">
            <button onClick={onBack} className="text-gray-500">&times;</button>
            <h2 className="font-bold text-lg">New Receipt</h2>
            <div className="w-6"></div>
          </div>
          <StepIndicator currentStep={step} />
      </div>
      
      <div className="p-4">
        {step === 1 && (
            <ItemsAndDetailsStep 
                items={items} 
                setItems={setItems}
                clientName={clientName}
                setClientName={setClientName}
                clientContact={clientContact}
                setClientContact={setClientContact}
                deliveryAddress={deliveryAddress}
                setDeliveryAddress={setDeliveryAddress}
                onNext={() => setStep(2)}
            />
        )}
        {step === 2 && (
            <PreviewStep 
                ref={receiptPreviewRef}
                logo={assets.logo}
                businessName={businessName}
                address={assets.address}
                receiptId={receiptId}
                cashierName={cashierName}
                items={items}
                total={total}
                cashReceived={cashReceived}
                setCashReceived={setCashReceived}
                change={change}
                onBack={() => setStep(1)}
                onSaveAndPrint={handleSaveAndPrint}
            />
        )}
      </div>
    </div>
  );
};

const ItemsAndDetailsStep: React.FC<any> = ({ items, setItems, clientName, setClientName, clientContact, setClientContact, deliveryAddress, setDeliveryAddress, onNext }) => {
    const addItem = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const name = (form.elements.namedItem('item_name') as HTMLInputElement).value;
        const qty = parseFloat((form.elements.namedItem('item_qty') as HTMLInputElement).value);
        const price = parseFloat((form.elements.namedItem('item_price') as HTMLInputElement).value);
        if (!name || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) return;
        setItems([...items, { id: Date.now(), name, qty, price }]);
        form.reset();
        (form.elements.namedItem('item_name') as HTMLInputElement).focus();
    };
    const removeItem = (id: number) => setItems(items.filter(item => item.id !== id));

    return (
         <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Customer Details (Optional)</h2>
                <div className="space-y-3">
                    <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Customer Name" className="w-full p-2 border rounded-md"/>
                    <input type="text" value={clientContact} onChange={e => setClientContact(e.target.value)} placeholder="Customer Phone or Email" className="w-full p-2 border rounded-md"/>
                    <textarea value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Delivery Address" rows={2} className="w-full p-2 border rounded-md"/>
                </div>
            </div>
          
            <div className="p-4 bg-white rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Items</h2>
                <form onSubmit={addItem} className="space-y-3 mb-4">
                    <input type="text" name="item_name" required className="block w-full p-2 border rounded-md" placeholder="Item Name" autoFocus/>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" name="item_qty" required min="0.01" step="any" className="block w-full p-2 border rounded-md" defaultValue="1" placeholder="Quantity" />
                        <input type="number" name="item_price" required min="0.01" step="any" className="block w-full p-2 border rounded-md" placeholder="Unit Price"/>
                    </div>
                    <button type="submit" className="w-full py-2 font-semibold text-white transition duration-300 rounded-lg bg-blue-500 hover:bg-blue-600">
                        + Add Item
                    </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map(item => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                            <div><span className="font-semibold text-sm">{item.name}</span><div className="text-xs text-gray-500">{item.qty} &times; {formatKsh(item.price)}</div></div>
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-sm pr-2">{formatKsh(item.qty * item.price)}</span>
                                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <p className="text-center text-gray-500 text-sm py-4">No items added yet.</p>}
                </div>
            </div>
            <button onClick={onNext} disabled={items.length === 0} className="w-full bg-brand-navy text-white font-bold py-3 rounded-lg mt-4 disabled:bg-gray-400">Next: Preview Receipt</button>
        </div>
    );
};

const PreviewStep = React.forwardRef<HTMLDivElement, any>(({ logo, businessName, address, receiptId, cashierName, items, total, cashReceived, setCashReceived, change, onBack, onSaveAndPrint }, ref) => {
    return (
        <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
                 <h2 className="text-lg font-semibold mb-2 text-gray-800">Payment</h2>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Ksh</span>
                    <input type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value === '' ? '' : parseFloat(e.target.value))} placeholder="Cash Received" className="w-full p-3 pl-10 border rounded-md"/>
                 </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-800 text-center">Receipt Preview</h2>
            <div className="w-full max-w-xs mx-auto">
                <div ref={ref} className="bg-white shadow-lg p-3 font-mono text-xs text-black" style={{width: '80mm'}}>
                    {logo && <img src={logo} alt="logo" className="max-h-16 mx-auto mb-2 object-contain"/>}
                    <div className="text-center mb-2">
                        <div className="text-lg font-bold uppercase">{businessName}</div>
                        <div className="text-[10px]">{address.split('\n')[0]}</div>
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span>Date: {new Date().toLocaleDateString()}</span>
                        <span>Cashier: {cashierName}</span>
                    </div>
                     <div className="text-center text-[10px]">Receipt #: {receiptId}</div>

                    <div className="border-t border-dashed border-black my-2"></div>
                    <div className="flex justify-between font-bold">
                        <span className="w-1/2">Name</span>
                        <span className="w-1/4 text-center">Qty</span>
                        <span className="w-1/4 text-right">Price</span>
                    </div>
                    <div className="border-b border-dashed border-black my-1"></div>
                    
                    <div className="space-y-1 my-1">
                        {items.map((item: LineItem) => (
                          <div key={item.id} className="flex justify-between">
                            <span className="w-1/2 truncate pr-1">{item.name}</span>
                            <span className="w-1/4 text-center">{item.qty}</span>
                            <span className="w-1/4 text-right">{currencyFormatter.format(item.price * item.qty)}</span>
                          </div>
                        ))}
                    </div>
                    
                    <div className="border-t border-dashed border-black my-2"></div>
                    <div className="space-y-1 font-semibold text-sm">
                        <div className="flex justify-between"><span>Price</span><span>{currencyFormatter.format(total)}</span></div>
                        <div className="flex justify-between"><span>CASH</span><span>{typeof cashReceived === 'number' ? currencyFormatter.format(cashReceived) : '0.00'}</span></div>
                        <div className="flex justify-between"><span>CHANGE</span><span>{currencyFormatter.format(change)}</span></div>
                    </div>

                    <div className="border-t border-dashed border-black my-2"></div>
                    <div className="text-center font-bold my-2">THANK YOU!</div>
                    
                    <div className="text-center pt-2">
                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://www.tukosoko.com/receipt/${receiptId}`} alt="QR Code" className="w-20 h-20 mx-auto" />
                         <p className="text-[10px] text-gray-600 mt-1">powered by nikosoko</p>
                    </div>
                </div>
            </div>
             <div className="flex gap-2 pt-4">
                <button onClick={onBack} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg">Back</button>
                <button onClick={onSaveAndPrint} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-lg">Save & Print</button>
            </div>
        </div>
    );
});


export default ReceiptGenerator;
