'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import {
    Package,
    Search,
    Plus,
    Loader2,
    Filter,
    ShoppingCart,
    Minus,
    X,
    MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export default function RetailerDashboard() {
    const router = useRouter();
    const { user, token, isAuthenticated } = useAuthStore();
    const { addItem, items, updateQuantity, removeItem } = useCartStore();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDistributor, setSelectedDistributor] = useState<string | null>(null);

    const getCartQuantity = (productId: string) => {
        const item = items.find(i => i.product._id === productId);
        return item ? item.quantity : 0;
    };

    const handleUpdateQuantity = (product: Product, newQuantity: number) => {
        if (newQuantity < 1) {
            removeItem(product._id);
        } else {
            updateQuantity(product._id, newQuantity);
        }
    };

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
            } else {
                fetchProducts();
            }
        };

        checkAuth();
    }, [isAuthenticated, user, router, token, selectedCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            if (searchTerm) params.append('search', searchTerm);

            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/retailer/products?${params.toString()}`, {
                headers,
            });
            const data = await response.json();
            if (data.success) {
                // Filter out products with invalid distributorId
                const validProducts = (data.products || []).filter((p: Product) =>
                    p.distributorId && typeof p.distributorId === 'object'
                );
                setProducts(validProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProducts();
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        // Optionally refetch all products when clearing
        setTimeout(() => {
            fetchProducts();
        }, 0);
    };

    const handleStartChat = async (distributorId: string | { _id: string, businessName: string }, distributorName?: string) => {
        // Handle different distributorId formats
        const id = typeof distributorId === 'object' ? distributorId._id : distributorId;
        const name = typeof distributorId === 'object' ? distributorId.businessName : distributorName || 'Distributor';

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
                router.push(`/retailer/chat?conversation=${data.conversation._id}`);
            } else {
                console.error('❌ Failed to create conversation:', data.message);
            }
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    };

    const categories = [
        'All',
        'Grains & Rice',
        'Oil & Masala',
        'Beverages',
        'Snacks',
        'Cleaning',
        'Personal Care'
    ];

    // Extract unique distributors
    const uniqueDistributors = Array.from(new Set(products.map(p =>
        (p.distributorId && typeof p.distributorId === 'object') ? p.distributorId._id : p.distributorId
    ))).map(id => {
        const product = products.find(p =>
            ((p.distributorId && typeof p.distributorId === 'object') ? p.distributorId._id : p.distributorId) === id
        );
        return (product?.distributorId && typeof product.distributorId === 'object') ? product.distributorId : null;
    }).filter((d): d is { _id: string; businessName: string } => d !== null);

    // Filter products by selected distributor
    const filteredProducts = selectedDistributor
        ? products.filter(p => ((p.distributorId && typeof p.distributorId === 'object') ? p.distributorId._id : p.distributorId) === selectedDistributor)
        : products;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Marketplace</h1>
                    <p className="text-slate-500 dark:text-slate-400">Browse and order products for your store</p>
                </div>
                {/* Search and Filter */}
                <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    <Button type="submit" size="md">Search</Button>
                </form>
            </div>

            {/* Distributors Section */}
            {uniqueDistributors.length > 0 && (
                <AnimatedSection delay={0.05}>
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Shop by Distributor</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            <button
                                onClick={() => setSelectedDistributor(null)}
                                className={`flex-shrink-0 w-40 p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${selectedDistributor === null
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:shadow-md'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedDistributor === null ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'
                                    }`}>
                                    <Package className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-sm">All Distributors</span>
                            </button>

                            {uniqueDistributors.map((distributor) => (
                                <button
                                    key={distributor._id}
                                    onClick={() => setSelectedDistributor(distributor._id)}
                                    className={`flex-shrink-0 w-40 p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2 ${selectedDistributor === distributor._id
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedDistributor === distributor._id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'
                                        }`}>
                                        <div className="text-lg font-bold uppercase">
                                            {distributor.businessName.charAt(0)}
                                        </div>
                                    </div>
                                    <span className="font-medium text-sm truncate w-full text-center">
                                        {distributor.businessName}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>
            )}

            {/* Categories */}
            <AnimatedSection delay={0.1}>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat === 'All' ? 'all' : cat)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${(selectedCategory === 'all' && cat === 'All') || selectedCategory === cat
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </AnimatedSection>

            {/* Products Grid */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <AnimatedSection>
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                No products found
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                We couldn't find any products matching your search. Try adjusting your filters or search terms.
                            </p>
                        </div>
                    </AnimatedSection>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, index) => {
                            const quantity = getCartQuantity(product._id);
                            return (
                                <AnimatedSection key={product._id} delay={index * 0.05}>
                                    <Card className="h-full hover:shadow-xl transition-all duration-300 group border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                                        {/* Image Area */}
                                        <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                                                    <Package className="w-12 h-12" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-black/80 dark:bg-white/90 text-white dark:text-black backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                                                MOQ: {product.moq} {product.unit}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="mb-3 flex justify-between items-start">
                                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md">
                                                    {product.category}
                                                </span>
                                                {product.distributorId && typeof product.distributorId === 'object' && (
                                                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                                                        {product.distributorId.businessName}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors flex-1">
                                                    {product.name}
                                                </h3>
                                                {product.distributorId && typeof product.distributorId === 'object' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleStartChat(product.distributorId);
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                        title="Chat with distributor"
                                                    >
                                                        <MessageCircle className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>

                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 flex-1">
                                                {product.description}
                                            </p>

                                            <div className="flex items-end justify-between gap-4 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Price</p>
                                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                        ₹{product.price}
                                                        <span className="text-sm font-normal text-slate-500 ml-1">/{product.unit}</span>
                                                    </p>
                                                </div>
                                                {quantity > 0 ? (
                                                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(product, quantity - 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-bold text-slate-900 dark:text-white w-4 text-center">
                                                            {quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(product, quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => addItem(product, product.moq)}
                                                        className="rounded-xl w-12 h-12 p-0 flex items-center justify-center shadow-lg shadow-blue-600/20"
                                                    >
                                                        <Plus className="w-6 h-6" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </AnimatedSection>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
