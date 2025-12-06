'use client';

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useOrderNotificationStore } from '@/store/orderNotificationStore';

/**
 * Hook to poll for new orders for distributors
 * This checks for new orders and adds them to the notification store
 */
export function useDistributorOrderNotifications() {
    const { user, token } = useAuthStore();
    const { addNotification, notifications } = useOrderNotificationStore();

    const checkForNewOrders = useCallback(async () => {
        if (!user || !token || user.role !== 'distributor') {
            return;
        }

        try {
            const response = await fetch('/api/distributor/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success && data.orders) {
                // Check for recent orders (within last 5 minutes)
                const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

                data.orders.forEach((order: any) => {
                    const orderCreatedAt = new Date(order.createdAt).getTime();

                    // Only notify for new orders created in the last 5 minutes
                    if (orderCreatedAt > fiveMinutesAgo && order.status === 'pending') {
                        // Check if we already have a notification for this order
                        const existingNotification = notifications.find(
                            n => n.orderId === order._id && n.type === 'new_order'
                        );

                        if (!existingNotification) {
                            const retailerName = order.retailerId?.businessName ||
                                order.retailerId?.email ||
                                'Unknown Retailer';

                            addNotification({
                                type: 'new_order',
                                orderId: order._id,
                                orderNumber: order.orderNumber,
                                message: `New order received from ${retailerName}`,
                                retailerName: retailerName,
                            });
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error checking for new orders:', error);
        }
    }, [user, token, addNotification, notifications]);

    useEffect(() => {
        if (user?.role === 'distributor') {
            // Check immediately
            checkForNewOrders();

            // Then check every 30 seconds
            const interval = setInterval(checkForNewOrders, 30000);

            return () => clearInterval(interval);
        }
    }, [user, checkForNewOrders]);

    return { checkForNewOrders };
}
