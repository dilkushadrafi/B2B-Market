'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Store, ShoppingCart, TrendingUp, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AnimatedSection } from '@/components/ui/AnimatedSection';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'distributor') {
        router.push('/distributor/dashboard');
      } else if (user.role === 'retailer') {
        router.push('/retailer/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-50 selection:bg-indigo-500/30">

      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-[100px] animate-float" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              B2B Marketplace
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4"
          >
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            The Future of Wholesale Trading
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Scale Your Business with <br />
            <span className="text-gradient">Intelligent Commerce</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Connect seamlessly with top-tier distributors and retailers.
            Automate your supply chain, manage inventory in real-time, and unlock new growth opportunities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/signup">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Start Trading Now
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto mt-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-white/10 py-12 bg-white/5 backdrop-blur-sm rounded-3xl">
            {[
              { label: 'Active Retailers', value: '2,000+', icon: Store },
              { label: 'Verified Distributors', value: '500+', icon: ShieldCheck },
              { label: 'Monthly Volume', value: '₹100Cr+', icon: TrendingUp },
              { label: 'Cities Covered', value: '50+', icon: Globe },
            ].map((stat, index) => (
              <AnimatedSection key={index} delay={index * 0.1} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <stat.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-slate-400">Built for the modern supply chain ecosystem.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection delay={0.1}>
              <Card className="h-full bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-slate-700/50">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6">
                  <Store className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">For Retailers</h3>
                <p className="text-slate-400 leading-relaxed">
                  Access a vast network of verified suppliers. Compare prices, track orders in real-time, and manage inventory with AI-driven insights.
                </p>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <Card className="h-full bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-slate-700/50">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-6">
                  <Package className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">For Distributors</h3>
                <p className="text-slate-400 leading-relaxed">
                  Expand your market reach instantly. Automated order processing, smart inventory management, and guaranteed payments.
                </p>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <Card className="h-full bg-gradient-to-b from-slate-800/50 to-slate-900/50 border-slate-700/50">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
                <p className="text-slate-400 leading-relaxed">
                  Experience zero-latency trading. Our platform is built on edge computing infrastructure for real-time updates and instant syncing.
                </p>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-500" />
            <span className="font-bold text-slate-200">B2B Marketplace</span>
          </div>
          <div className="text-slate-500 text-sm">
            &copy; 2025 B2B Marketplace. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

