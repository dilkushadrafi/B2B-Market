import mongoose, { Schema, Model } from 'mongoose';
import { Order, OrderItem } from '@/types';

const OrderItemSchema = new Schema<OrderItem>({
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
});

const ShippingAddressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
});

const OrderSchema = new Schema<Order>(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        retailerId: {
            type: String,
            required: true,
            ref: 'User',
        },
        distributorId: {
            type: String,
            required: true,
            ref: 'User',
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: [(val: OrderItem[]) => val.length > 0, 'Order must have at least one item'],
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        shippingAddress: {
            type: ShippingAddressSchema,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
OrderSchema.index({ retailerId: 1, createdAt: -1 });
OrderSchema.index({ distributorId: 1, createdAt: -1 });


const OrderModel: Model<Order> = mongoose.models.Order || mongoose.model<Order>('Order', OrderSchema);

export default OrderModel;
