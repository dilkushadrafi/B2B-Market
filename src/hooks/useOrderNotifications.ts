'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderNotificationStore } from '@/store/orderNotificationStore';

/**
 * Hook to poll for new order notifications
 * This checks for order status updates and adds them to the notification store
 */
export function useOrderNotifications() {
    const { user, token } = useAuthStore();
    const { addNotification, notifications } = useOrderNotificationStore();

    const checkForNotifications = useCallback(async () => {
        if (!user || !token || user.role !== 'retailer') {
            return;
        }

        try {
            const response = await fetch('/api/retailer/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success && data.orders) {
                // Check for recent status changes (within last 5 minutes)
                const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

                data.orders.forEach((order: any) => {
                    const orderUpdatedAt = new Date(order.updatedAt).getTime();
                    const orderCreatedAt = new Date(order.createdAt).getTime();

                    // Only notify if order was updated recently and not just created
                    if (orderUpdatedAt > fiveMinutesAgo && orderUpdatedAt > orderCreatedAt + 1000) {
                        // Check if we already have a notification for this order update
                        const existingNotification = notifications.find(
                            n => n.orderId === order._id && n.type === `order_${order.status}`
                        );

                        if (!existingNotification && order.status !== 'pending') {
                            const messages: Record<string, string> = {
                                confirmed: 'Your order has been confirmed by the distributor',
                                shipped: 'Your order has been shipped and is on the way',
                                delivered: 'Your order has been delivered successfully',
                                cancelled: 'Your order has been cancelled',
                            };

                            const message = messages[order.status];
                            if (message) {
                                addNotification({
                                    type: `order_${order.status}` as any,
                                    orderId: order._id,
                                    orderNumber: order.orderNumber,
                                    message,
                                    distributorName: order.distributorId?.businessName,
                                });
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error checking for notifications:', error);
        }
    }, [user, token, addNotification, notifications]);

    useEffect(() => {
        if (user?.role === 'retailer') {
            // Check immediately
            checkForNotifications();

            // Then check every 30 seconds
            const interval = setInterval(checkForNotifications, 30000);

            return () => clearInterval(interval);
        }
    }, [user, checkForNotifications]);

    return { checkForNotifications };
}
