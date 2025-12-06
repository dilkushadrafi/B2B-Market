import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
    user: Partial<User> | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: Partial<User>, token: string) => void;
    logout: () => void;
}

// Helper function to set cookie
const setCookie = (name: string, value: string, days: number = 7) => {
    if (typeof window === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

// Helper function to delete cookie
const deleteCookie = (name: string) => {
    if (typeof window === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => {
                // Cookie is now set by the server
                // setCookie('token', token, 7);
                set({
                    user,
                    token,
                    isAuthenticated: true,
                });
            },
            logout: () => {
                // Delete cookie
                deleteCookie('token');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => {
                // Only use localStorage on client side
                if (typeof window !== 'undefined') {
                    return localStorage;
                }
                // Return a dummy storage for SSR
                return {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                };
            }),
        }
    )
);
