import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import OrderModel from '@/models/Order';
import { getUserFromToken, verifyToken } from '@/lib/auth';
import { nanoid } from 'nanoid';

// POST create new order
export async function POST(request: NextRequest) {
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

        if (!userData || userData.role !== 'retailer') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { distributorId, items, totalAmount, shippingAddress } = body;

        // Validate
        if (!distributorId || !items || items.length === 0 || !totalAmount || !shippingAddress) {
            return NextResponse.json(
                { success: false, message: 'Invalid order data' },
                { status: 400 }
            );
        }

        const order = await OrderModel.create({
            orderNumber: `ORD-${nanoid(8).toUpperCase()}`,
            retailerId: userData.userId,
            distributorId,
            items,
            totalAmount,
            shippingAddress,
            status: 'pending',
        });

        // Populate the order with retailer details for notification
        await order.populate('retailerId', 'businessName email');

        // Create notification data for distributor
        const notification = {
            type: 'new_order' as const,
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            message: `New order received from ${userData.businessName || 'retailer'}`,
            retailerName: userData.businessName || userData.email,
            distributorId: distributorId,
            totalAmount: totalAmount,
        };

        return NextResponse.json(
            {
                success: true,
                order,
                message: 'Order placed successfully',
                notification
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET retailer's orders
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

        if (!userData || userData.role !== 'retailer') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const orders = await OrderModel.find({ retailerId: userData.userId })
            .sort({ createdAt: -1 })
            .populate('distributorId', 'businessName email phone');

        return NextResponse.json({ success: true, orders }, { status: 200 });
    } catch (error: any) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
