'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
    Package,
    ArrowLeft,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    ChevronDown,
    ChevronUp,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function RetailerOrdersPage() {
    const router = useRouter();
    const { token, user, isAuthenticated } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated || !user) {
                try {
                    const res = await fetch('/api/auth/me');
                    const data = await res.json();

                    if (data.success && data.user) {
                        useAuthStore.getState().setAuth(data.user, token || '');
                        if (data.user.role !== 'retailer') {
                            router.push('/distributor/dashboard');
                        } else {
                            fetchOrders();
                        }
                    } else {
                        router.push('/login');
                    }
                } catch (error) {
                    router.push('/login');
                }
            } else if (user.role !== 'retailer') {
                router.push('/distributor/dashboard');
            } else {
                fetchOrders();
            }
        };

        checkAuth();
    }, [isAuthenticated, user, router, token]);

    const fetchOrders = async () => {
        try {
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/retailer/orders', {
                headers,
            });
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'confirmed': return <CheckCircle className="w-4 h-4" />;
            case 'shipped': return <Truck className="w-4 h-4" />;
            case 'delivered': return <Package className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/retailer/dashboard"
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Orders</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Track your order history and status
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                        <Package className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Start shopping to place your first order
                        </p>
                        <Link
                            href="/retailer/dashboard"
                            className="px-6 py-3 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-all"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{order.orderNumber}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Amount</p>
                                            <p className="text-2xl font-bold text-orange-600">₹{order.totalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between gap-6 border-t border-slate-100 dark:border-slate-700 pt-4">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Distributor</p>
                                            <p className="font-medium text-slate-900 dark:text-white">{order.distributorId?.businessName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Items</p>
                                            <p className="font-medium text-slate-900 dark:text-white">{order.items.length} items</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                        className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors w-full"
                                    >
                                        {expandedOrder === order._id ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" />
                                                Hide Details
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                View Details
                                            </>
                                        )}
                                    </button>

                                    {expandedOrder === order._id && (
                                        <div className="mt-4 space-y-3 pb-2 animate-fade-in">
                                            {order.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white">
                                                            {item.quantity}x
                                                        </span>
                                                        <span className="text-slate-900 dark:text-white">{item.productName}</span>
                                                    </div>
                                                    <span className="font-medium text-slate-900 dark:text-white">₹{item.subtotal.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
