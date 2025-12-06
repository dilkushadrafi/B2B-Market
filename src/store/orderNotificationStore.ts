import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type OrderNotificationType = 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'new_order';

export interface OrderNotification {
    id: string;
    type: OrderNotificationType;
    orderId: string;
    orderNumber: string;
    message: string;
    timestamp: number;
    read: boolean;
    distributorName?: string;
    retailerName?: string;
}

interface OrderNotificationStore {
    notifications: OrderNotification[];
    unreadCount: number;
    addNotification: (notification: Omit<OrderNotification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
    setNotifications: (notifications: OrderNotification[]) => void;
}

export const useOrderNotificationStore = create<OrderNotificationStore>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,

            addNotification: (notification) => {
                const newNotification: OrderNotification = {
                    ...notification,
                    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: Date.now(),
                    read: false,
                };

                set((state) => ({
                    notifications: [newNotification, ...state.notifications],
                    unreadCount: state.unreadCount + 1,
                }));
            },

            markAsRead: (id) => {
                set((state) => {
                    const notification = state.notifications.find((n) => n.id === id);
                    if (notification && !notification.read) {
                        return {
                            notifications: state.notifications.map((n) =>
                                n.id === id ? { ...n, read: true } : n
                            ),
                            unreadCount: Math.max(0, state.unreadCount - 1),
                        };
                    }
                    return state;
                });
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                    unreadCount: 0,
                }));
            },

            removeNotification: (id) => {
                set((state) => {
                    const notification = state.notifications.find((n) => n.id === id);
                    return {
                        notifications: state.notifications.filter((n) => n.id !== id),
                        unreadCount: notification && !notification.read
                            ? Math.max(0, state.unreadCount - 1)
                            : state.unreadCount,
                    };
                });
            },

            clearAll: () => {
                set({ notifications: [], unreadCount: 0 });
            },

            setNotifications: (notifications) => {
                const unreadCount = notifications.filter((n) => !n.read).length;
                set({ notifications, unreadCount });
            },
        }),
        {
            name: 'order-notifications-storage',
            storage: createJSONStorage(() => {
                if (typeof window !== 'undefined') {
                    return localStorage;
                }
                return {
                    getItem: () => null,
                    setItem: () => { },
                    removeItem: () => { },
                };
            }),
        }
    )
);
