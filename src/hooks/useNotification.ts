import { useNotificationStore, type NotificationType } from '@/store/notificationStore';

export function useNotification() {
    const addNotification = useNotificationStore((state) => state.addNotification);

    return {
        success: (message: string, duration?: number) =>
            addNotification(message, 'success', duration),

        error: (message: string, duration?: number) =>
            addNotification(message, 'error', duration),

        warning: (message: string, duration?: number) =>
            addNotification(message, 'warning', duration),

        info: (message: string, duration?: number) =>
            addNotification(message, 'info', duration),

        notify: (message: string, type: NotificationType, duration?: number) =>
            addNotification(message, type, duration),
    };
}
