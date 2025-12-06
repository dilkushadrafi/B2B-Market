'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Order } from '@/types';
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
    MessageCircle
} from 'lucide-react';
import Link from 'next/link';

export default function DistributorOrdersPage() {
    const router = useRouter();
    const { token, user, isAuthenticated } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthenticated || !user) {
                try {
                    const res = await fetch('/api/auth/me');
                    const data = await res.json();

                    if (data.success && data.user) {
                        useAuthStore.getState().setAuth(data.user, token || '');
                        if (data.user.role !== 'distributor') {
                            router.push('/retailer/dashboard');
                        } else {
                            fetchOrders();
                        }
                    } else {
                        router.push('/login');
                    }
                } catch (error) {
                    router.push('/login');
                }
            } else if (user.role !== 'distributor') {
                router.push('/retailer/dashboard');
            } else {
                fetchOrders();
            }
        };

        checkAuth();
    }, [isAuthenticated, user, router, token]);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const fetchOrders = async () => {
        try {
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/distributor/orders', {
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

    const updateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingOrderId(orderId);

        // Optimistic update
        const previousOrders = [...orders];
        setOrders(orders.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
        ));

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/distributor/orders/${orderId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setToast({ message: 'Order status updated successfully!', type: 'success' });
                // Refresh to ensure data consistency
                await fetchOrders();
            } else {
                // Revert on failure
                setOrders(previousOrders);
                setToast({ message: data.message || 'Failed to update order status', type: 'error' });
            }
        } catch (error) {
            // Revert on error
            setOrders(previousOrders);
            setToast({ message: 'Network error. Please try again.', type: 'error' });
            console.error('Error updating status:', error);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleStartChat = async (retailerId: string | { _id: string, businessName: string }, retailerName?: string) => {
        // Handle different retailerId formats
        const id = typeof retailerId === 'object' ? retailerId._id : retailerId;
        const name = typeof retailerId === 'object' ? retailerId.businessName : retailerName || 'Retailer';

        if (!token) console.warn('⚠️ No token in store for start chat, relying on cookies...');

        try {
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
                    otherUserId: id,
                    otherUserName: name,
                }),
            });

            const data = await response.json();
            if (data.success) {
                router.push(`/distributor/chat?conversation=${data.conversation._id}`);
            } else {
                console.error('❌ Failed to create conversation:', data.message);
            }
        } catch (error) {
            console.error('Error starting chat:', error);
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
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/distributor/dashboard"
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Order Management</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Manage and track orders from retailers
                    </p>
                </div>

                {/* Toast Notification */}
                {toast && (
                    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg border-2 animate-fade-in ${toast.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200'
                        : 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200'
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

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                        <Package className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold mb-2">No orders yet</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Orders from retailers will appear here
                        </p>
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
                                            <p className="text-2xl font-bold text-blue-600">₹{order.totalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row justify-between gap-6 border-t border-slate-100 dark:border-slate-700 pt-4">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Retailer</p>
                                            <p className="font-medium text-slate-900 dark:text-white">{order.retailerId?.businessName}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{order.retailerId?.contactPerson}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{order.retailerId?.email}</p>
                                            {order.retailerId && (
                                                <button
                                                    onClick={() => handleStartChat(order.retailerId)}
                                                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    Chat with Retailer
                                                </button>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Shipping Address</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {order.shippingAddress.street}<br />
                                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                                disabled={updatingOrderId === order._id}
                                                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <option value="pending" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Pending</option>
                                                <option value="confirmed" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Confirmed</option>
                                                <option value="shipped" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Shipped</option>
                                                <option value="delivered" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Delivered</option>
                                                <option value="cancelled" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Cancelled</option>
                                            </select>
                                            {updatingOrderId === order._id && (
                                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors w-full"
                                    >
                                        {expandedOrder === order._id ? (
                                            <>
                                                <ChevronUp className="w-4 h-4" />
                                                Hide Items
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                View {order.items.length} Items
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
