# Notification System Documentation

## Overview
A beautiful, animated notification system for the B2B Marketplace application. Built with Zustand for state management and Framer Motion for smooth animations.

## Features
- ✨ Beautiful animations with shimmer effects
- 🎨 Four notification types: Success, Error, Warning, Info
- ⏱️ Auto-dismiss with customizable duration
- 📊 Progress bar showing remaining time
- 🔔 Stack multiple notifications
- ❌ Manual close button
- 🎯 Global state management with Zustand

## Quick Start

### 1. Import the hook
```tsx
import { useNotification } from '@/hooks/useNotification';
```

### 2. Use in your component
```tsx
function MyComponent() {
    const notify = useNotification();

    const handleSuccess = () => {
        notify.success('Operation completed successfully!');
    };

    const handleError = () => {
        notify.error('Something went wrong!');
    };

    return (
        <button onClick={handleSuccess}>Click me</button>
    );
}
```

## API Reference

### useNotification Hook

Returns an object with the following methods:

#### `success(message: string, duration?: number)`
Show a success notification (green)
```tsx
notify.success('Product added to cart!');
notify.success('Order placed successfully!', 10000); // 10 seconds
```

#### `error(message: string, duration?: number)`
Show an error notification (red)
```tsx
notify.error('Failed to load products');
notify.error('Payment failed. Please try again.', 8000);
```

#### `warning(message: string, duration?: number)`
Show a warning notification (yellow)
```tsx
notify.warning('Only 3 items left in stock!');
notify.warning('Your session will expire soon', 15000);
```

#### `info(message: string, duration?: number)`
Show an info notification (blue)
```tsx
notify.info('New message from distributor');
notify.info('System maintenance scheduled', 20000);
```

#### `notify(message: string, type: NotificationType, duration?: number)`
Generic method for any notification type
```tsx
notify.notify('Custom message', 'success', 5000);
```

### Default Duration
- Default: 5000ms (5 seconds)
- Set to 0 for persistent notifications (must be closed manually)

## Examples

### Cart Operations
```tsx
// In cart store or component
const addToCart = (product) => {
    // Add product logic...
    notify.success(`${product.name} added to cart`);
};

const removeFromCart = (product) => {
    // Remove product logic...
    notify.info(`${product.name} removed from cart`);
};
```

### Order Placement
```tsx
const placeOrder = async () => {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });

        if (response.ok) {
            notify.success('Order placed successfully! Check your orders page.');
            router.push('/orders');
        } else {
            notify.error('Failed to place order. Please try again.');
        }
    } catch (error) {
        notify.error('Network error. Please check your connection.');
    }
};
```

### Authentication
```tsx
const handleLogin = async (credentials) => {
    try {
        const response = await login(credentials);
        
        if (response.success) {
            notify.success(`Welcome back, ${response.user.name}!`);
            router.push('/dashboard');
        } else {
            notify.error('Invalid credentials. Please try again.');
        }
    } catch (error) {
        notify.error('Login failed. Please try again later.');
    }
};
```

### Form Validation
```tsx
const handleSubmit = (data) => {
    if (!data.email) {
        notify.warning('Please enter your email address');
        return;
    }

    if (!isValidEmail(data.email)) {
        notify.error('Please enter a valid email address');
        return;
    }

    // Submit form...
    notify.success('Form submitted successfully!');
};
```

### Product Management
```tsx
const deleteProduct = async (productId) => {
    try {
        await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        notify.success('Product deleted successfully');
        refreshProducts();
    } catch (error) {
        notify.error('Failed to delete product');
    }
};

const updateProduct = async (productId, data) => {
    try {
        await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        notify.success('Product updated successfully');
    } catch (error) {
        notify.error('Failed to update product');
    }
};
```

### Stock Alerts
```tsx
const checkStock = (product) => {
    if (product.stock === 0) {
        notify.error(`${product.name} is out of stock`);
    } else if (product.stock < 10) {
        notify.warning(`Only ${product.stock} units left for ${product.name}`);
    } else {
        notify.info(`${product.stock} units available`);
    }
};
```

## Customization

### Custom Duration
```tsx
// Short notification (2 seconds)
notify.success('Quick message', 2000);

// Long notification (15 seconds)
notify.warning('Important warning', 15000);

// Persistent notification (must close manually)
notify.error('Critical error', 0);
```

### Multiple Notifications
The system automatically stacks multiple notifications:
```tsx
notify.success('Item 1 added');
notify.success('Item 2 added');
notify.success('Item 3 added');
// All three will be visible and stack vertically
```

## Integration Points

The notification system is already integrated in:

1. **Cart Store** (`/src/store/cartStore.ts`)
   - Add to cart
   - Remove from cart
   - Clear cart

2. **Login Page** (`/src/app/login/page.tsx`)
   - Login success
   - Login errors

3. **Cart Page** (`/src/app/retailer/cart/page.tsx`)
   - Order placement
   - Checkout errors

## Demo Page

Visit `/demo/notifications` to see all notification types in action with interactive examples.

## Architecture

### Components
- **ToastContainer** (`/src/components/ui/ToastContainer.tsx`)
  - Main container component
  - Handles rendering and animations
  - Positioned at top-right of screen

### Store
- **notificationStore** (`/src/store/notificationStore.ts`)
  - Zustand store for global state
  - Manages notification queue
  - Auto-dismiss logic

### Hook
- **useNotification** (`/src/hooks/useNotification.ts`)
  - Convenient wrapper around store
  - Provides typed methods for each notification type

## Best Practices

1. **Be Specific**: Use clear, actionable messages
   ```tsx
   // Good
   notify.success('Order #12345 placed successfully');
   
   // Bad
   notify.success('Success');
   ```

2. **Choose the Right Type**:
   - Success: Completed actions
   - Error: Failed operations, validation errors
   - Warning: Caution, low stock, expiring sessions
   - Info: General information, updates

3. **Appropriate Duration**:
   - Quick confirmations: 2-3 seconds
   - Standard messages: 5 seconds (default)
   - Important warnings: 8-10 seconds
   - Critical errors: 15+ seconds or persistent

4. **Avoid Spam**: Don't show too many notifications at once
   ```tsx
   // Bad - spamming user
   items.forEach(item => notify.success(`Added ${item.name}`));
   
   // Good - single summary
   notify.success(`Added ${items.length} items to cart`);
   ```

5. **User Actions**: Provide context for what happened and what to do next
   ```tsx
   notify.success('Order placed! Check your email for confirmation.');
   notify.error('Payment failed. Please update your payment method.');
   ```

## Troubleshooting

### Notifications not showing
1. Ensure `ToastContainer` is in your root layout
2. Check browser console for errors
3. Verify the notification hook is being called

### Styling issues
1. Check Tailwind CSS is properly configured
2. Ensure Framer Motion is installed
3. Verify z-index is high enough (default: 9999)

### Multiple notifications overlapping
- This is expected behavior - they stack vertically
- Adjust spacing in ToastContainer if needed

## Future Enhancements

Potential improvements:
- Sound effects
- Position customization (top-left, bottom-right, etc.)
- Action buttons in notifications
- Notification history/log
- Undo functionality
- Desktop notifications API integration
