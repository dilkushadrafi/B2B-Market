'use client';

import { useAuthStore } from '@/store/authStore';

import { Bell, Search, User, LogOut, Mail, Phone, MapPin, Briefcase, Edit, X, Save, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationBell } from './NotificationBell';
import { ChatButton } from '../chat/ChatButton';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user, logout, setAuth, token } = useAuthStore();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Form state
    const [formData, setFormData] = useState({
        businessName: user?.businessName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        contactPerson: user?.contactPerson || '',
        address: {
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            pincode: user?.address?.pincode || '',
        },
        profileImage: user?.profileImage || '',
    });

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                businessName: user.businessName || '',
                email: user.email || '',
                phone: user.phone || '',
                contactPerson: user.contactPerson || '',
                address: {
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    pincode: user.address?.pincode || '',
                },
                profileImage: user.profileImage || '',
            });
        }
    }, [user]);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false);
            }
        }

        if (showProfileDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileDropdown]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handleEditClick = () => {
        setShowProfileDropdown(false);
        setShowEditModal(true);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Update auth store with new user data
                setAuth({ ...user, ...data.user }, token || '');
                setToast({ message: 'Profile updated successfully!', type: 'success' });
                setShowEditModal(false);
            } else {
                setToast({ message: data.message || 'Failed to update profile', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Network error. Please try again.', type: 'error' });
            console.error('Update profile error:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 relative shadow-sm">
                {/* Gradient Accent Line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30" />

                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuClick}
                    className="mr-4 md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <Menu size={24} />
                </button>

                {/* Search Bar */}
                <div className="flex-1 max-w-md hidden md:block">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10" size={18} />
                        <input
                            type="text"
                            placeholder="Search products, orders..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition-all duration-300 hover:border-slate-300"
                        />
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 ml-auto">
                    <NotificationBell />
                    <ChatButton />

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:opacity-80 transition-all duration-200"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900">{user?.businessName || 'User'}</p>
                                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 overflow-hidden border-2 border-white">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={user.businessName} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                        </motion.button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {showProfileDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-3 w-80 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                                >
                                    {/* Profile Header */}
                                    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
                                        {/* Animated Background */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 overflow-hidden shadow-lg">
                                                {user?.profileImage ? (
                                                    <img src={user.profileImage} alt={user.businessName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={28} />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{user?.businessName || 'User'}</h3>
                                                <p className="text-sm text-white/90 capitalize flex items-center gap-1">
                                                    <Briefcase size={14} />
                                                    {user?.role}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Details */}
                                    <div className="p-4 space-y-3 bg-white">
                                        {user?.email && (
                                            <div className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                <Mail size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Email</p>
                                                    <p className="text-slate-900">{user.email}</p>
                                                </div>
                                            </div>
                                        )}

                                        {user?.phone && (
                                            <div className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                <Phone size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Phone</p>
                                                    <p className="text-slate-900">{user.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        {user?.contactPerson && (
                                            <div className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                <User size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Contact Person</p>
                                                    <p className="text-slate-900">{user.contactPerson}</p>
                                                </div>
                                            </div>
                                        )}

                                        {user?.address && (
                                            <div className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                <MapPin size={18} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Address</p>
                                                    <p className="text-slate-900">
                                                        {user.address.street && `${user.address.street}, `}
                                                        {user.address.city && `${user.address.city}, `}
                                                        {user.address.state && `${user.address.state} `}
                                                        {user.address.pincode}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="border-t border-slate-200 p-3 space-y-2 bg-white">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleEditClick}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all font-semibold text-sm shadow-lg shadow-indigo-500/30"
                                        >
                                            <Edit size={18} />
                                            Edit Profile
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all font-semibold text-sm"
                                        >
                                            <LogOut size={18} />
                                            Logout
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg border-2 ${toast.type === 'success'
                            ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200'
                            : 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200'
                            }`}
                    >
                        <p className="font-semibold">{toast.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Edit size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">Edit Profile</h2>
                                        <p className="text-sm text-white/80">Update your account information</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                                {/* Business Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                        Business Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>

                                {/* Profile Image URL */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                        Profile Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.profileImage}
                                        onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>

                                {/* Contact Person */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>

                                {/* Address */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Address</h3>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                            Street
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address.street}
                                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address.city}
                                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                                State
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address.state}
                                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address.pincode}
                                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-6 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
