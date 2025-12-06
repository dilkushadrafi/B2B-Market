# B2B Wholesale Marketplace - Walkthrough

This guide will help you get started with the B2B Wholesale Marketplace platform.

## Getting Started

### 1. Run the Application
Open your terminal and run the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### 2. Create Accounts
You can create two types of accounts to test the full flow:
1. **Distributor Account**: To list products and manage orders.
2. **Retailer Account**: To browse products and place orders.

---

## Distributor Workflow

### 1. Sign Up / Login
- Go to `/signup` and select **Distributor**.
- Fill in your business details.
- Once registered, you'll be redirected to the Distributor Dashboard.

### 2. Add Products
- On the dashboard, click **Add Product**.
- Fill in product details (Name, Price, Stock, MOQ, etc.).
- Add image URLs (for demo, you can use placeholder images like `https://placehold.co/400`).
- Click **Create Product**.

### 3. Manage Orders
- Go to the **Order Management** page (via the dashboard).
- View incoming orders from retailers.
- Update order status (e.g., from "Pending" to "Confirmed" or "Shipped").

---

## Retailer Workflow

### 1. Sign Up / Login
- Go to `/signup` and select **Retailer**.
- Fill in your shop details.
- You'll be redirected to the Retailer Dashboard.

### 2. Browse & Shop
- Browse products from all distributors.
- Use the **Search** bar or **Category** filters to find items.
- Click the **+** button to add items to your cart (MOQ is automatically enforced).

### 3. Checkout
- Click the **Cart** icon in the top right.
- Review your items and quantities.
- Click **Place Order**.
- Your order will be split automatically if items are from different distributors.

### 4. Track Orders
- Go to **My Orders** (via the profile menu or dashboard).
- View the status of your orders.
- Click **View Details** to see items in each order.

---

## Key Features

- **Role-Based Access**: Distributors and Retailers have completely different dashboards.
- **Inventory Management**: Stock is tracked (though simple decrement logic would be a next step).
- **Order Tracking**: Real-time status updates visible to both parties.
- **Responsive Design**: Works on desktop, tablet, and mobile.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Custom JWT Auth

## UI Enhancements (Latest)

We have significantly enhanced the visual appeal of the authentication pages with a modern glassmorphism design.

### Key Changes:
- **Glassmorphism**: Added semi-transparent, blurred backgrounds to form cards for a premium feel.
- **Background**: Implemented a high-quality background image with a gradient overlay.
- **Animations**: Added smooth entrance animations (`scaleIn`, `fadeIn`) and interactive hover effects.
- **Alignment**: Fixed alignment issues in input fields and buttons.

### Screenshots

**Login Page**
![Login Page Styled](/Users/macbookair/.gemini/antigravity/brain/e6164f4e-f817-4128-b3ee-7624a54585d8/login_styled_1764084269622.png)

**Signup Page**
![Signup Page Styled](/Users/macbookair/.gemini/antigravity/brain/e6164f4e-f817-4128-b3ee-7624a54585d8/signup_styled_1764084314289.png)
