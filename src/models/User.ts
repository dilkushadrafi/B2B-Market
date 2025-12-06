import mongoose, { Schema, Model } from 'mongoose';
import { User } from '@/types';

const AddressSchema = new Schema({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
});

const UserSchema = new Schema<User>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
        },
        role: {
            type: String,
            required: true,
            enum: ['distributor', 'retailer'],
        },
        businessName: {
            type: String,
            required: [true, 'Business name is required'],
        },
        contactPerson: {
            type: String,
            required: [true, 'Contact person is required'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
        },
        address: {
            type: AddressSchema,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
        profileImage: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

const UserModel: Model<User> = mongoose.models.User || mongoose.model<User>('User', UserSchema);

export default UserModel;
