import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import UserModel from '@/models/User';
import { getUserFromToken, verifyToken } from '@/lib/auth';

// GET - Get all users of a specific role
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authHeader = request.headers.get('authorization');
        let userData = await getUserFromToken(authHeader);

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

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');

        if (!role || !['retailer', 'distributor'].includes(role)) {
            return NextResponse.json(
                { success: false, message: 'Invalid role parameter' },
                { status: 400 }
            );
        }

        // Get all users of the specified role
        const users = await UserModel.find({ role })
            .select('_id businessName email phone')
            .sort({ businessName: 1 })
            .lean();

        console.log(`Found ${users.length} users with role: ${role}`);

        return NextResponse.json(
            { success: true, users },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
