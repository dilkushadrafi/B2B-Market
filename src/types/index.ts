export type UserRole = 'distributor' | 'retailer';

export interface User {
    _id: string;
    email: string;
    password: string;
    role: UserRole;
    businessName: string;
    contactPerson: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    createdAt: Date;
    isVerified: boolean;
    profileImage?: string;
}

export interface Product {
    _id: string;
    distributorId: string | { _id: string; businessName: string };
    name: string;
    description: string;
    category: string;
    price: number;
    moq: number; // minimum order quantity
    stock: number;
    unit: string;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    _id: string;
    orderNumber: string;
    retailerId: string | { _id: string; businessName: string; email: string; phone: string; address: any };
    distributorId: string | { _id: string; businessName: string; email: string; phone: string };
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface Category {
    _id: string;
    name: string;
    description: string;
    icon: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: Partial<User>;
    message?: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}
