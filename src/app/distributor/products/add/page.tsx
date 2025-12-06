'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Package, ArrowLeft, Upload, Loader2, X, ImagePlus, DollarSign, Layers, Box, Tag, Info, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AddProductPage() {
    const router = useRouter();
    const { token, user, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            }
        };

        checkAuth();
    }, [isAuthenticated, user, router, token]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        moq: '',
        stock: '',
        unit: 'piece',
        images: [] as string[],
    });

    const [imageUrlInput, setImageUrlInput] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddImage = () => {
        if (imageUrlInput && !formData.images.includes(imageUrlInput)) {
            setFormData({ ...formData, images: [...formData.images, imageUrlInput] });
            setImageUrlInput('');
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/distributor/products', {
                method: 'POST',
                headers,
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/distributor/dashboard');
            } else {
                setError(data.message || 'Failed to create product');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-5xl mx-auto space-y-8 pb-12"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <Link
                    href="/distributor/dashboard"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors w-fit group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Dashboard</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600/10 rounded-xl">
                        <Package className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Add New Product</h1>
                        <p className="text-slate-500 dark:text-slate-400">List a new product for retailers to purchase</p>
                    </div>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Information Card */}
                        <motion.div variants={itemVariants}>
                            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Info className="w-5 h-5 text-blue-500" />
                                        Basic Information
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <Input
                                        label="Product Name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Premium Basmati Rice"
                                        required
                                        leftIcon={<Tag className="w-4 h-4" />}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
                                            placeholder="Describe your product features, benefits, and specifications..."
                                        />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Images Card */}
                        <motion.div variants={itemVariants}>
                            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <ImagePlus className="w-5 h-5 text-purple-500" />
                                        Product Images
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LinkIcon className="h-4 w-4 text-slate-400" />
                                            </div>
                                            <input
                                                type="url"
                                                value={imageUrlInput}
                                                onChange={(e) => setImageUrlInput(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={handleAddImage}
                                            className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Add Image
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        <AnimatePresence mode='popLayout'>
                                            {formData.images.map((img, idx) => (
                                                <motion.div
                                                    key={img}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                                >
                                                    <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveImage(idx)}
                                                            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors transform hover:scale-110"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {formData.images.length === 0 && (
                                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                                                <ImagePlus className="w-12 h-12 mb-3 opacity-50" />
                                                <p className="text-sm font-medium">No images added yet</p>
                                                <p className="text-xs mt-1">Add image URLs above to preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right Column - Details & Actions */}
                    <div className="space-y-8">
                        {/* Category & Unit */}
                        <motion.div variants={itemVariants}>
                            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Layers className="w-5 h-5 text-indigo-500" />
                                        Classification
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                                        <div className="relative">
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Grains & Rice">Grains & Rice</option>
                                                <option value="Oil & Masala">Oil & Masala</option>
                                                <option value="Beverages">Beverages</option>
                                                <option value="Snacks">Snacks</option>
                                                <option value="Cleaning">Cleaning</option>
                                                <option value="Personal Care">Personal Care</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Unit Type</label>
                                        <div className="relative">
                                            <select
                                                name="unit"
                                                value={formData.unit}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                                            >
                                                <option value="piece">Piece</option>
                                                <option value="kg">Kilogram (kg)</option>
                                                <option value="liter">Liter (L)</option>
                                                <option value="box">Box</option>
                                                <option value="dozen">Dozen</option>
                                                <option value="pack">Pack</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Pricing & Stock */}
                        <motion.div variants={itemVariants}>
                            <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-green-500" />
                                        Pricing & Inventory
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <Input
                                        label="Price per Unit (₹)"
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                        leftIcon={<span className="text-slate-400 font-semibold">₹</span>}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Stock"
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            placeholder="0"
                                            min="0"
                                            required
                                            leftIcon={<Box className="w-4 h-4" />}
                                        />

                                        <Input
                                            label="MOQ"
                                            type="number"
                                            name="moq"
                                            value={formData.moq}
                                            onChange={handleChange}
                                            placeholder="1"
                                            min="1"
                                            required
                                            leftIcon={<Layers className="w-4 h-4" />}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Actions */}
                        <motion.div variants={itemVariants} className="sticky top-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2"
                                >
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    className="w-full py-6 text-lg font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                                >
                                    <Package className="w-5 h-5 mr-2" />
                                    Create Product
                                </Button>
                                <Link href="/distributor/dashboard" className="w-full">
                                    <Button variant="outline" type="button" className="w-full">
                                        Cancel
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </form>
        </motion.div>
    );
}
