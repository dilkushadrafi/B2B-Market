'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore, type Notification } from '@/store/notificationStore';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colorMap = {
    success: {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        border: 'border-green-500',
        icon: 'text-green-600',
        text: 'text-green-900',
    },
    error: {
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        border: 'border-red-500',
        icon: 'text-red-600',
        text: 'text-red-900',
    },
    warning: {
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
        border: 'border-yellow-500',
        icon: 'text-yellow-600',
        text: 'text-yellow-900',
    },
    info: {
        bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
        border: 'border-blue-500',
        icon: 'text-blue-600',
        text: 'text-blue-900',
    },
};

interface ToastItemProps {
    notification: Notification;
    onRemove: (id: string) => void;
}

function ToastItem({ notification, onRemove }: ToastItemProps) {
    const Icon = iconMap[notification.type];
    const colors = colorMap[notification.type];

    useEffect(() => {
        if (notification.duration && notification.duration > 0) {
            const timer = setTimeout(() => {
                onRemove(notification.id);
            }, notification.duration);
            return () => clearTimeout(timer);
        }
    }, [notification, onRemove]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`
                ${colors.bg} ${colors.border}
                border-l-4 rounded-lg shadow-lg
                px-5 py-4 pr-12
                min-w-[320px] max-w-md
                relative overflow-hidden
                backdrop-blur-sm
            `}
        >
            {/* Animated background shimmer */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />

            <div className="relative flex items-start gap-3">
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                >
                    <Icon className={`${colors.icon} w-6 h-6 flex-shrink-0`} />
                </motion.div>

                {/* Message */}
                <div className="flex-1 pt-0.5">
                    <p className={`${colors.text} font-medium text-sm leading-relaxed`}>
                        {notification.message}
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={() => onRemove(notification.id)}
                    className={`
                        ${colors.icon}
                        absolute top-3 right-3
                        hover:bg-black/5 rounded-full p-1
                        transition-all duration-200
                        hover:scale-110 active:scale-95
                    `}
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress bar */}
            {notification.duration && notification.duration > 0 && (
                <motion.div
                    className={`absolute bottom-0 left-0 h-1 ${colors.border.replace('border-', 'bg-')} opacity-50`}
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: notification.duration / 1000, ease: 'linear' }}
                />
            )}
        </motion.div>
    );
}

export default function ToastContainer() {
    const { notifications, removeNotification } = useNotificationStore();

    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                    <div key={notification.id} className="pointer-events-auto">
                        <ToastItem
                            notification={notification}
                            onRemove={removeNotification}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
