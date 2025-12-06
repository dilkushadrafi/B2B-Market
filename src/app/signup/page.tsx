'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, CheckCircle2, Sparkles, User, Phone, MapPin, Building2, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function SignupPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'retailer' as 'distributor' | 'retailer',
        businessName: '',
        contactPerson: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    businessName: formData.businessName,
                    contactPerson: formData.contactPerson,
                    phone: formData.phone,
                    address: {
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                    },
                }),
            });

            const data = await response.json();


            if (data.success && data.token && data.user) {
                // Set auth state (this also sets the cookie)
                setAuth(data.user, data.token);

                // Force a longer wait to ensure localStorage AND cookie are set
                await new Promise(resolve => setTimeout(resolve, 300));

                // Determine redirect URL
                const redirectUrl = data.user.role === 'distributor'
                    ? '/distributor/dashboard'
                    : '/retailer/dashboard';

                // Use hard redirect to ensure cookies and state are picked up
                window.location.href = redirectUrl;
            } else {
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 py-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-purple-600/20 rounded-full blur-[100px] animate-float"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl relative z-10"
            >
                <Card className="p-8 md:p-10 bg-slate-900/50 border-slate-800">
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mb-6 shadow-lg shadow-purple-500/20"
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <motion.h1
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-bold text-white mb-2"
                        >
                            Create Account
                        </motion.h1>
                        <motion.p
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-400"
                        >
                            Join us and start your B2B journey today
                        </motion.p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Role Selection */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="block text-sm font-medium text-slate-300 mb-3">I want to join as a</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'retailer' })}
                                    className={`p-4 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group ${formData.role === 'retailer'
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`font-bold ${formData.role === 'retailer' ? 'text-blue-400' : 'text-slate-300'}`}>
                                            Retailer
                                        </span>
                                        {formData.role === 'retailer' && (
                                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500">I want to buy products for my shop</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'distributor' })}
                                    className={`p-4 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group ${formData.role === 'distributor'
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`font-bold ${formData.role === 'distributor' ? 'text-purple-400' : 'text-slate-300'}`}>
                                            Distributor
                                        </span>
                                        {formData.role === 'distributor' && (
                                            <CheckCircle2 className="w-5 h-5 text-purple-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500">I want to sell products to retailers</p>
                                </button>
                            </div>
                        </motion.div>

                        {/* Account Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-4"
                        >
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-400" />
                                Account Information
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    leftIcon={<Mail className="w-4 h-4" />}
                                    placeholder="you@example.com"
                                    required
                                />
                                <Input
                                    label="Phone Number"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    leftIcon={<Phone className="w-4 h-4" />}
                                    placeholder="+1 (555) 000-0000"
                                    required
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Input
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        leftIcon={<Lock className="w-4 h-4" />}
                                        placeholder="Create password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-[34px] text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Input
                                        label="Confirm Password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        leftIcon={<Lock className="w-4 h-4" />}
                                        placeholder="Confirm password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-[34px] text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Business Details */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="space-y-4"
                        >
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-indigo-400" />
                                Business Details
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Business Name"
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    leftIcon={<Building2 className="w-4 h-4" />}
                                    placeholder="Company Ltd."
                                    required
                                />
                                <Input
                                    label="Contact Person"
                                    type="text"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    leftIcon={<User className="w-4 h-4" />}
                                    placeholder="Full Name"
                                    required
                                />
                            </div>

                            <Input
                                label="Street Address"
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                leftIcon={<MapPin className="w-4 h-4" />}
                                placeholder="123 Business Street"
                                required
                            />

                            <div className="grid grid-cols-3 gap-4">
                                <Input
                                    label="City"
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="City"
                                    required
                                />
                                <Input
                                    label="State"
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="State"
                                    required
                                />
                                <Input
                                    label="Pincode"
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="ZIP"
                                    required
                                />
                            </div>
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                {error}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                isLoading={loading}
                            >
                                Create Account
                            </Button>
                        </motion.div>
                    </form>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="mt-8 text-center text-slate-400 text-sm"
                    >
                        Already have an account?{' '}
                        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline transition-colors">
                            Sign in
                        </Link>
                    </motion.p>
                </Card>
            </motion.div>
        </div>
    );
}
