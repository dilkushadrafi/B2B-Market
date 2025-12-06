import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import UserModel from '@/models/User';
import { getUserFromToken, verifyToken } from '@/lib/auth';

// PUT update user profile
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        const authHeader = request.headers.get('authorization');
        let userData = await getUserFromToken(authHeader);

        // Fallback to cookie if no auth header
        if (!userData) {
            const cookieToken = request.cookies.get('token')?.value;
            if (cookieToken) {
                userData = await verifyToken(cookieToken);
            }
        }

        if (!userData) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { businessName, email, phone, contactPerson, address, profileImage } = body;

        // Find and update user
        const user = await UserModel.findById(userData.userId);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Update fields
        if (businessName) user.businessName = businessName;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (contactPerson) user.contactPerson = contactPerson;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (address) {
            user.address = {
                street: address.street || user.address?.street || '',
                city: address.city || user.address?.city || '',
                state: address.state || user.address?.state || '',
                pincode: address.pincode || user.address?.pincode || '',
            };
        }

        await user.save();

        // Return updated user (without password)
        const updatedUser = {
            _id: user._id,
            businessName: user.businessName,
            email: user.email,
            phone: user.phone,
            contactPerson: user.contactPerson,
            address: user.address,
            role: user.role,
            profileImage: user.profileImage,
        };

        return NextResponse.json(
            { success: true, user: updatedUser, message: 'Profile updated successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
