'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends HTMLMotionProps<'div'> {
    hoverEffect?: boolean;
}

export function Card({ className, hoverEffect = true, children, ...props }: CardProps) {
    return (
        <motion.div
            initial={hoverEffect ? { y: 0 } : undefined}
            whileHover={hoverEffect ? { y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
                'glass-card rounded-2xl p-6 text-slate-100 relative overflow-hidden border border-white/10',
                'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
}
