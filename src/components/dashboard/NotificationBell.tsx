'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Package, Truck, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { useOrderNotificationStore, type OrderNotification } from '@/store/orderNotificationStore';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const notificationIcons = {
    order_confirmed: CheckCircle,
    order_shipped: Truck,
    order_delivered: Package,
    order_cancelled: XCircle,
    new_order: Bell,
};

const notificationColors = {
    order_confirmed: 'from-green-500 to-emerald-500',
    order_shipped: 'from-blue-500 to-cyan-500',
    order_delivered: 'from-purple-500 to-pink-500',
    order_cancelled: 'from-red-500 to-rose-500',
    new_order: 'from-indigo-500 to-purple-500',
};

interface NotificationBellProps {
    onNotificationClick?: (notification: OrderNotification) => void;
}

export function NotificationBell({ onNotificationClick }: NotificationBellProps) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useOrderNotificationStore();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { user } = useAuthStore();

    // Click outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleNotificationClick = (notification: OrderNotification) => {
        markAsRead(notification.id);
        setShowDropdown(false);

        // Navigate to orders page based on user role
        if (user?.role === 'retailer') {
            router.push('/retailer/orders');
        } else if (user?.role === 'distributor') {
            router.push('/distributor/orders');
        }

        // Call optional callback
        if (onNotificationClick) {
            onNotificationClick(notification);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        removeNotification(id);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all duration-200 relative border border-transparent hover:border-slate-200"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white flex items-center justify-center"
                    >
                        <span className="text-[10px] font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    </motion.span>
                )}
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-96 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">Notifications</h3>
                                    <p className="text-xs text-white/80">
                                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                                    </p>
                                </div>
                                {notifications.length > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Bell className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-600 font-medium">No notifications yet</p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        We'll notify you when something happens
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((notification, index) => {
                                        const Icon = notificationIcons[notification.type];
                                        const colorClass = notificationColors[notification.type];

                                        return (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!notification.read ? 'bg-indigo-50/50' : ''
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    {/* Icon */}
                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                                        <Icon className="w-5 h-5 text-white" />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-slate-900 mb-1">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <span className="font-mono">#{notification.orderNumber}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {formatDistanceToNow(notification.timestamp)}
                                                            </span>
                                                        </div>
                                                        {(notification.distributorName || notification.retailerName) && (
                                                            <p className="text-xs text-slate-600 mt-1">
                                                                {notification.distributorName || notification.retailerName}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Unread indicator & Delete */}
                                                    <div className="flex flex-col items-end gap-2">
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(e, notification.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-slate-200 p-3 bg-slate-50">
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        // Navigate to orders page based on role
                                        if (user?.role === 'retailer') {
                                            router.push('/retailer/orders');
                                        } else if (user?.role === 'distributor') {
                                            router.push('/distributor/orders');
                                        }
                                    }}
                                    className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    View all orders
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
