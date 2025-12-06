'use client';

import { motion } from 'framer-motion';
import { useNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    Bell,
    Sparkles
} from 'lucide-react';

export default function NotificationDemo() {
    const notify = useNotification();

    const demoNotifications = [
        {
            title: 'Success',
            description: 'Show success messages',
            icon: CheckCircle,
            color: 'from-green-500 to-emerald-500',
            action: () => notify.success('Operation completed successfully!'),
        },
        {
            title: 'Error',
            description: 'Show error messages',
            icon: XCircle,
            color: 'from-red-500 to-rose-500',
            action: () => notify.error('Something went wrong. Please try again.'),
        },
        {
            title: 'Warning',
            description: 'Show warning messages',
            icon: AlertTriangle,
            color: 'from-yellow-500 to-amber-500',
            action: () => notify.warning('Please review your information before proceeding.'),
        },
        {
            title: 'Info',
            description: 'Show informational messages',
            icon: Info,
            color: 'from-blue-500 to-cyan-500',
            action: () => notify.info('Your session will expire in 5 minutes.'),
        },
    ];

    const complexExamples = [
        {
            title: 'Product Added',
            action: () => notify.success('Premium Laptop added to cart - 2 items'),
        },
        {
            title: 'Order Placed',
            action: () => notify.success('Order #12345 placed successfully! Expected delivery: 3-5 days'),
        },
        {
            title: 'Payment Failed',
            action: () => notify.error('Payment failed. Please check your card details and try again.'),
        },
        {
            title: 'Low Stock',
            action: () => notify.warning('Only 3 items left in stock. Order soon!'),
        },
        {
            title: 'New Message',
            action: () => notify.info('You have a new message from your distributor'),
        },
        {
            title: 'Long Duration',
            action: () => notify.info('This notification will stay for 10 seconds', 10000),
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/20">
                        <Bell className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Notification System Demo
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        A beautiful, animated notification system for your B2B marketplace.
                        Click the buttons below to see different notification types in action.
                    </p>
                </motion.div>

                {/* Basic Notification Types */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                        Basic Notification Types
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {demoNotifications.map((demo, index) => (
                            <motion.div
                                key={demo.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                <Card className="p-6 hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 group cursor-pointer"
                                    onClick={demo.action}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <demo.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                                        {demo.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        {demo.description}
                                    </p>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            demo.action();
                                        }}
                                        size="sm"
                                        className="w-full"
                                    >
                                        Show {demo.title}
                                    </Button>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Real-world Examples */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        Real-world Examples
                    </h2>
                    <Card className="p-8 border-slate-200 dark:border-slate-800">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {complexExamples.map((example, index) => (
                                <motion.div
                                    key={example.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + index * 0.05 }}
                                >
                                    <Button
                                        onClick={example.action}
                                        variant="outline"
                                        className="w-full justify-start text-left h-auto py-3 px-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                            <span className="font-medium">{example.title}</span>
                                        </div>
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </motion.div>

                {/* Features */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="mt-12"
                >
                    <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            ✨ Features
                        </h3>
                        <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Beautiful animations with Framer Motion</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Auto-dismiss with customizable duration</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Progress bar showing remaining time</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Shimmer effect for premium feel</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Stack multiple notifications</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Manual close button</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>Integrated with cart, orders, and authentication</span>
                            </li>
                        </ul>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
