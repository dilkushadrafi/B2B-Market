import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
    timestamp: number;
}

interface NotificationStore {
    notifications: Notification[];
    addNotification: (message: string, type: NotificationType, duration?: number) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],

    addNotification: (message: string, type: NotificationType, duration: number = 5000) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const notification: Notification = {
            id,
            message,
            type,
            duration,
            timestamp: Date.now(),
        };

        set((state) => ({
            notifications: [...state.notifications, notification],
        }));

        // Auto-remove notification after duration
        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            }, duration);
        }
    },

    removeNotification: (id: string) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }));
    },

    clearAll: () => {
        set({ notifications: [] });
    },
}));
