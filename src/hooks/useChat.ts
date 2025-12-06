'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';

export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    senderRole: 'retailer' | 'distributor' | 'system';
    senderName: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export interface Conversation {
    _id: string;
    retailerId: string;
    distributorId: string;
    retailerName: string;
    distributorName: string;
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCountRetailer: number;
    unreadCountDistributor: number;
}

export function useChat(conversationId?: string) {
    const { token, user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);

    // Fetch all conversations
    const fetchConversations = useCallback(async () => {
        try {
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/chat/conversations', {
                headers,
            });

            const data = await response.json();
            if (data.success) {
                setConversations(data.conversations);

                // Calculate total unread
                const unread = data.conversations.reduce((sum: number, conv: Conversation) => {
                    return sum + (user?.role === 'retailer'
                        ? conv.unreadCountRetailer
                        : conv.unreadCountDistributor);
                }, 0);
                setTotalUnread(unread);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    }, [token, user]);

    // Fetch messages for a conversation
    const fetchMessages = useCallback(async () => {
        if (!conversationId) return;

        setLoading(true);
        try {
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(
                `/api/chat/messages?conversationId=${conversationId}`,
                {
                    headers,
                }
            );

            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    }, [conversationId, token]);

    // Send a message
    const sendMessage = useCallback(async (messageText: string) => {
        if (!conversationId || !messageText.trim()) return;

        setSending(true);
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    conversationId,
                    message: messageText.trim(),
                }),
            });

            const data = await response.json();
            if (data.success) {
                // Add message to local state immediately
                setMessages(prev => [...prev, data.message]);
                // Refresh conversations to update last message
                fetchConversations();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    }, [conversationId, token, fetchConversations]);

    // Create or get conversation
    const createConversation = useCallback(async (otherUserId: string, otherUserName: string) => {
        console.log('🏗️ createConversation called with:', { otherUserId, otherUserName, hasToken: !!token });
        if (!token) console.warn('⚠️ No token available for createConversation, relying on cookies...');

        try {
            console.log('🚀 Sending create conversation request...');
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    otherUserId,
                    otherUserName,
                }),
            });

            const data = await response.json();
            console.log('✅ Create conversation response:', data);

            if (data.success) {
                fetchConversations();
                return data.conversation;
            } else {
                console.error('❌ Failed to create conversation:', data.message);
            }
        } catch (error) {
            console.error('❌ Error creating conversation:', error);
        }
        return null;
    }, [token, fetchConversations]);

    // Auto-refresh messages when conversation is active
    useEffect(() => {
        if (conversationId) {
            fetchMessages();

            // Poll for new messages every 5 seconds
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [conversationId, fetchMessages]);

    // Auto-refresh conversations list
    useEffect(() => {
        fetchConversations();

        // Poll for new conversations every 10 seconds
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    return {
        messages,
        conversations,
        loading,
        sending,
        totalUnread,
        sendMessage,
        createConversation,
        fetchConversations,
        fetchMessages,
    };
}
