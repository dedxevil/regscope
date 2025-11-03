import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as chatService from '../services/chatService';
import type { ChatMessage, Run, Product, Country, User, AppView, ReportStatus } from '../types';
import type { Theme } from '../App';
import { MOCK_PRODUCTS, COUNTRIES } from '../constants';
import { fetchProductIngredients, fetchComplianceInfo } from '../api/complianceApi';
import Spinner from './Spinner';

// FIX: Add SpeechRecognition types to the global Window interface to resolve TypeScript errors.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- Component Props ---
interface ChatWidgetProps {
  theme: Theme;
  currentUser: User | null;
  onNavigate: (view: AppView) => void;
}

// --- SVG Icons ---
const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm.28-8.675c1.028.711 2.332 1.134 3.744 1.134.351 0 .698-.026 1.039-.077.117.048.23.107.369.187.3.176.701.446 1.2.81.409.299.988.01.988-.493v-1.461c.21-.136.408-.283.595-.442C25.345 22.025 26 20.715 26 19.31c0-.925-.28-1.79-.772-2.537a7.929 7.929 0 01-.627 1.53c.104.323.159.66.159 1.007 0 1.034-.488 2.01-1.352 2.742a4.679 4.679 0 01-.717.499.612.612 0 00-.311.531v.624c-.593-.38-1-.559-1.31-.559a.627.627 0 00-.104.009 5.696 5.696 0 01-2.602-.17 11.45 11.45 0 01-2.083.34zm-7.466-2.922a9.27 9.27 0 001.044.765v2.492c0 .63.725.99 1.236.616 1.41-1.03 2.39-1.612 2.635-1.67.566.09 1.144.135 1.728.135 5.2 0 9.458-3.607 9.458-8.12 0-4.514-4.259-8.121-9.458-8.121S6 10.107 6 14.62c0 2.21 1.03 4.271 2.814 5.783zm4.949.666c-.503 0-1.238.355-2.354 1.104v-1.437a.765.765 0 00-.39-.664 7.815 7.815 0 01-1.196-.833C8.37 18.01 7.55 16.366 7.55 14.62c0-3.61 3.516-6.588 7.907-6.588 4.392 0 7.907 2.978 7.907 6.588s-3.515 6.589-7.907 6.589c-.53 0-1.053-.044-1.564-.13a.784.784 0 00-.13-.01zm-2.337-4.916c.685 0 1.24-.55 1.24-1.226 0-.677-.555-1.226-1.24-1.226-.685 0-1.24.549-1.24 1.226 0 .677.555 1.226 1.24 1.226zm4.031 0c.685 0 1.24-.55 1.24-1.226 0-.677-.555-1.226-1.24-1.226-.685 0-1.24.549-1.24 1.226 0 .677.555 1.226 1.24 1.226zm4.031 0c.685 0 1.24-.55 1.24-1.226 0-.677-.555-1.226-1.24-1.226-.685 0-1.24.549-1.24 1.226 0 .677.555 1.226 1.24 1.226z"/>
    </svg>
);
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>);
const ExpandIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>);
const CollapseIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9 3.75 3.75M3.75 3.75h4.5m-4.5 0v4.5m12-4.5L20.25 9m0-5.25v4.5m0-4.5h-4.5" /></svg>);
const SendIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>);
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M12 4a1 1 0 0 0-1 1c0 1.692-2.046 2.54-3.243 1.343a1 1 0 1 0-1.414 1.414C7.54 8.954 6.693 11 5 11a1 1 0 1 0 0 2c1.692 0 2.54 2.046 1.343 3.243a1 1 0 0 0 1.414 1.414C8.954 16.46 11 17.307 11 19a1 1 0 1 0 2 0c0-1.692 2.046-2.54 3.243-1.343a1 1 0 1 0 1.414-1.414C16.46 15.046 17.307 13 19 13a1 1 0 1 0 0-2c-1.692 0-2.54-2.046-1.343-3.243a1 1 0 0 0-1.414-1.414C15.046 7.54 13 6.693 13 5a1 1 0 0 0-1-1zm-2.992.777a3 3 0 0 1 5.984 0 3 3 0 0 1 4.23 4.231 3 3 0 0 1 .001 5.984 3 3 0 0 1-4.231 4.23 3 3 0 0 1-5.984 0 3 3 0 0 1-4.231-4.23 3 3 0 0 1 0-5.984 3 3 0 0 1 4.231-4.231z" fill="currentColor"/><path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-2.828-.828a4 4 0 1 1 5.656 5.656 4 4 0 0 1-5.656-5.656z" fill="currentColor"/></svg>);
const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (<svg fill="currentColor" viewBox="-3.5 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}><path d="m8.4 16.8c2.65-.003 4.797-2.15 4.8-4.8v-7.2c0-2.651-2.149-4.8-4.8-4.8s-4.8 2.149-4.8 4.8v7.2c.003 2.65 2.15 4.797 4.8 4.8z"/><path d="m16.8 12v-2.4c0-.663-.537-1.2-1.2-1.2s-1.2.537-1.2 1.2v2.4c0 3.314-2.686 6-6 6s-6-2.686-6-6v-2.4c0-.663-.537-1.2-1.2-1.2s-1.2.537-1.2 1.2v2.4c.007 4.211 3.11 7.695 7.154 8.298l.046.006v1.296h-3.6c-.663 0-1.2.537-1.2 1.2s.537 1.2 1.2 1.2h9.6c.663 0 1.2-.537 1.2-1.2s-.537-1.2-1.2-1.2h-3.6v-1.296c4.09-.609 7.193-4.093 7.2-8.303z"/></svg>);
const BeakerIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M7 3.5A1.5 1.5 0 018.5 2h3A1.5 1.5 0 0113 3.5v1.866a1.5 1.5 0 01-.223.832l-1.334 2.334A1.5 1.5 0 0111.25 9.5h-2.5a1.5 1.5 0 01-1.193-.568L6.223 6.198A1.5 1.5 0 016 5.366V3.5ZM3.75 3a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H3.75z" clipRule="evenodd" /><path d="M6.28 8.036l.001-.002.002-.002A4.5 4.5 0 0110 5.5h.01a4.5 4.5 0 013.717 2.532l.002.002.001.002a.75.75 0 01-1.234.814l-.001-.002-.002-.003a3 3 0 00-2.48-1.68h-.01a3 3 0 00-2.48 1.68l-.002.003-.001.002a.75.75 0 01-1.234-.814ZM9.682 11.5a.75.75 0 01.636 1.026l-1.5 4.5a.75.75 0 01-1.436-.476l1.5-4.5a.75.75 0 01.8-.55z" /></svg>);
const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const PollingTimeout = 30000; // 30 seconds

const INITIAL_ASSISTANT_MESSAGE: ChatMessage = {
  id: 'assistant-initial-0',
  role: 'assistant',
  content: [{ type: 'text', text: { value: 'Hello! How can I help you today?' } }],
  created_at: Date.now() / 1000,
};

const statusTextStyles: Record<ReportStatus | 'Error', string> = {
    'Compliant': 'text-green-600 dark:text-spotify-green',
    'Non-Compliant': 'text-red-600 dark:text-red-400',
    'Requires Review': 'text-yellow-600 dark:text-yellow-400',
    'Error': 'text-gray-600 dark:text-spotify-gray',
};

const parseReport = (report: string): { status: ReportStatus } => {
    let status: ReportStatus = 'Requires Review';
    if (report.toLowerCase().includes('status:** **compliant')) status = 'Compliant';
    else if (report.toLowerCase().includes('status:** **non-compliant')) status = 'Non-Compliant';
    else if (report.toLowerCase().includes('status:** **restricted')) status = 'Requires Review';
    return { status };
};

const formatTimestamp = (timestampInSeconds: number) => {
    if (!timestampInSeconds) return '';
    const date = new Date(timestampInSeconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AssistantTypingIndicator: React.FC = () => (
    <div className="flex items-end gap-2 justify-start">
        <div className="px-4 py-3 rounded-xl bg-gray-200 dark:bg-spotify-light-dark text-gray-800 dark:text-gray-100 rounded-bl-none">
            <div className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-pulse"></span>
            </div>
        </div>
    </div>
);

const ChatWidget: React.FC<ChatWidgetProps> = ({ theme, currentUser, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isConfiguring, setIsConfiguring] = useState(false);
    const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
    const [backendUrl, setBackendUrl] = useState(chatService.getBaseUrl());
    const [tempUrl, setTempUrl] = useState(chatService.getBaseUrl());
    const [threadId, setThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isAssistantTyping, setIsAssistantTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<number | null>(null);
    const recognitionRef = useRef<any>(null);

    const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    useEffect(() => {
        if (!isSpeechSupported) {
            console.warn("Speech recognition not supported by this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
                setError("Microphone access denied. Please allow microphone access in browser settings.");
            } else {
                setError(`Speech recognition error: ${event.error}`);
            }
            setIsListening(false);
        };
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                setInputValue(prev => (prev ? prev.trim() + ' ' : '') + transcript);
            }
        };

        recognitionRef.current = recognition;

        return () => { if (recognitionRef.current) recognitionRef.current.abort(); };
    }, [isSpeechSupported]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(scrollToBottom, [messages, isAssistantTyping]);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const fetchMessages = useCallback(async (currentThreadId: string) => {
        try {
            const data = await chatService.getMessages(currentThreadId);
            const serverMessages = data.data.reverse();
            if (serverMessages.length > 0) {
              setMessages(serverMessages);
            } else {
              setMessages([INITIAL_ASSISTANT_MESSAGE]);
            }
            setError(null);
        } catch (err) {
            if (err instanceof Error) setError(`Failed to fetch messages: ${err.message}. Please check your backend URL.`);
        }
    }, []);

    useEffect(() => {
        const initializeChat = async () => {
            if (!backendUrl) {
                setIsConfiguring(true);
                return;
            }
            
            setIsLoading(true);
            let currentThreadId = localStorage.getItem('chatThreadId');
            try {
                if (!currentThreadId) {
                    const newThread = await chatService.createThread();
                    currentThreadId = newThread.id;
                    localStorage.setItem('chatThreadId', currentThreadId);
                }
                setThreadId(currentThreadId);
                await fetchMessages(currentThreadId);
            } catch (err) {
                if (err instanceof Error) setError(`Failed to initialize chat: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) initializeChat();
        return () => stopPolling();
    }, [isOpen, backendUrl, fetchMessages, stopPolling]);
    
    useEffect(() => {
        if (threadId && messages.length > 0) {
            localStorage.setItem(`chatMessages_${threadId}`, JSON.stringify(messages));
        }
    }, [messages, threadId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !threadId || isAssistantTyping) return;
        
        const userInput = inputValue;
        setInputValue('');
        
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: [{ type: 'text', text: { value: userInput } }],
            created_at: Date.now() / 1000,
        };
        setMessages(prev => [...prev, userMessage]);
        setIsAssistantTyping(true);
        setError(null);
        
        try {
            await chatService.sendMessage(threadId, userInput);
            const run: Run = await chatService.runAgent(threadId);

            const pollStartTime = Date.now();
            pollingRef.current = window.setInterval(async () => {
                if (Date.now() - pollStartTime > PollingTimeout) {
                    stopPolling();
                    setError("Sorry, the request timed out. Please try again.");
                    setIsAssistantTyping(false);
                    return;
                }

                const runStatus = await chatService.getRunStatus(threadId, run.id);
                if (runStatus.status === 'completed') {
                    stopPolling();
                    await fetchMessages(threadId);
                    setIsAssistantTyping(false);
                } else if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
                    stopPolling();
                    setError(`The assistant failed to process the request (status: ${runStatus.status}).`);
                    setIsAssistantTyping(false);
                }
            }, 2000);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            setIsAssistantTyping(false);
            stopPolling();
        }
    };

    const handleProductSearchSubmit = async (productName: string, countryCode: string) => {
        setIsProductSearchOpen(false);
        const country = COUNTRIES.find(c => c.code === countryCode);
        if (!productName || !country) return;
    
        const userMessage: ChatMessage = {
            id: `user-prod-${Date.now()}`,
            role: 'user',
            content: [{ type: 'text', text: { value: `Check compliance for "${productName}" in ${country.name}.` } }],
            created_at: Date.now() / 1000,
        };
        setMessages(prev => [...prev, userMessage]);
        setIsAssistantTyping(true);
        setError(null);
    
        try {
            const { ingredients } = await fetchProductIngredients(productName);
            const reportPromises = ingredients.map(ing => fetchComplianceInfo(ing, country.name));
            const reportResults = await Promise.allSettled(reportPromises);
            
            const results = ingredients.map((ing, i) => {
                const result = reportResults[i];
                if (result.status === 'fulfilled') {
                    const { status } = parseReport(result.value);
                    return { name: ing, status };
                } else {
                    return { name: ing, status: 'Error' as const };
                }
            });
    
            let overallStatus: ReportStatus | 'Error' = 'Compliant';
            if (results.some(r => r.status === 'Error')) overallStatus = 'Error';
            else if (results.some(r => r.status === 'Non-Compliant')) overallStatus = 'Non-Compliant';
            else if (results.some(r => r.status === 'Requires Review')) overallStatus = 'Requires Review';
    
            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: [{ type: 'text', text: { value: '' } }], // Content is handled by metadata
                created_at: Date.now() / 1000,
                metadata: {
                    is_product_report: true,
                    report_data: {
                        productName,
                        countryName: country.name,
                        overallStatus,
                        results,
                    }
                }
            };
            setMessages(prev => [...prev, assistantMessage]);
    
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to perform product search: ${errorMessage}`);
            const assistantErrorMessage: ChatMessage = {
                id: `assistant-error-${Date.now()}`,
                role: 'assistant',
                content: [{ type: 'text', text: { value: `Sorry, I couldn't complete the search. ${errorMessage}` } }],
                created_at: Date.now() / 1000,
            };
            setMessages(prev => [...prev, assistantErrorMessage]);
        } finally {
            setIsAssistantTyping(false);
        }
    };

    const handleSaveConfig = () => {
        if (chatService.setBaseUrl(tempUrl)) {
            setBackendUrl(tempUrl);
            setIsConfiguring(false);
            setError(null);
            localStorage.removeItem('chatThreadId');
            setThreadId(null);
            setMessages([]);
        } else {
            setError("Invalid URL. Please enter a valid URL starting with http:// or https://");
        }
    };
    
    const clearChatSession = () => {
        const currentThreadId = localStorage.getItem('chatThreadId');
        localStorage.removeItem('chatThreadId');
        if (currentThreadId) localStorage.removeItem(`chatMessages_${currentThreadId}`);
        setThreadId(null);
        setMessages([]);
    };

    const handleNewConversation = async () => {
        stopPolling();
        setIsAssistantTyping(false);
        setError(null);
        clearChatSession();
        setIsLoading(true);
        try {
            const newThread = await chatService.createThread();
            localStorage.setItem('chatThreadId', newThread.id);
            setThreadId(newThread.id);
            setMessages([INITIAL_ASSISTANT_MESSAGE]);
        } catch (err) {
            if (err instanceof Error) setError(`Failed to create a new chat thread: ${err.message}`);
        }
        setIsLoading(false);
    };

    const handleToggleListening = () => {
        if (!isSpeechSupported || !recognitionRef.current) return;
        if (isListening) recognitionRef.current.stop();
        else {
            setError(null);
            recognitionRef.current.start();
        }
    };
    
    const handleDocumentUploadClick = () => {
        onNavigate('regulatory_documents');
        setIsOpen(false);
    };

    const ProductSearchModal = () => {
        const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0].name);
        const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0].code);
    
        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            handleProductSearchSubmit(selectedProduct, selectedCountry);
        };
    
        return (
            <div className="absolute inset-0 bg-white/80 dark:bg-spotify-card/80 backdrop-blur-sm flex items-center justify-center z-20 p-4" onClick={() => setIsProductSearchOpen(false)}>
                <div className="bg-white dark:bg-spotify-light-dark rounded-lg shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Product Compliance Search</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="product-select" className="block text-sm font-medium text-gray-700 dark:text-spotify-gray">Product</label>
                            <select id="product-select" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-card focus:outline-none focus:ring-spotify-green focus:border-spotify-green sm:text-sm rounded-md">
                                {MOCK_PRODUCTS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 dark:text-spotify-gray">Country</label>
                            <select id="country-select" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-card focus:outline-none focus:ring-spotify-green focus:border-spotify-green sm:text-sm rounded-md">
                                 {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                             <button type="button" onClick={() => setIsProductSearchOpen(false)} className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                             <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-spotify-green hover:bg-blue-700 dark:hover:bg-green-500">Check Compliance</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    if (!isOpen) {
        return ( <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-blue-600 dark:bg-spotify-green text-white shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center" aria-label="Open chat"><ChatBubbleIcon className="w-8 h-8" /></button>);
    }

    const containerClasses = isExpanded ? "fixed inset-0 z-50 flex items-center justify-center" : "fixed bottom-6 right-6 z-50";
    const chatWindowClasses = `bg-white dark:bg-spotify-card shadow-2xl rounded-lg flex flex-col transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10 ${isExpanded ? 'relative z-10 w-full max-w-2xl h-full max-h-[85vh]' : 'w-96 h-[600px]'}`;

    return (
        <div className={containerClasses} role="dialog" aria-modal={isExpanded} aria-label="Compliance Assistant Chat">
            {isExpanded && <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsExpanded(false)}></div>}
            <div className={chatWindowClasses}>
                {isProductSearchOpen && <ProductSearchModal />}
                {isConfiguring ? (
                    <>
                        <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Configure Backend</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-gray-800 dark:text-spotify-gray dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-spotify-light-dark" aria-label="Close"><CloseIcon className="w-5 h-5" /></button>
                        </header>
                        <div className="flex flex-col flex-grow p-6 space-y-4">
                             <p className="text-sm text-gray-600 dark:text-spotify-gray">Please provide the public URL for the chat backend service.</p>
                             <input type="url" value={tempUrl} onChange={e => setTempUrl(e.target.value)} placeholder="https://your-backend-url.io" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-md focus:ring-spotify-green focus:border-spotify-green"/>
                             {error && <p className="text-sm text-red-500">{error}</p>}
                             <div className="flex-grow"></div>
                             <div className="flex justify-end space-x-2">
                                 {backendUrl && <button onClick={() => setIsConfiguring(false)} className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>}
                                 <button onClick={handleSaveConfig} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-spotify-green hover:bg-blue-700 dark:hover:bg-green-500">Save</button>
                             </div>
                         </div>
                    </>
                ) : (
                    <>
                        <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Compliance Assistant</h2>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => setIsConfiguring(true)} className="p-2 text-gray-500 hover:text-gray-800 dark:text-spotify-gray dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-spotify-light-dark" aria-label="Settings"><SettingsIcon className="w-5 h-5" /></button>
                                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-500 hover:text-gray-800 dark:text-spotify-gray dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-spotify-light-dark" aria-label={isExpanded ? 'Collapse' : 'Expand'}>{isExpanded ? <CollapseIcon className="w-5 h-5"/> : <ExpandIcon className="w-5 h-5"/>}</button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-gray-800 dark:text-spotify-gray dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-spotify-light-dark" aria-label="Close"><CloseIcon className="w-5 h-5" /></button>
                            </div>
                        </header>
                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 dark:bg-spotify-green text-white rounded-br-none px-4 py-2' : 'bg-gray-200 dark:bg-spotify-light-dark text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                                        {msg.metadata?.is_product_report && msg.metadata.report_data ? (
                                            <div className="p-2">
                                                <h3 className="font-bold text-base">Compliance Report</h3>
                                                <p className="text-sm opacity-90">{msg.metadata.report_data.productName} in {msg.metadata.report_data.countryName}</p>
                                                <div className="my-2">
                                                    <span className="font-semibold text-sm">Overall Status: </span>
                                                    <span className={`font-bold text-sm ${statusTextStyles[msg.metadata.report_data.overallStatus]}`}>{msg.metadata.report_data.overallStatus}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm border-t border-black/10 dark:border-white/10 pt-2 mt-2 mb-1">Ingredient Breakdown</h4>
                                                    <ul className="text-sm space-y-1">
                                                        {msg.metadata.report_data.results.map(res => (
                                                            <li key={res.name} className="flex justify-between items-center">
                                                                <span className="opacity-90">{res.name}</span>
                                                                <span className={`font-semibold ${statusTextStyles[res.status]}`}>{res.status}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="px-4 py-2">{msg.content[0]?.text?.value}</div>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 px-1">
                                        {formatTimestamp(msg.created_at)}
                                    </div>
                                </div>
                            ))}
                            {(isAssistantTyping || isLoading) && <AssistantTypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>
                        {error && <div className="px-4 py-2 text-sm text-red-500 bg-red-100 dark:bg-red-900/50 border-t border-gray-200 dark:border-gray-700">{error}</div>}
                        <footer className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                             <div className="flex flex-wrap gap-2 mb-3">
                                <button onClick={() => setIsProductSearchOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900">
                                    <BeakerIcon className="w-4 h-4" />
                                    Product Search
                                </button>
                                {currentUser?.role === 'admin' && (
                                    <button onClick={handleDocumentUploadClick} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900">
                                        <DocumentIcon className="w-4 h-4" />
                                        Document Upload
                                    </button>
                                )}
                              </div>
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        placeholder={isListening ? 'Listening...' : "Ask about compliance..."}
                                        className="w-full flex-grow px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-full focus:ring-spotify-green focus:border-spotify-green pr-10"
                                        disabled={isAssistantTyping}
                                    />
                                    {isSpeechSupported && (
                                        <button
                                            type="button"
                                            onClick={handleToggleListening}
                                            disabled={isAssistantTyping}
                                            className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors duration-200 ${
                                                isListening 
                                                ? 'text-red-500 animate-pulse' 
                                                : 'text-gray-500 dark:text-spotify-gray hover:text-gray-800 dark:hover:text-white'
                                            }`}
                                            aria-label={isListening ? 'Stop recording' : 'Start recording'}
                                        >
                                            <MicrophoneIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                <button type="submit" className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-600 dark:bg-spotify-green text-white flex items-center justify-center disabled:opacity-50" disabled={!inputValue.trim() || isAssistantTyping} aria-label="Send message"><SendIcon className="w-5 h-5"/></button>
                            </form>
                             <button onClick={handleNewConversation} className="text-xs text-center w-full mt-2 text-gray-500 dark:text-spotify-gray hover:underline">Start New Conversation</button>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatWidget;
