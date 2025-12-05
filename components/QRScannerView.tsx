
import React, { useEffect, useState } from 'react';

interface QRScannerViewProps {
    onScanSuccess: (data: string) => void;
    onBack: () => void;
}

const QRScannerView: React.FC<QRScannerViewProps> = ({ onScanSuccess, onBack }) => {
    const [scanning, setScanning] = useState(true);

    // In a real app, this would use a library like react-qr-reader.
    // Here we simulate scanning for testing purposes.

    const handleSimulatePremiseScan = () => {
        setScanning(false);
        onScanSuccess('PREMISE:p1'); // Simulate scanning a Premise QR
    };

    const handleSimulateMasterTenantScan = () => {
        setScanning(false);
        // MASTER:TENANT:premiseId:unitId
        onScanSuccess('MASTER:TENANT:p1:Unit 101');
    };

    const handleSimulateMasterGatemanScan = () => {
        setScanning(false);
        // MASTER:GATEMAN:premiseId
        onScanSuccess('MASTER:GATEMAN:p1');
    };

    const handleSimulateCoHostScan = () => {
        setScanning(false);
        // MASTER:COHOST:premiseId:unitId:adminId
        onScanSuccess('MASTER:COHOST:p1:Unit 101:3'); // Admin ID '3' (NIT)
    };

    const handleSimulateVisitorPass = () => {
        setScanning(false);
        // Simulate scanning a Visitor's Invite Pass (Format: QARIBU:requestId:accessCode)
        onScanSuccess('QARIBU:qrr1:123456');
    };

    const handleSimulateUniversalID = () => {
        setScanning(false);
        // Simulate scanning a User's Profile QR (Format: PROFILE:userId)
        onScanSuccess('PROFILE:1');
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
            <div className="relative w-full h-full flex flex-col">
                {/* Camera Feed Simulation */}
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center overflow-hidden">
                     {/* Placeholder for camera feed */}
                     <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600')] bg-cover bg-center animate-pulse"></div>
                     
                     {/* Scanning Overlay */}
                     <div className="relative w-64 h-64 border-2 border-brand-gold rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] flex items-center justify-center">
                        <div className="absolute inset-0 border-t-4 border-brand-gold animate-[scan_2s_ease-in-out_infinite]"></div>
                        <div className="w-60 h-60 border border-white/20 rounded"></div>
                     </div>
                </div>

                {/* UI Controls */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
                    <button onClick={onBack} className="bg-black/40 text-white p-2 rounded-full backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="text-white font-semibold bg-black/40 px-4 py-1 rounded-full backdrop-blur-sm">
                        Scan QR Code
                    </div>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center z-10 bg-gradient-to-t from-black to-transparent space-y-4">
                    <p className="text-white text-center text-xs opacity-70 mb-2">
                        Developer Mode: Simulate Scans
                    </p>
                    
                    {/* Simulation Buttons for Testing */}
                    <div className="w-full space-y-3 max-h-64 overflow-y-auto">
                        <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                            <p className="text-brand-gold text-[10px] font-bold uppercase mb-2 text-center tracking-wider">Setup Roles (Master QRs)</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button 
                                    onClick={handleSimulateMasterTenantScan}
                                    className="bg-purple-600/80 text-white text-[10px] font-bold py-3 rounded-lg hover:bg-purple-700 backdrop-blur-md border border-purple-400/50"
                                >
                                    Tenant Key
                                </button>
                                <button 
                                    onClick={handleSimulateMasterGatemanScan}
                                    className="bg-indigo-600/80 text-white text-[10px] font-bold py-3 rounded-lg hover:bg-indigo-700 backdrop-blur-md border border-indigo-400/50"
                                >
                                    Gateman Key
                                </button>
                                <button 
                                    onClick={handleSimulateCoHostScan}
                                    className="bg-pink-600/80 text-white text-[10px] font-bold py-3 rounded-lg hover:bg-pink-700 backdrop-blur-md border border-pink-400/50"
                                >
                                    Co-Host Key
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                            <p className="text-brand-gold text-[10px] font-bold uppercase mb-2 text-center tracking-wider">Access & Validation</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button 
                                    onClick={handleSimulatePremiseScan}
                                    className="bg-white/10 text-white text-[10px] font-bold py-3 rounded-lg hover:bg-white/20 backdrop-blur-md border border-white/10"
                                >
                                    Premise QR
                                </button>
                                <button 
                                    onClick={handleSimulateVisitorPass}
                                    className="bg-green-600/80 text-white text-[10px] font-bold py-3 rounded-lg hover:bg-green-700 backdrop-blur-md border border-green-400/50"
                                >
                                    Visitor Pass
                                </button>
                                <button 
                                    onClick={handleSimulateUniversalID}
                                    className="bg-blue-600/80 text-white text-[10px] font-bold py-3 rounded-lg hover:bg-blue-700 backdrop-blur-md border border-blue-400/50"
                                >
                                    Universal ID
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-120px); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(120px); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default QRScannerView;
