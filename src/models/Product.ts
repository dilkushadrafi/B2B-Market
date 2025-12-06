import mongoose, { Schema, Model } from 'mongoose';
import { Product } from '@/types';

const ProductSchema = new Schema<Product>(
    {
        distributorId: {
            type: String,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0,
        },
        moq: {
            type: Number,
            required: [true, 'Minimum order quantity is required'],
            min: 1,
        },
        stock: {
            type: Number,
            required: [true, 'Stock quantity is required'],
            min: 0,
        },
        unit: {
            type: String,
            required: [true, 'Unit is required'],
            enum: ['kg', 'liter', 'piece', 'box', 'dozen', 'pack'],
        },
        images: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for better query performance
ProductSchema.index({ distributorId: 1, isActive: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

const ProductModel: Model<Product> = mongoose.models.Product || mongoose.model<Product>('Product', ProductSchema);

export default ProductModel;
