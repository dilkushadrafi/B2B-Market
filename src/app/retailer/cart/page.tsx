'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import {
    ArrowLeft,
    Trash2,
    Plus,
    Minus,
    ShoppingBag,
    CreditCard,
    Loader2,
    Package
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useNotification } from '@/hooks/useNotification';

export default function CartPage() {
    const router = useRouter();
    const { user, token, isAuthenticated } = useAuthStore();
    const { items, removeItem, updateQuantity, clearCart, getTotalAmount } = useCartStore();
    const notify = useNotification();
    const [loading, setLoading] = useState(false);

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
                        }
                    } else {
                        router.push('/login');
                    }
                } catch (error) {
                    router.push('/login');
                }
            } else if (user.role !== 'retailer') {
                router.push('/distributor/dashboard');
            }
        };

        checkAuth();
    }, [isAuthenticated, user, router, token]);

    const handleCheckout = async () => {
        console.log('Starting checkout...');
        if (!user) {
            console.error('User missing', { user });
            return;
        }
        setLoading(true);

        try {
            console.log('Items:', items);
            const ordersByDistributor = items.reduce((acc, item) => {
                const distId = typeof item.product.distributorId === 'object'
                    ? item.product.distributorId._id
                    : item.product.distributorId;

                if (!distId) {
                    console.error('Missing distributorId for product:', item.product);
                    return acc;
                }

                if (!acc[distId]) acc[distId] = [];
                acc[distId].push(item);
                return acc;
            }, {} as Record<string, typeof items>);

            console.log('Orders by distributor:', ordersByDistributor);

            for (const [distributorId, distributorItems] of Object.entries(ordersByDistributor)) {
                const orderData = {
                    distributorId,
                    items: distributorItems.map(item => ({
                        productId: item.product._id,
                        productName: item.product.name,
                        quantity: item.quantity,
                        price: item.product.price,
                        subtotal: item.product.price * item.quantity
                    })),
                    totalAmount: distributorItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
                    shippingAddress: user.address || {
                        street: '123 Market St',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        pincode: '400001'
                    }
                };

                console.log('Sending order data:', orderData);

                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch('/api/retailer/orders', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(orderData),
                });

                const data = await res.json();
                console.log('Order response:', data);

                if (!res.ok) {
                    throw new Error(data.message || 'Failed to place order');
                }
            }

            clearCart();
            notify.success('Order placed successfully! Check your orders page.');
            router.push('/retailer/orders');
        } catch (error) {
            console.error('Checkout error:', error);
            notify.error('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center"
                >
                    <ShoppingBag className="w-16 h-16 text-slate-400" />
                </motion.div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Looks like you haven't added any products yet
                    </p>
                    <Link href="/retailer/dashboard">
                        <Button className="gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            Start Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/retailer/dashboard"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4 text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Marketplace
                </Link>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Shopping Cart</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.product._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="p-5 border-slate-200 dark:border-slate-800">
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                                        {item.product.images?.[0] ? (
                                            <img
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-slate-400" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{item.product.name}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    ₹{item.product.price} per {item.product.unit}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.product._id)}
                                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                                <button
                                                    onClick={() => {
                                                        if (item.quantity > item.product.moq) {
                                                            updateQuantity(item.product._id, item.quantity - 1);
                                                        }
                                                    }}
                                                    className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    disabled={item.quantity <= item.product.moq}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-semibold min-w-[40px] text-center text-slate-900 dark:text-white">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                    className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="font-bold text-xl text-slate-900 dark:text-white">
                                                ₹{(item.product.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="p-6 border-slate-200 dark:border-slate-800 sticky top-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">₹{getTotalAmount().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Shipping</span>
                                    <span className="text-sm">Calculated at checkout</span>
                                </div>
                                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                    <span>Tax</span>
                                    <span className="font-semibold">₹0.00</span>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-between font-bold text-lg text-slate-900 dark:text-white">
                                    <span>Total</span>
                                    <span>₹{getTotalAmount().toFixed(2)}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                isLoading={loading}
                                className="w-full gap-2"
                                size="lg"
                            >
                                <CreditCard className="w-5 h-5" />
                                Place Order
                            </Button>

                            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
                                By placing this order, you agree to our terms and conditions
                            </p>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
