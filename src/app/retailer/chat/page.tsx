'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useChat } from '@/hooks/useChat';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageCircle, ArrowLeft, Plus, X, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Distributor {
    _id: string;
    businessName: string;
    email: string;
}

function ChatContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated, token } = useAuthStore();
    const { conversations, createConversation } = useChat();
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingUsers, setFetchingUsers] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Auto-hide toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Check authentication
    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.push('/login');
            return;
        }
        if (user.role !== 'retailer') {
            router.push('/distributor/dashboard');
        }
    }, [isAuthenticated, user, router]);

    // Fetch all distributors when modal opens
    useEffect(() => {
        const fetchDistributors = async () => {
            if (!showNewChatModal) return;

            setFetchingUsers(true);
            console.log('🔍 Fetching distributors...');
            if (!token) console.warn('⚠️ No token in store, relying on cookies...');

            try {
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch('/api/users?role=distributor', {
                    headers,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('✅ Distributors response:', data);
                console.log('📊 Number of distributors:', data.users?.length || 0);

                if (data.success && data.users) {
                    setDistributors(data.users);
                    console.log('✅ Set distributors state:', data.users.length);
                } else {
                    console.error('❌ API returned success: false or no users');
                }
            } catch (error) {
                console.error('❌ Error fetching distributors:', error);
            } finally {
                setFetchingUsers(false);
            }
        };

        fetchDistributors();
    }, [showNewChatModal, token]);

    // Check for conversation ID in URL
    useEffect(() => {
        const conversationId = searchParams.get('conversation');
        if (conversationId) {
            setSelectedConversationId(conversationId);
        }
    }, [searchParams]);

    const selectedConversation = conversations.find(c => c._id === selectedConversationId);

    const handleStartChat = async (distributor: Distributor) => {
        setLoading(true);
        console.log('💬 Starting chat with:', distributor.businessName);

        // If no token in store, we might still have a cookie
        if (!token) console.warn('⚠️ No token in store for start chat, relying on cookies...');

        try {
            // We need to manually call the API here if createConversation depends on token
            // OR we update createConversation to be resilient (which we should do, but let's fix here first for safety)

            // Actually, let's try to use createConversation first, but if it fails due to no token, we do manual fetch
            let conversation = await createConversation(distributor._id, distributor.businessName);

            if (!conversation && !token) {
                console.log('🔄 Token missing, trying manual fetch for conversation creation...');
                const response = await fetch('/api/chat/conversations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // No Authorization header, rely on cookie
                    },
                    body: JSON.stringify({
                        otherUserId: distributor._id,
                        otherUserName: distributor.businessName,
                    }),
                });

                const data = await response.json();
                if (data.success) {
                    conversation = data.conversation;
                }
            }

            if (conversation) {
                console.log('✅ Conversation created:', conversation._id);
                setSelectedConversationId(conversation._id);
                setShowNewChatModal(false);
            } else {
                console.error('❌ Failed to create conversation');
                setToast({ message: 'Failed to start chat. Please try again.', type: 'error' });
            }
        } catch (error) {
            console.error('❌ Error starting chat:', error);
            setToast({ message: 'An error occurred. Please check your connection.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const filteredDistributors = distributors.filter(d =>
        d.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    console.log('🎨 Rendering with:', {
        showModal: showNewChatModal,
        totalDistributors: distributors.length,
        filteredDistributors: filteredDistributors.length,
        fetchingUsers
    });

    if (!user) return null;

    return (
        <div className="h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-xl overflow-hidden relative">
            {/* Toast Notification */}
            {toast && (
                <div className={`absolute top-6 right-6 z-[60] px-6 py-4 rounded-lg shadow-lg border-2 animate-fade-in ${toast.type === 'success'
                    ? 'bg-green-50 border-green-500 text-green-800'
                    : 'bg-red-50 border-red-500 text-red-800'
                    }`}>
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <XCircle className="w-5 h-5" />
                        )}
                        <p className="font-semibold">{toast.message}</p>
                    </div>
                </div>
            )}

            <div className="flex h-full">
                {/* Conversation List */}
                <div className={`${selectedConversationId ? 'hidden md:block' : 'block'} w-full md:w-96 border-r border-slate-200 flex flex-col`}>
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/retailer/dashboard"
                                    className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                                </Link>
                                <h1 className="text-xl font-bold text-slate-900">Messages</h1>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    console.log('➕ Opening new chat modal');
                                    setShowNewChatModal(true);
                                }}
                                className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transition-all"
                            >
                                <Plus className="w-5 h-5" />
                            </motion.button>
                        </div>
                        <p className="text-sm text-slate-600">
                            Chat with your distributors
                        </p>
                    </div>

                    {/* Conversations */}
                    <ConversationList
                        conversations={conversations}
                        selectedId={selectedConversationId || undefined}
                        onSelect={setSelectedConversationId}
                        userRole="retailer"
                    />
                </div>

                {/* Chat Window */}
                <div className={`${selectedConversationId ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
                    {selectedConversation ? (
                        <ChatWindow
                            conversationId={selectedConversation._id}
                            otherUserName={selectedConversation.distributorName}
                            onClose={() => setSelectedConversationId(null)}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-slate-50">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center"
                            >
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                    <MessageCircle className="w-12 h-12 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    Select a conversation
                                </h2>
                                <p className="text-slate-500 max-w-md mb-6">
                                    Choose a distributor from the list to start chatting
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowNewChatModal(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-5 h-5" />
                                    Start New Chat
                                </motion.button>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>

            {/* New Chat Modal */}
            <AnimatePresence>
                {showNewChatModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            console.log('❌ Closing modal');
                            setShowNewChatModal(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-900">Start New Chat</h2>
                                    <button
                                        onClick={() => setShowNewChatModal(false)}
                                        className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-600" />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">
                                    Select a distributor to start chatting
                                </p>
                            </div>

                            {/* Search */}
                            <div className="px-6 py-4 border-b border-slate-200">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search distributors..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-black placeholder:text-slate-500"
                                    />
                                </div>
                            </div>

                            {/* Distributors List */}
                            <div className="overflow-y-auto max-h-96">
                                {fetchingUsers ? (
                                    <div className="p-8 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
                                        <p className="text-slate-500">Loading distributors...</p>
                                    </div>
                                ) : filteredDistributors.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-slate-500">
                                            {distributors.length === 0
                                                ? 'No distributors available'
                                                : 'No distributors match your search'}
                                        </p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {distributors.length === 0
                                                ? 'Distributors will appear here once they register'
                                                : 'Try a different search term'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredDistributors.map((distributor, index) => (
                                        <motion.button
                                            key={distributor._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleStartChat(distributor)}
                                            disabled={loading}
                                            className="w-full p-4 border-b border-slate-200 hover:bg-slate-50 transition-colors text-left disabled:opacity-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {distributor.businessName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-slate-900 truncate">
                                                        {distributor.businessName}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 truncate">
                                                        {distributor.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function RetailerChatPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-xl">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
