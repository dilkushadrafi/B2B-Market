'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Store,
    ShoppingBag,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
    role: 'distributor' | 'retailer';
}

export function Sidebar({ role, isOpen = false, onClose }: SidebarProps & { isOpen?: boolean; onClose?: () => void }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { logout } = useAuthStore();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        if (onClose) {
            onClose();
        }
    }, [pathname]);

    const distributorLinks = [
        { href: '/distributor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/distributor/products/add', label: 'Add Product', icon: Package },
        { href: '/distributor/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/distributor/chat', label: 'Messages', icon: MessageCircle },
    ];

    const retailerLinks = [
        { href: '/retailer/dashboard', label: 'Marketplace', icon: Store },
        { href: '/retailer/cart', label: 'My Cart', icon: ShoppingBag },
        { href: '/retailer/orders', label: 'My Orders', icon: ShoppingCart },
        { href: '/retailer/chat', label: 'Messages', icon: MessageCircle },
    ];

    const links = role === 'distributor' ? distributorLinks : retailerLinks;

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isCollapsed ? 80 : 280,
                    x: isOpen ? 0 : '-100%'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                // Override animate for desktop using CSS media query logic if possible, 
                // but Framer Motion handles style directly. We need to conditionally apply 'x' based on screen size.
                // Since hooks are easier here:
                style={{ x: undefined }} // Let class handles handle desktop reset if needed, or better:
                className={cn(
                    "fixed md:sticky top-0 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200 z-50 flex flex-col transition-all duration-300 overflow-hidden shadow-2xl md:shadow-xl",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Gradient Accent Border */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />

                {/* Animated Background Glow */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-100 rounded-full blur-3xl animate-pulse opacity-50" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-100 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDelay: '1s' }} />

                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 relative z-10 backdrop-blur-sm">
                    {(!isCollapsed || isOpen) && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gradient-primary whitespace-nowrap">
                                B2B Market
                            </span>
                        </motion.div>
                    )}

                    {/* Toggle Button (Desktop) / Close Button (Mobile) */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onClose}
                            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                        >
                            <X size={20} />
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden md:flex p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all duration-200"
                        >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </motion.button>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto relative z-10 scrollbar-hide">
                    {links.map((link, index) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <motion.div
                                key={link.href}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    href={link.href}
                                    prefetch={false}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                        isActive
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    )}
                                >
                                    {/* Hover Glow Effect */}
                                    {!isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl" />
                                    )}

                                    <Icon
                                        size={22}
                                        className={cn(
                                            "flex-shrink-0 relative z-10 transition-all duration-300",
                                            isActive ? "text-white drop-shadow-lg" : "text-slate-500 group-hover:text-indigo-600 group-hover:scale-110"
                                        )}
                                    />

                                    {(!isCollapsed || isOpen) && (
                                        <span className="font-semibold whitespace-nowrap relative z-10 text-sm">
                                            {link.label}
                                        </span>
                                    )}

                                    {/* Active Indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}

                                    {/* Shimmer Effect on Hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>

                {/* User Profile / Logout */}
                <div className="p-4 border-t border-slate-200 relative z-10 backdrop-blur-sm">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => logout()}
                        className={cn(
                            "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                            "text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300",
                            (isCollapsed && !isOpen) && "justify-center"
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        <LogOut size={20} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                        {(!isCollapsed || isOpen) && <span className="font-semibold text-sm relative z-10">Logout</span>}
                    </motion.button>
                </div>
            </motion.aside>
        </>
    );
}
