import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import OrderModel from '@/models/Order';
import { getUserFromToken } from '@/lib/auth';

// GET single order details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const authHeader = request.headers.get('authorization');
        const userData = await getUserFromToken(authHeader);

        if (!userData) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const order = await OrderModel.findById(id)
            .populate('distributorId', 'businessName email phone')
            .populate('retailerId', 'businessName email phone contactPerson');

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Check authorization (must be either the retailer or distributor)
        if (
            (order.retailerId as any)._id.toString() !== userData.userId &&
            (order.distributorId as any)._id.toString() !== userData.userId
        ) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        return NextResponse.json({ success: true, order }, { status: 200 });
    } catch (error: any) {
        console.error('Get order error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
