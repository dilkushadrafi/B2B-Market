'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, X, ArrowLeft } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { useChat, type Message } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';

interface ChatWindowProps {
    conversationId: string;
    otherUserName: string;
    onClose?: () => void;
}

export function ChatWindow({ conversationId, otherUserName, onClose }: ChatWindowProps) {
    const { user } = useAuthStore();
    const { messages, loading, sending, sendMessage } = useChat(conversationId);
    const [inputMessage, setInputMessage] = useState('');
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    // Focus input on mount - REMOVED to prevent auto-jump
    // useEffect(() => {
    //    inputRef.current?.focus();
    // }, [conversationId]);

    const handleSend = async () => {
        if (!inputMessage.trim() || sending) return;

        await sendMessage(inputMessage);
        setInputMessage('');
        inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            {/* Header */}
            <div className="flex items-center px-6 py-4 border-b border-white/50 bg-white/80 backdrop-blur-md z-10 sticky top-0 shadow-sm">

                {onClose && (
                    <button
                        onClick={onClose}
                        className="mr-3 p-2 -ml-2 rounded-full hover:bg-slate-200/50 transition-colors text-slate-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                            {otherUserName.charAt(0).toUpperCase()}
                        </div>
                        {/* Online Indicator (Mock) */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 leading-tight">{otherUserName}</h2>
                        <p className="text-xs text-slate-500 font-medium">
                            {user?.role === 'retailer' ? 'Distributor' : 'Retailer'} • Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 z-0"
            >
                {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
                        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-indigo-400 ml-1" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Say Hello! 👋</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                            Start the conversation with {otherUserName} and discuss your business.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message._id}
                                message={message}
                                isMine={message.senderId === user?._id}
                            />
                        ))}
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="px-4 py-4 md:px-6 md:py-6 bg-transparent z-10">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-2 flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef as any}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            disabled={sending}
                            rows={1}
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                            className="w-full px-4 py-3 rounded-xl border-none focus:ring-0 resize-none bg-transparent text-slate-900 placeholder:text-slate-400 max-h-32"
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                            }}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        disabled={!inputMessage.trim() || sending}
                        className={`p-3 rounded-xl flex items-center justify-center transition-all duration-200 ${!inputMessage.trim()
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:shadow-lg'
                            }`}
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </motion.button>
                </div>
                <div className="flex justify-between px-2 mt-2">
                    <p className="text-[10px] text-slate-400">
                        Press Enter to send
                    </p>
                    <p className="text-[10px] text-slate-400">
                        {inputMessage.length}/500
                    </p>
                </div>
            </div>
        </div>
    );
}
