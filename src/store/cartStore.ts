import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '@/types';
import { useNotificationStore } from './notificationStore';

interface CartState {
    items: CartItem[];
    addItem: (product: Product, quantity: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalAmount: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, quantity) => {
                set((state) => {
                    const existingItem = state.items.find((item) => item.product._id === product._id);
                    if (existingItem) {
                        useNotificationStore.getState().addNotification(
                            `Updated ${product.name} quantity in cart`,
                            'success',
                            3000
                        );
                        return {
                            items: state.items.map((item) =>
                                item.product._id === product._id
                                    ? { ...item, quantity: item.quantity + quantity }
                                    : item
                            ),
                        };
                    }
                    useNotificationStore.getState().addNotification(
                        `${product.name} added to cart`,
                        'success',
                        3000
                    );
                    return { items: [...state.items, { product, quantity }] };
                });
            },
            removeItem: (productId) => {
                const item = get().items.find((item) => item.product._id === productId);
                if (item) {
                    useNotificationStore.getState().addNotification(
                        `${item.product.name} removed from cart`,
                        'info',
                        3000
                    );
                }
                set((state) => ({
                    items: state.items.filter((item) => item.product._id !== productId),
                }));
            },
            updateQuantity: (productId, quantity) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.product._id === productId ? { ...item, quantity } : item
                    ),
                })),
            clearCart: () => {
                useNotificationStore.getState().addNotification(
                    'Cart cleared successfully',
                    'info',
                    3000
                );
                set({ items: [] });
            },
            getTotalAmount: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
            },
            getTotalItems: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
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
