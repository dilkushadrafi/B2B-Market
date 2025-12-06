'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export function ChatButton() {
    const { totalUnread } = useChat();
    const { user } = useAuthStore();
    const router = useRouter();
    const [showTooltip, setShowTooltip] = useState(false);

    const handleClick = () => {
        if (user?.role === 'retailer') {
            router.push('/retailer/chat');
        } else if (user?.role === 'distributor') {
            router.push('/distributor/chat');
        }
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClick}
                className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all duration-200 relative border border-transparent hover:border-slate-200"
            >
                <MessageCircle size={20} />
                {totalUnread > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full border-2 border-white flex items-center justify-center"
                    >
                        <span className="text-[10px] font-bold text-white">
                            {totalUnread > 99 ? '99+' : totalUnread}
                        </span>
                    </motion.span>
                )}
            </motion.button>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full mt-2 right-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-50"
                    >
                        Messages
                        {totalUnread > 0 && ` (${totalUnread} unread)`}
                        <div className="absolute -top-1 right-4 w-2 h-2 bg-slate-900 transform rotate-45" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
