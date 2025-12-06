'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends Omit<HTMLMotionProps<'input'>, 'ref'> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {leftIcon}
                        </div>
                    )}
                    <motion.input
                        ref={ref}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={cn(
                            'w-full rounded-xl bg-white dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200 dark:border-slate-600/50 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-indigo-500/50 focus:border-blue-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800/80',
                            'transition-all duration-300 shadow-sm hover:border-slate-300 dark:hover:border-slate-500',
                            leftIcon && 'pl-10',
                            error && 'border-red-500/70 focus:ring-red-500/50 focus:border-red-400',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-500 dark:text-red-400"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
