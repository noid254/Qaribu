import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { Document, DocumentItem } from '../types';
import LoadingSpinner from './LoadingSpinner';

// Icons
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 5a1 1 0 00-1 1v1h1V6zM5 9H4v2h1V9zm2 2H6v2h1v-2zm-2 4H4v1a1 1 0 001 1h1v-2zm4-12a1 1 0 00-1 1v1h2V6a1 1 0 00-1-1zM9 9H7v2h2V9zm2 2h-2v2h2v-2zm-2 4h-2v1a1 1 0 001 1h1v-2zm4-12a1 1 0 00-1 1v1h2V6a1 1 0 00-1-1zM13 9h-2v2h2V9zm2 2h-2v2h2v-2zm-2 4h-2v1a1 1 0 001 1h1v-2zm4-12a1 1 0 00-1 1v1h1a1 1 0 001-1V5a1 1 0 00-1-1zM15 9h-2v2h2V9zm2 2h-2v2h2v-2zm-2 4h-2v2h1a1 1 0 001-1v-1z" clipRule="evenodd" /></svg>;

const cleanJsonString = (str: string) => {
    // Remove markdown ```json and ```
    const cleaned = str.replace(/```json\n?|```/g, '').trim();
    return cleaned;
};

interface ScanDocumentViewProps {
    onBack: () => void;
    onSave: (doc: Omit<Document, 'id'>) => void;
}

type ScanStep = 'capture' | 'scanning' | 'confirm';

const ScanDocumentView: React.FC<ScanDocumentViewProps> = ({ onBack, onSave }) => {
    const [step, setStep] = useState<ScanStep>('capture');
    const [receiptImageSrc, setReceiptImageSrc] = useState<string | null>(null);
    const [productImages, setProductImages] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [docData, setDocData] = useState<Partial<Omit<Document, 'id'>>>({
        type: 'Receipt',
        paymentStatus: 'Paid',
        verificationStatus: 'Unverified',
        isAsset: false,
        currency: 'Ksh',
        number: `R${Date.now().toString().slice(-6)}`,
    });
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const receiptFileInputRef = useRef<HTMLInputElement>(null);
    const productFileInputRef = useRef<HTMLInputElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsStreaming(true);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please ensure permissions are granted.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsStreaming(false);
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context?.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
            setReceiptImageSrc(canvasRef.current.toDataURL('image/jpeg'));
            stopCamera();
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'receipt' | 'product') => {
        const files = event.target.files;
        if (!files) return;

        if (type === 'receipt') {
            const reader = new FileReader();
            reader.onloadend = () => setReceiptImageSrc(reader.result as string);
            reader.readAsDataURL(files[0]);
        } else {
             Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => setProductImages(prev => [...prev, reader.result as string]);
                reader.readAsDataURL(file);
            });
        }
    };

    const handleScan = async () => {
        if (!receiptImageSrc) {
            setError("Please capture or upload a receipt image first.");
            return;
        }
        setStep('scanning');
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Image = receiptImageSrc.split(',')[1];
            const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
            const textPart = { text: `Extract information from this receipt. Provide the seller's name, receipt date (YYYY-MM-DD), total amount, and a list of items with description, quantity, price, and serial number if present. Respond ONLY with a valid JSON object in this format:\n{\n  "issuerName": "string",\n  "date": "YYYY-MM-DD",\n  "amount": number,\n  "items": [\n    { "description": "string", "quantity": number, "price": number, "serial": "string|null" }\n  ]\n}` };
            
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [imagePart, textPart] } });
            const jsonString = cleanJsonString(response.text);
            const parsedData = JSON.parse(jsonString);

            setDocData(prev => ({
                ...prev,
                ...parsedData,
                scannedImageUrl: receiptImageSrc,
                isAsset: parsedData.items?.some((item: DocumentItem) => item.serial),
            }));
            setStep('confirm');
        } catch (err: any) {
            console.error("AI scanning failed:", err);
            setError("AI could not read the receipt. Please enter the details manually.");
            setStep('confirm'); // Go to confirm step even on failure, so user can input manually
        }
    };
    
    useEffect(() => {
        if(receiptImageSrc) {
            handleScan();
        }
    }, [receiptImageSrc]);

    const handleSave = () => {
        if (!docData.issuerName || !docData.date || !docData.amount) {
            alert("Please ensure seller, date, and amount are filled.");
            return;
        }
        onSave({ ...docData, productImages } as Omit<Document, 'id'>);
    };

    const updateField = (field: keyof Omit<Document, 'id'>, value: any) => {
        setDocData(prev => ({ ...prev, [field]: value }));
    };

    if (isStreaming) {
        return (
             <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
                <video ref={videoRef} className="w-full h-auto rounded-lg" playsInline />
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="absolute bottom-6 left-6 right-6 flex justify-around items-center">
                    <button onClick={stopCamera} className="bg-white/20 text-white font-semibold py-3 px-6 rounded-lg">Cancel</button>
                    <button onClick={captureImage} className="w-20 h-20 rounded-full bg-white border-4 border-white/50"></button>
                    <div className="w-[88px]"></div> {/* Spacer */}
                </div>
            </div>
        )
    }

    if(step === 'scanning') {
        return (
            <div className="p-4 bg-gray-50 min-h-full flex flex-col items-center justify-center">
                <LoadingSpinner message="Scanning receipt with AI..." />
                <img src={receiptImageSrc!} alt="receipt" className="w-48 mt-4 rounded-lg shadow-md" />
            </div>
        )
    }
    
    if(step === 'confirm') {
         return (
            <div className="p-4 bg-gray-50 min-h-full space-y-4">
                <h1 className="text-2xl font-bold text-gray-800">Confirm Asset Details</h1>
                {error && <p className="text-red-500 text-center text-sm p-2 bg-red-100 rounded-md">{error}</p>}
                
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <h2 className="font-semibold text-gray-700">Product Details</h2>
                    <input value={docData.items?.[0]?.description || ''} onChange={e => setDocData(p => ({...p, items: [{...p.items?.[0], description: e.target.value}]}))} type="text" placeholder="Product Name" className="w-full p-2 border rounded"/>
                    <input value={docData.items?.[0]?.serial || ''} onChange={e => setDocData(p => ({...p, items: [{...p.items?.[0], serial: e.target.value}]}))} type="text" placeholder="Serial / IMEI" className="w-full p-2 border rounded"/>
                    <textarea value={docData.specifications || ''} onChange={e => updateField('specifications', e.target.value)} rows={3} placeholder="Specifications (optional, e.g., Color, Size, Model)" className="w-full p-2 border rounded"/>
                    <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Product Images</label>
                        <div className="grid grid-cols-4 gap-2">
                            {productImages.map((src, i) => <img key={i} src={src} className="w-full h-16 object-cover rounded"/>)}
                            {productImages.length < 4 && <button onClick={() => productFileInputRef.current?.click()} className="w-full h-16 border-2 border-dashed rounded flex items-center justify-center text-gray-400">+</button>}
                        </div>
                        <input type="file" multiple ref={productFileInputRef} onChange={(e) => handleFileChange(e, 'product')} accept="image/*" className="hidden"/>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <h2 className="font-semibold text-gray-700">Purchase Details</h2>
                    <input value={docData.issuerName || ''} onChange={e => updateField('issuerName', e.target.value)} type="text" placeholder="Seller / Issuer Name" className="w-full p-2 border rounded"/>
                    <input value={docData.date || ''} onChange={e => updateField('date', e.target.value)} type="date" className="w-full p-2 border rounded"/>
                    <input value={docData.amount || ''} onChange={e => updateField('amount', parseFloat(e.target.value))} type="number" placeholder="Total Amount" className="w-full p-2 border rounded"/>
                </div>
                 <button onClick={handleSave} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-md">Save Asset</button>
                 <button onClick={onBack} className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-lg">Cancel</button>
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-50 min-h-full space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">Add New Asset</h1>
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-3 text-center">
                 <h2 className="font-semibold text-gray-700">Scan Receipt to Begin</h2>
                 <p className="text-sm text-gray-500">Use your camera or upload a photo of the purchase receipt. We'll use AI to fill in the details.</p>
                 <input type="file" ref={receiptFileInputRef} onChange={(e) => handleFileChange(e, 'receipt')} accept="image/*" className="hidden"/>
                 <div className="flex gap-4 pt-2">
                    <button onClick={startCamera} className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100">
                        <CameraIcon/> <span className="text-sm font-semibold mt-1">Camera</span>
                    </button>
                        <button onClick={() => receiptFileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-600 hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-sm font-semibold mt-1">Upload</span>
                    </button>
                </div>
                 <button onClick={onBack} className="w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-lg mt-4">Cancel</button>
            </div>
        </div>
    );
}

export default ScanDocumentView;