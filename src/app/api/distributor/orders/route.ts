import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import OrderModel from '@/models/Order';
import { getUserFromToken, verifyToken } from '@/lib/auth';

// GET distributor's orders
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

        if (!userData || userData.role !== 'distributor') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const orders = await OrderModel.find({ distributorId: userData.userId })
            .sort({ createdAt: -1 })
            .populate('retailerId', 'businessName email phone contactPerson address');

        return NextResponse.json({ success: true, orders }, { status: 200 });
    } catch (error: any) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
