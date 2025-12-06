import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import UserModel from '@/models/User';
import { getUserFromToken, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authHeader = request.headers.get('authorization');
        const cookieToken = request.cookies.get('token')?.value;

        let token;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (cookieToken) {
            token = cookieToken;
        }

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userData = await verifyToken(token);

        if (!userData) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user from database
        const user = await UserModel.findById(userData.userId).select('-password');
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                user: {
                    _id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    businessName: user.businessName,
                    contactPerson: user.contactPerson,
                    phone: user.phone,
                    address: user.address,
                    profileImage: user.profileImage,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
