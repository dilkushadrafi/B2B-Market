# Order Notification System Documentation

## Overview
A real-time notification system that alerts retailers when distributors update their order status (confirmed, shipped, delivered, or cancelled). The notifications appear in a beautiful dropdown accessible from the bell icon in the navbar.

## Features
- 🔔 **Real-time Notifications**: Automatically polls for order updates every 30 seconds
- 📊 **Unread Badge**: Shows count of unread notifications on the bell icon
- 🎨 **Beautiful UI**: Animated dropdown with color-coded notifications
- 💾 **Persistent Storage**: Notifications are saved in localStorage
- ✅ **Read/Unread Tracking**: Mark individual or all notifications as read
- 🗑️ **Delete Notifications**: Remove individual notifications
- ⏰ **Relative Timestamps**: Shows "2 hours ago", "just now", etc.

## How It Works

### For Retailers
1. **Automatic Polling**: When logged in as a retailer, the system automatically checks for order updates every 30 seconds
2. **Notification Display**: When a distributor changes an order status, a notification appears in the bell dropdown
3. **Unread Count**: The bell icon shows a badge with the number of unread notifications
4. **Click to View**: Click the bell icon to see all notifications
5. **Mark as Read**: Notifications are marked as read when clicked
6. **Persistent**: Notifications persist across page refreshes and sessions

### For Distributors
1. **Update Order Status**: Change order status from the Orders page dropdown
2. **Automatic Notification**: When status changes, a notification is automatically created for the retailer
3. **Supported Statuses**:
   - **Confirmed**: "Your order has been confirmed by the distributor"
   - **Shipped**: "Your order has been shipped and is on the way"
   - **Delivered**: "Your order has been delivered successfully"
   - **Cancelled**: "Your order has been cancelled"

## Components

### 1. NotificationBell Component
**Location**: `/src/components/dashboard/NotificationBell.tsx`

Beautiful bell icon with dropdown showing all notifications.

**Features**:
- Unread count badge
- Animated dropdown
- Color-coded notification types
- Delete individual notifications
- Mark all as read button
- Relative timestamps

**Usage**:
```tsx
import { NotificationBell } from '@/components/dashboard/NotificationBell';

<NotificationBell 
    onNotificationClick={(notification) => {
        // Optional: Handle notification click
        console.log('Clicked:', notification);
    }}
/>
```

### 2. Order Notification Store
**Location**: `/src/store/orderNotificationStore.ts`

Zustand store managing notification state with localStorage persistence.

**API**:
```typescript
const {
    notifications,        // Array of all notifications
    unreadCount,         // Number of unread notifications
    addNotification,     // Add a new notification
    markAsRead,          // Mark notification as read
    markAllAsRead,       // Mark all as read
    removeNotification,  // Delete a notification
    clearAll,            // Clear all notifications
    setNotifications,    // Set notifications array
} = useOrderNotificationStore();
```

**Example**:
```typescript
import { useOrderNotificationStore } from '@/store/orderNotificationStore';

function MyComponent() {
    const { addNotification } = useOrderNotificationStore();

    const handleOrderUpdate = () => {
        addNotification({
            type: 'order_confirmed',
            orderId: '123',
            orderNumber: 'ORD-001',
            message: 'Your order has been confirmed',
            distributorName: 'ABC Distributors',
        });
    };
}
```

### 3. useOrderNotifications Hook
**Location**: `/src/hooks/useOrderNotifications.ts`

Automatically polls for order updates and creates notifications.

**Features**:
- Polls every 30 seconds
- Only for retailers
- Checks for recent updates (last 5 minutes)
- Prevents duplicate notifications
- Automatic cleanup on unmount

**Usage**:
```typescript
import { useOrderNotifications } from '@/hooks/useOrderNotifications';

function RetailerLayout() {
    // Enable automatic polling
    useOrderNotifications();
    
    return <div>...</div>;
}
```

## Notification Types

### Order Confirmed
- **Type**: `order_confirmed`
- **Color**: Green
- **Icon**: CheckCircle
- **Message**: "Your order has been confirmed by the distributor"

### Order Shipped
- **Type**: `order_shipped`
- **Color**: Blue
- **Icon**: Truck
- **Message**: "Your order has been shipped and is on the way"

### Order Delivered
- **Type**: `order_delivered`
- **Color**: Purple
- **Icon**: Package
- **Message**: "Your order has been delivered successfully"

### Order Cancelled
- **Type**: `order_cancelled`
- **Color**: Red
- **Icon**: XCircle
- **Message**: "Your order has been cancelled"

### New Order (for distributors - future)
- **Type**: `new_order`
- **Color**: Indigo
- **Icon**: Bell
- **Message**: "New order received from [retailer]"

## API Integration

### Update Order Status Endpoint
**Endpoint**: `PUT /api/distributor/orders/[id]`

When a distributor updates an order status, the API automatically creates a notification object in the response.

**Request**:
```json
{
    "status": "confirmed"
}
```

**Response**:
```json
{
    "success": true,
    "order": { ... },
    "message": "Order status updated",
    "notification": {
        "type": "order_confirmed",
        "orderId": "123",
        "orderNumber": "ORD-001",
        "message": "Your order has been confirmed by the distributor",
        "distributorName": "ABC Distributors",
        "retailerId": "456"
    }
}
```

## Customization

### Change Polling Interval
Edit `/src/hooks/useOrderNotifications.ts`:
```typescript
// Change from 30 seconds to 60 seconds
const interval = setInterval(checkForNotifications, 60000);
```

### Change Notification Duration
Edit `/src/hooks/useOrderNotifications.ts`:
```typescript
// Change from 5 minutes to 10 minutes
const fiveMinutesAgo = Date.now() - (10 * 60 * 1000);
```

### Add Custom Notification Types
1. Add to type definition in `/src/store/orderNotificationStore.ts`:
```typescript
export type OrderNotificationType = 
    | 'order_confirmed' 
    | 'order_shipped' 
    | 'order_delivered' 
    | 'order_cancelled'
    | 'order_refunded'  // New type
    | 'new_order';
```

2. Add icon and color in `/src/components/dashboard/NotificationBell.tsx`:
```typescript
const notificationIcons = {
    // ... existing
    order_refunded: RefreshCw,
};

const notificationColors = {
    // ... existing
    order_refunded: 'from-orange-500 to-yellow-500',
};
```

3. Add message in API endpoint:
```typescript
const notificationMessages: Record<string, string> = {
    // ... existing
    refunded: 'Your order has been refunded',
};
```

## Testing

### Test Notifications Manually
1. Login as a retailer
2. Place an order
3. Login as the distributor (in another browser/incognito)
4. Go to Orders page
5. Change the order status
6. Switch back to retailer account
7. Within 30 seconds, you should see the notification

### Test with Demo Data
Create a test notification:
```typescript
import { useOrderNotificationStore } from '@/store/orderNotificationStore';

const { addNotification } = useOrderNotificationStore();

addNotification({
    type: 'order_shipped',
    orderId: 'test-123',
    orderNumber: 'ORD-TEST-001',
    message: 'Test notification - Your order has been shipped',
    distributorName: 'Test Distributor',
});
```

## Troubleshooting

### Notifications not appearing
1. **Check if logged in as retailer**: Notifications only work for retailers
2. **Check browser console**: Look for errors in the console
3. **Check localStorage**: Open DevTools > Application > Local Storage > Check `order-notifications-storage`
4. **Wait 30 seconds**: Polling happens every 30 seconds
5. **Check order update time**: Only orders updated in the last 5 minutes trigger notifications

### Unread count not updating
1. **Clear localStorage**: Remove `order-notifications-storage` from localStorage
2. **Refresh page**: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. **Check store state**: Use React DevTools to inspect Zustand store

### Duplicate notifications
- The system checks for existing notifications before adding new ones
- If you see duplicates, check the `existingNotification` logic in `useOrderNotifications.ts`

## Future Enhancements

Potential improvements:
- [ ] WebSocket support for real-time updates (no polling)
- [ ] Push notifications (browser notifications API)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Notification preferences/settings
- [ ] Notification history page
- [ ] Filter notifications by type
- [ ] Search notifications
- [ ] Export notification history
- [ ] Notification sound effects
- [ ] Desktop notifications
- [ ] Notification for distributors when new orders arrive
- [ ] Batch notification actions

## Best Practices

1. **Don't spam notifications**: Only create notifications for meaningful status changes
2. **Keep messages concise**: Use clear, actionable messages
3. **Use appropriate colors**: Match notification type with color scheme
4. **Test thoroughly**: Test with multiple users and scenarios
5. **Monitor performance**: Polling can impact performance, adjust interval as needed
6. **Handle errors gracefully**: Network errors shouldn't break the UI
7. **Respect user preferences**: Consider adding notification settings

## Integration with Other Features

### With Toast Notifications
You can combine order notifications with toast notifications:
```typescript
import { useNotification } from '@/hooks/useNotification';
import { useOrderNotificationStore } from '@/store/orderNotificationStore';

const notify = useNotification();
const { addNotification } = useOrderNotificationStore();

// Show both
addNotification({ ... });
notify.success('New notification received!');
```

### With Email Notifications
Future enhancement - send email when notification is created:
```typescript
// In API endpoint
if (notification) {
    await sendEmail({
        to: retailer.email,
        subject: `Order ${order.orderNumber} ${status}`,
        body: notification.message,
    });
}
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Retailer Browser                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  RetailerLayout                                      │  │
│  │  ├─ useOrderNotifications() ← Polls every 30s       │  │
│  │  └─ Header                                           │  │
│  │     └─ NotificationBell                              │  │
│  │        ├─ Shows unread count                         │  │
│  │        └─ Dropdown with notifications                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  orderNotificationStore (Zustand + localStorage)     │  │
│  │  ├─ notifications[]                                  │  │
│  │  ├─ unreadCount                                      │  │
│  │  └─ actions (add, markAsRead, remove, etc.)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │ API Call (every 30s)
                          │
┌─────────────────────────────────────────────────────────────┐
│                     Backend API                             │
│                                                             │
│  GET /api/retailer/orders                                  │
│  └─ Returns orders with recent updates                     │
│                                                             │
│  PUT /api/distributor/orders/[id]                          │
│  ├─ Updates order status                                   │
│  └─ Returns notification object                            │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │ Status Update
                          │
┌─────────────────────────────────────────────────────────────┐
│                  Distributor Browser                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DistributorOrdersPage                               │  │
│  │  └─ Status Dropdown                                  │  │
│  │     └─ onChange → updateStatus()                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Summary

The order notification system provides a seamless way for retailers to stay informed about their order status changes. It combines:
- Beautiful UI with the NotificationBell component
- Persistent storage with Zustand and localStorage
- Automatic polling for updates
- Clean API integration
- Extensible architecture for future enhancements

The system is production-ready and can be easily extended with additional features like WebSocket support, email notifications, or push notifications.
