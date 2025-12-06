'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Product, Order } from '@/types';
import {
    Package,
    Plus,
    Edit,
    Trash2,
    Search,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Loader2,
    MoreVertical,
    Clock,
    CheckCircle,
    XCircle,
    Truck
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export default function DistributorDashboard() {
    const router = useRouter();
    const { user, token, isAuthenticated } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ show: boolean; productId: string | null; productName: string }>({
        show: false,
        productId: null,
        productName: ''
    });

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
                fetchData();
            }
        };

        checkAuth();
    }, [isAuthenticated, user, router, token]);

    const fetchData = async () => {
        try {
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const [productsRes, ordersRes] = await Promise.all([
                fetch('/api/distributor/products', { headers }),
                fetch('/api/distributor/orders', { headers })
            ]);

            const productsData = await productsRes.json();
            const ordersData = await ordersRes.json();

            if (productsData.success) {
                setProducts(productsData.products || []);
            }
            if (ordersData.success) {
                setOrders(ordersData.orders || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (productId: string, productName: string) => {
        setDeleteModal({ show: true, productId, productName });
    };

    const confirmDelete = async () => {
        if (!deleteModal.productId) return;

        try {
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`/api/distributor/products/${deleteModal.productId}`, {
                method: 'DELETE',
                headers,
            });

            if (response.ok) {
                setDeleteModal({ show: false, productId: null, productName: '' });
                fetchData();
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.isActive).length,
        totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold text-gradient-primary mb-2">Dashboard Overview</h1>
                    <p className="text-slate-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Welcome back, <span className="text-slate-900 font-semibold">{user?.businessName}</span>
                    </p>
                </div>
                <Link href="/distributor/products/add">
                    <Button className="gap-2 hover-shine relative overflow-hidden group">
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        Add New Product
                    </Button>
                </Link>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <AnimatedSection delay={0.1}>
                    <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="p-6 flex items-center gap-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border-indigo-200 hover-glow relative overflow-hidden group">
                            {/* Animated Background Orb */}
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-200/40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                            <motion.div
                                className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/30 relative z-10"
                                animate={{ rotate: [0, 5, 0, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <ShoppingBag size={28} className="text-white drop-shadow-lg" />
                            </motion.div>
                            <div className="relative z-10">
                                <p className="text-indigo-600 text-sm font-semibold uppercase tracking-wider mb-1">Total Products</p>
                                <motion.p
                                    className="text-4xl font-bold text-slate-900"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                >
                                    {stats.totalProducts}
                                </motion.p>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                    <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="p-6 flex items-center gap-4 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-emerald-200 hover-glow relative overflow-hidden group">
                            {/* Animated Background Orb */}
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-200/40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                            <motion.div
                                className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/30 relative z-10"
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <TrendingUp size={28} className="text-white drop-shadow-lg" />
                            </motion.div>
                            <div className="relative z-10">
                                <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wider mb-1">Active Products</p>
                                <motion.p
                                    className="text-4xl font-bold text-slate-900"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4, type: "spring" }}
                                >
                                    {stats.activeProducts}
                                </motion.p>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatedSection>

                <AnimatedSection delay={0.3}>
                    <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="p-6 flex items-center gap-4 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-purple-200 hover-glow relative overflow-hidden group">
                            {/* Animated Background Orb */}
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-200/40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                            <motion.div
                                className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/30 relative z-10"
                                animate={{ rotate: [0, -5, 0, 5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <DollarSign size={28} className="text-white drop-shadow-lg" />
                            </motion.div>
                            <div className="relative z-10">
                                <p className="text-purple-600 text-sm font-semibold uppercase tracking-wider mb-1">Inventory Value</p>
                                <motion.p
                                    className="text-4xl font-bold text-slate-900"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                >
                                    ₹{stats.totalValue.toFixed(2)}
                                </motion.p>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatedSection>
            </div>

            {/* Products Table/Grid Section */}
            <AnimatedSection delay={0.4}>
                <Card className="overflow-hidden border-slate-200 bg-white shadow-lg">
                    <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-900">My Products</h2>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">No products found</h3>
                                <p className="text-slate-600 mb-6">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
                                </p>
                                {!searchTerm && (
                                    <Link href="/distributor/products/add">
                                        <Button variant="outline">Add Product</Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product, index) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -8 }}
                                    >
                                        <Card className="h-full hover-tilt transition-all duration-300 border-slate-200 bg-white shadow-md hover:shadow-xl group relative overflow-hidden">
                                            {/* Gradient Border Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                                            {/* Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                            <div className="p-5 relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1">
                                                        <motion.span
                                                            className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200 mb-3"
                                                            whileHover={{ scale: 1.05 }}
                                                        >
                                                            {product.category}
                                                        </motion.span>
                                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-gradient-primary transition-all duration-300 line-clamp-1">
                                                            {product.name}
                                                        </h3>
                                                    </div>
                                                    <motion.div
                                                        className="relative"
                                                        animate={{ scale: [1, 1.2, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                    >
                                                        <span className={`w-3 h-3 rounded-full block ${product.isActive ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'}`}></span>
                                                        {product.isActive && (
                                                            <span className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></span>
                                                        )}
                                                    </motion.div>
                                                </div>

                                                <p className="text-sm text-slate-600 mb-4 line-clamp-2 h-10">
                                                    {product.description}
                                                </p>

                                                <div className="space-y-2 mb-6">
                                                    <div className="flex justify-between text-sm p-2 rounded-lg bg-slate-50">
                                                        <span className="text-slate-600">Price</span>
                                                        <span className="font-bold text-indigo-600">₹{product.price}/{product.unit}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm p-2 rounded-lg bg-slate-50">
                                                        <span className="text-slate-600">Stock</span>
                                                        <span className="font-bold text-emerald-600">{product.stock} {product.unit}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 pt-4 border-t border-slate-200">
                                                    <Link href={`/distributor/products/${product._id}/edit`} className="flex-1">
                                                        <motion.div
                                                            whileHover={{ scale: 1.03 }}
                                                            whileTap={{ scale: 0.97 }}
                                                        >
                                                            <Button variant="outline" size="sm" className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200 hover:border-indigo-300 group/btn">
                                                                <Edit size={16} className="mr-2 group-hover/btn:rotate-12 transition-transform" /> Edit
                                                            </Button>
                                                        </motion.div>
                                                    </Link>
                                                    <motion.div
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        className="flex-1"
                                                    >
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="w-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 hover:border-red-300 group/btn"
                                                            onClick={() => handleDelete(product._id, product.name)}
                                                        >
                                                            <Trash2 size={16} className="mr-2 group-hover/btn:rotate-12 transition-transform" /> Delete
                                                        </Button>
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </AnimatedSection>

            {/* Recent Orders Section */}
            <AnimatedSection delay={0.5}>
                <Card className="overflow-hidden border-slate-200 bg-white shadow-lg">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-700">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Order ID</th>
                                    <th className="px-6 py-4 font-semibold">Retailer</th>
                                    <th className="px-6 py-4 font-semibold">Items</th>
                                    <th className="px-6 py-4 font-semibold">Total</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-600">
                                            No orders found yet
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {order.orderNumber}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {typeof order.retailerId === 'object' ? order.retailerId.businessName : 'Unknown Retailer'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {order.items.length} items
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                ₹{order.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                            order.status === 'delivered' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                                'bg-slate-100 text-slate-700 border border-slate-200'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </AnimatedSection>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center border border-red-200">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Delete Product</h3>
                                <p className="text-sm text-slate-600">This action cannot be undone</p>
                            </div>
                        </div>

                        <p className="text-slate-700 mb-6">
                            Are you sure you want to delete <strong className="text-slate-900">"{deleteModal.productName}"</strong>? This will permanently remove the product from your inventory.
                        </p>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setDeleteModal({ show: false, productId: null, productName: '' })}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white"
                                onClick={confirmDelete}
                            >
                                Delete Product
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
