import React, { useState, useEffect, useRef } from 'react';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;

interface Message {
    id: number;
    sender: 'user' | 'team';
    text: string;
    timestamp: string;
}

const MessageCenterView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const playNotificationSound = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioContext = audioContextRef.current;
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
    };
    
    useEffect(() => {
        setMessages([
            { id: 1, sender: 'team', text: 'Welcome to the $KILL Support Center! How can we help you today?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            { id: 2, sender: 'team', text: 'Tip: The more ratings you get, the more your profile will be recommended to others. Keep up the great work!', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        
        const timer = setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'team',
                text: "You've received a new invoice from Roki Samuna. You can view it in 'My Workshop' > 'My Documents'.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            playNotificationSound();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const userMessage: Message = {
            id: Date.now(),
            sender: 'user',
            text: newMessage.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');

        setTimeout(() => {
            const teamReply: Message = {
                id: Date.now() + 1,
                sender: 'team',
                text: 'Thank you for your message. An agent will get back to you shortly.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, teamReply]);
            playNotificationSound();
        }, 1500);
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-gray-100 h-screen flex flex-col font-sans">
            <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={onBack} className="text-gray-600">
                    <BackIcon />
                </button>
                <h1 className="text-xl font-bold text-gray-800">$KILL Support</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-navy text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none shadow-sm'}`}>
                            <p className="text-sm" style={{ wordBreak: 'break-word' }}>{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-gray-300' : 'text-gray-400'} text-right`}>{msg.timestamp}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-2 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full p-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
                    />
                    <button type="submit" className="p-3 bg-brand-navy text-white rounded-full flex-shrink-0 active-scale">
                        <SendIcon />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default MessageCenterView;