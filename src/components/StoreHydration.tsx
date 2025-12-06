'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export function StoreHydration({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Hydrate stores on client side
        useAuthStore.persist.rehydrate();
        useCartStore.persist.rehydrate();
    }, []);

    return <>{children}</>;
}
