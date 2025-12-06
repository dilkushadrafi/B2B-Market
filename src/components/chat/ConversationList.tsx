'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/dateUtils';
import type { Conversation } from '@/hooks/useChat';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId?: string;
    onSelect: (conversationId: string) => void;
    userRole: 'retailer' | 'distributor';
}

export function ConversationList({ conversations, selectedId, onSelect, userRole }: ConversationListProps) {
    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <MessageCircle className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No conversations yet</h3>
                <p className="text-sm text-slate-500">
                    Start a conversation from the products or orders page
                </p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            {conversations.map((conversation, index) => {
                const otherUserName = userRole === 'retailer'
                    ? conversation.distributorName
                    : conversation.retailerName;

                const unreadCount = userRole === 'retailer'
                    ? conversation.unreadCountRetailer
                    : conversation.unreadCountDistributor;

                const isSelected = conversation._id === selectedId;

                return (
                    <motion.div
                        key={conversation._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelect(conversation._id)}
                        className={`p-4 border-b border-slate-200 cursor-pointer transition-all hover:bg-slate-50 ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {otherUserName.charAt(0).toUpperCase()}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-slate-900 truncate">
                                        {otherUserName}
                                    </h3>
                                    {unreadCount > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>

                                {conversation.lastMessage && (
                                    <p className="text-sm text-slate-600 truncate mb-1">
                                        {conversation.lastMessage}
                                    </p>
                                )}

                                {conversation.lastMessageTime && (
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(conversation.lastMessageTime).getTime())}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
