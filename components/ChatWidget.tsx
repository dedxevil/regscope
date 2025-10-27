import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as chatService from '../services/chatService';
import type { ChatMessage, Run } from '../types';
import type { Theme } from '../App';

// FIX: Add SpeechRecognition types to the global Window interface to resolve TypeScript errors.
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- SVG Icons ---
const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 512.001 512.001" className={className} fill="currentColor">
    <path d="M171.748,481.049H13.701c-4.494,0-8.702-2.203-11.261-5.898c-2.559-3.693-3.146-8.407-1.567-12.615
        l26.666-71.104c-10.861-22.006-16.576-46.475-16.576-71.168c0-36.64,12.655-72.489,35.632-100.943
        c22.633-28.028,54.339-47.851,89.273-55.816c7.381-1.677,14.722,2.936,16.405,10.313c1.683,7.377-2.935,14.722-10.313,16.405
        c-60.995,13.907-103.594,67.382-103.594,130.04c0,22.266,5.593,44.3,16.175,63.717c1.903,3.494,2.195,7.643,0.797,11.368
        l-21.863,58.297h138.274c47.548,0,91.859-25.62,115.639-66.866c3.779-6.555,12.155-8.806,18.713-5.026
        c6.555,3.78,8.806,12.157,5.026,18.713C282.468,450.172,229.061,481.049,171.748,481.049z"/>
    {/* Background path removed for a cleaner look */}
    <g>
        <path d="M498.298,352.52H340.252c-88.658,0-160.785-72.129-160.785-160.785S251.596,30.951,340.254,30.951
            c88.657,0,160.785,72.129,160.785,160.785c0,24.694-5.715,49.164-16.579,71.168l26.668,71.104
            c1.577,4.208,0.993,8.922-1.567,12.615C507.002,350.317,502.794,352.52,498.298,352.52z M340.254,58.354
            c-73.548,0-133.382,59.836-133.382,133.382s59.834,133.382,133.382,133.382h138.274l-21.865-58.297
            c-1.398-3.725-1.106-7.874,0.797-11.368c10.583-19.418,16.176-41.451,16.176-63.717C473.634,118.19,413.799,58.354,340.254,58.354z
            "/>
        <path d="M327.684,213.956c0,6.786,5.474,11.002,14.286,11.002c5.439,0,14.069-2.987,14.069-11.002
            c0-12.993,0.778-29.114,1.53-44.702c0.755-15.622,1.535-31.776,1.535-44.835c0-8.669-7.047-14.724-17.134-14.724
            c-10.377,0-17.35,5.916-17.35,14.724c0,13.059,0.78,29.213,1.533,44.835C326.906,184.842,327.684,200.963,327.684,213.956z"/>
        <path d="M342.191,237.324c-10.221,0-18.228,8.006-18.228,18.227c0,10.05,8.177,18.227,18.228,18.227
            c9.592,0,18.008-8.517,18.008-18.227C360.197,245.671,351.952,237.324,342.191,237.324z"/>
    </g>
    </svg>
);
const CloseIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>);
const ExpandIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>);
const CollapseIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9 3.75 3.75M3.75 3.75h4.5m-4.5 0v4.5m12-4.5L20.25 9m0-5.25v4.5m0-4.5h-4.5" /></svg>);
const SendIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg>);
const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M12 4a1 1 0 0 0-1 1c0 1.692-2.046 2.54-3.243 1.343a1 1 0 1 0-1.414 1.414C7.54 8.954 6.693 11 5 11a1 1 0 1 0 0 2c1.692 0 2.54 2.046 1.343 3.243a1 1 0 0 0 1.414 1.414C8.954 16.46 11 17.307 11 19a1 1 0 1 0 2 0c0-1.692 2.046-2.54 3.243-1.343a1 1 0 1 0 1.414-1.414C16.46 15.046 17.307 13 19 13a1 1 0 1 0 0-2c-1.692 0-2.54-2.046-1.343-3.243a1 1 0 0 0-1.414-1.414C15.046 7.54 13 6.693 13 5a1 1 0 0 0-1-1zm-2.992.777a3 3 0 0 1 5.984 0 3 3 0 0 1 4.23 4.231 3 3 0 0 1 .001 5.984 3 3 0 0 1-4.231 4.23 3 3 0 0 1-5.984 0 3 3 0 0 1-4.231-4.23 3 3 0 0 1 0-5.984 3 3 0 0 1 4.231-4.231z" fill="currentColor"/><path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-2.828-.828a4 4 0 1 1 5.656 5.656 4 4 0 0 1-5.656-5.656z" fill="currentColor"/></svg>);
const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (<svg fill="currentColor" viewBox="-3.5 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}><path d="m8.4 16.8c2.65-.003 4.797-2.15 4.8-4.8v-7.2c0-2.651-2.149-4.8-4.8-4.8s-4.8 2.149-4.8 4.8v7.2c.003 2.65 2.15 4.797 4.8 4.8z"/><path d="m16.8 12v-2.4c0-.663-.537-1.2-1.2-1.2s-1.2.537-1.2 1.2v2.4c0 3.314-2.686 6-6 6s-6-2.686-6-6v-2.4c0-.663-.537-1.2-1.2-1.2s-1.2.537-1.2 1.2v2.4c.007 4.211 3.11 7.695 7.154 8.298l.046.006v1.296h-3.6c-.663 0-1.2.537-1.2 1.2s.537 1.2 1.2 1.2h9.6c.663 0 1.2-.537 1.2-1.2s-.537-1.2-1.2-1.2h-3.6v-1.296c4.09-.609 7.193-4.093 7.2-8.303z"/></svg>);

const PollingTimeout = 30000; // 30 seconds

// Helper function to format unix timestamp (in seconds) to a readable time string
const formatTimestamp = (timestampInSeconds: number) => {
    if (!timestampInSeconds) return '';
    // Multiply by 1000 to convert seconds to milliseconds for the Date object
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

const ChatWidget: React.FC<{ theme: Theme }> = ({ theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isConfiguring, setIsConfiguring] = useState(false);
    // Read the persisted backend URL from localStorage on component initializaton.
    const [backendUrl, setBackendUrl] = useState(chatService.getBaseUrl());
    const [tempUrl, setTempUrl] = useState(chatService.getBaseUrl());
    const [threadId, setThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isAssistantTyping, setIsAssistantTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
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

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
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
            setMessages(data.data.reverse());
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(`Failed to fetch messages: ${err.message}. Please check your backend URL.`);
            }
        }
    }, []);

    const [isLoading, setIsLoading] = useState(false);

    // Effect to initialize the chat when the widget opens, loading from localStorage if a thread exists.
    useEffect(() => {
        const initializeChat = async () => {
            if (!backendUrl) {
                setIsConfiguring(true);
                return;
            }
            
            let currentThreadId = localStorage.getItem('chatThreadId');
    
            if (currentThreadId) {
                // A thread exists, load its messages from local storage first to prevent flicker.
                const storedMessagesJSON = localStorage.getItem(`chatMessages_${currentThreadId}`);
                if (storedMessagesJSON) {
                    try {
                        setMessages(JSON.parse(storedMessagesJSON));
                    } catch (e) {
                        console.error("Failed to parse messages from localStorage", e);
                        localStorage.removeItem(`chatMessages_${currentThreadId}`);
                    }
                }
                setThreadId(currentThreadId);
                // Then, sync with the server to get the latest messages.
                setIsLoading(true);
                await fetchMessages(currentThreadId);
                setIsLoading(false);
            } else {
                // No thread exists, create a new one.
                setIsLoading(true);
                try {
                    const newThread = await chatService.createThread();
                    currentThreadId = newThread.id;
                    localStorage.setItem('chatThreadId', currentThreadId);
                    setThreadId(currentThreadId);
                } catch (err) {
                    if (err instanceof Error) setError(`Failed to create a new chat thread: ${err.message}`);
                }
                setIsLoading(false);
            }
        };

        if (isOpen) {
            initializeChat();
        }
        
        // Cleanup function: stop any active polling when the widget closes or dependencies change.
        return () => {
            stopPolling();
        };
    }, [isOpen, backendUrl, fetchMessages, stopPolling]);
    
    // Effect to save messages to localStorage whenever they change.
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

    const handleSaveConfig = () => {
        // Attempt to persist the new URL to localStorage via the service.
        if (chatService.setBaseUrl(tempUrl)) {
            setBackendUrl(tempUrl);
            setIsConfiguring(false);
            setError(null);
            // Re-initialize by removing old thread
            localStorage.removeItem('chatThreadId');
            setThreadId(null);
            setMessages([]);
        } else {
            setError("Invalid URL. Please enter a valid URL starting with http:// or https://");
        }
    };
    
    /**
     * Clears all data related to the current chat session from local storage
     * and resets the component's state to ensure a clean start.
     */
    const clearChatSession = () => {
        // Retrieve the current thread ID from local storage before clearing it.
        const currentThreadId = localStorage.getItem('chatThreadId');
        
        // Clear the main thread ID pointer.
        localStorage.removeItem('chatThreadId');

        // If a thread ID existed, also clear its associated messages.
        if (currentThreadId) {
            localStorage.removeItem(`chatMessages_${currentThreadId}`);
        }

        // Reset component state for a clean start.
        setThreadId(null);
        setMessages([]);
    };

    const handleNewConversation = async () => {
        stopPolling();
        setIsAssistantTyping(false);
        setError(null);

        // ** CRITICAL STEP **
        // Clear all persisted data for the previous conversation from local storage.
        clearChatSession();

        setIsLoading(true);
        try {
            const newThread = await chatService.createThread();
            localStorage.setItem('chatThreadId', newThread.id);
            setThreadId(newThread.id);
        } catch (err) {
            if (err instanceof Error) setError(`Failed to create a new chat thread: ${err.message}`);
        }
        setIsLoading(false);
    };

    const handleToggleListening = () => {
        if (!isSpeechSupported || !recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            setError(null);
            recognitionRef.current.start();
        }
    };

    if (!isOpen) {
        return ( <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-blue-600 dark:bg-spotify-green text-white shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center" aria-label="Open chat"><ChatBubbleIcon className="w-12 h-12" /></button>);
    }

    const containerClasses = isExpanded
        ? "fixed inset-0 z-50 flex items-center justify-center"
        : "fixed bottom-6 right-6 z-50";

    const chatWindowClasses = `bg-white dark:bg-spotify-card shadow-2xl rounded-lg flex flex-col transition-all duration-300 ring-1 ring-black/5 dark:ring-white/10 ${isExpanded ? 'relative z-10 w-full max-w-2xl h-full max-h-[85vh]' : 'w-96 h-[600px]'}`;

    return (
        <div className={containerClasses} role="dialog" aria-modal={isExpanded} aria-label="Compliance Assistant Chat">
            {isExpanded && <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsExpanded(false)}></div>}
            <div className={chatWindowClasses}>
                {isConfiguring ? (
                    <>
                        <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Configure Backend</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-gray-800 dark:text-spotify-gray dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-spotify-light-dark" aria-label="Close">
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </header>
                        <div className="flex flex-col flex-grow p-6 space-y-4">
                             <p className="text-sm text-gray-600 dark:text-spotify-gray">Please provide the public URL (e.g., from ngrok) for the chat backend service.</p>
                             <input type="url" value={tempUrl} onChange={e => setTempUrl(e.target.value)} placeholder="https://your-ngrok-url.io" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-spotify-light-dark text-gray-900 dark:text-gray-100 rounded-md focus:ring-spotify-green focus:border-spotify-green"/>
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
                                    <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-blue-600 dark:bg-spotify-green text-white rounded-br-none' : 'bg-gray-200 dark:bg-spotify-light-dark text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                                        {msg.content[0]?.text?.value}
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
                            <button onClick={handleNewConversation} className="text-xs text-center w-full mb-2 text-gray-500 dark:text-spotify-gray hover:underline">Start New Conversation</button>
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
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatWidget;