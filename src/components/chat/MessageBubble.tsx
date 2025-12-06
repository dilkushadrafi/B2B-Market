'use client';

import { motion } from 'framer-motion';
import { Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/dateUtils';
import type { Message } from '@/hooks/useChat';

interface MessageBubbleProps {
    message: Message;
    isMine: boolean;
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
    const isSystem = message.senderRole === 'system';

    if (isSystem) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-4"
            >
                <div className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full">
                    {message.message}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-6 group`}
        >
            <div className={`flex items-end gap-2 max-w-[80%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar for received messages */}
                {!isMine && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                        {message.senderName?.charAt(0).toUpperCase() || '?'}
                    </div>
                )}

                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    {/* Sender name for received messages */}
                    {!isMine && (
                        <span className="text-[10px] text-slate-400 mb-1 ml-1">
                            {message.senderName}
                        </span>
                    )}

                    {/* Message Bubble */}
                    <div
                        className={`px-5 py-3 rounded-2xl shadow-sm relative ${isMine
                            ? 'bg-gradient-to-tr from-blue-600 to-purple-600 text-white rounded-br-none'
                            : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                            } transition-transform hover:scale-[1.01]`}
                    >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.message}
                        </p>
                    </div>

                    {/* Timestamp & Status */}
                    <div className={`flex items-center gap-1.5 mt-1.5 text-[10px] ${isMine ? 'mr-1' : 'ml-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <span className="text-slate-400">
                            {formatDistanceToNow(new Date(message.createdAt).getTime())}
                        </span>
                        {isMine && (
                            <span className={message.read ? "text-blue-500" : "text-slate-300"}>
                                {message.read ? (
                                    <CheckCheck className="w-3 h-3" />
                                ) : (
                                    <Check className="w-3 h-3" />
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
