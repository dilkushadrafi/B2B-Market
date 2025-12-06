'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { useDistributorOrderNotifications } from '@/hooks/useDistributorOrderNotifications';

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
    // Enable automatic notification polling for distributors
    useDistributorOrderNotifications();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative">
            <AnimatedBackground />
            <Sidebar role="distributor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 p-6 overflow-y-auto scrollbar-hide">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
