
import React, { useState } from 'react';
import * as api from '../services/api';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (data: api.VerifyOtpResponse, phone: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const input = e.target.value.replace(/\D/g, '');
    setPhone(input.slice(0, 9)); // Only 9 digits after +254
  };
  
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const input = e.target.value.replace(/\D/g, '');
    setOtp(input.slice(0, 4));
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 9) {
      setError("Please enter a valid 9-digit phone number.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.sendOtp(`254${phone}`);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
        setError("Please enter the 4-digit OTP.");
        return;
    }
    setIsLoading(true);
    setError('');
    try {
        const fullPhone = `254${phone}`;
        const response = await api.verifyOtp(fullPhone, otp);
        onLogin(response, fullPhone);
    } catch (err: any) {
        setError(err.message || "Login failed.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDemoGatemanLogin = () => {
      setPhone('711111111');
      setOtp('1234');
      setStep(2);
      // Auto-submit slightly delayed to allow UI to update
      setTimeout(() => {
          const fullPhone = '254711111111';
          api.verifyOtp(fullPhone, '1234').then(response => onLogin(response, fullPhone));
      }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sign In / Sign Up</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
        
        {step === 1 && (
          <form onSubmit={handleContinue}>
            <p className="text-gray-600 mb-4">Enter your phone number to continue.</p>
            <div className="mb-6">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="flex items-center mt-1 bg-gray-100 rounded-lg shadow-inner focus-within:ring-2 focus-within:ring-brand-gold">
                  <span className="px-3 text-gray-500 border-r border-gray-300">+254</span>
                  <input 
                      type="tel" 
                      id="phone" 
                      value={phone} 
                      onChange={handlePhoneChange} 
                      required 
                      autoFocus
                      placeholder="722123456"
                      className="block w-full pl-3 pr-3 py-3 bg-transparent focus:outline-none sm:text-sm"
                  />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-brand-gold text-brand-navy font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-colors disabled:bg-gray-400 active-scale">
              {isLoading ? 'Sending...' : 'Continue'}
            </button>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={handleDemoGatemanLogin} className="w-full text-xs text-blue-600 font-semibold hover:underline">
                    Demo: Login as Security Guard
                </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleConfirm}>
            <p className="text-gray-600 mb-2">Enter the 4-digit OTP sent to <span className="font-semibold">+254{phone}</span>.</p>
            <button type="button" onClick={() => { setStep(1); setError(''); }} className="text-sm text-blue-600 hover:underline mb-4">Change number</button>
            <div className="mb-6">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP Code</label>
              <input 
                type="tel" 
                id="otp" 
                maxLength={4} 
                value={otp} 
                onChange={handleOtpChange} 
                required 
                autoFocus 
                className="mt-1 block w-full text-center tracking-[1em] text-lg px-3 py-3 border-0 bg-gray-100 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-gold sm:text-sm"
              />
              <p className="text-xs text-center text-gray-500 mt-2">(Superadmin OTP: 3232)</p>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-brand-gold text-brand-navy font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-colors disabled:bg-gray-400 active-scale">
                {isLoading ? 'Verifying...' : 'Confirm & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;