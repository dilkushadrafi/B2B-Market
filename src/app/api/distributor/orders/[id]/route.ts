import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import OrderModel from '@/models/Order';
import { getUserFromToken, verifyToken } from '@/lib/auth';

// PUT update order status
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const authHeader = request.headers.get('authorization');
        let userData = await getUserFromToken(authHeader);

        // Fallback to cookie if no auth header
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

        const body = await request.json();
        const { status } = body;

        if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            return NextResponse.json(
                { success: false, message: 'Invalid status' },
                { status: 400 }
            );
        }

        const order = await OrderModel.findById(id).populate('retailerId', 'businessName email');

        if (!order || order.distributorId !== userData.userId) {
            return NextResponse.json(
                { success: false, message: 'Order not found or unauthorized' },
                { status: 404 }
            );
        }

        const previousStatus = order.status;
        order.status = status;
        await order.save();

        // Create notification for retailer when status changes
        if (previousStatus !== status && status !== 'pending') {
            const notificationMessages: Record<string, string> = {
                confirmed: 'Your order has been confirmed by the distributor',
                shipped: 'Your order has been shipped and is on the way',
                delivered: 'Your order has been delivered successfully',
                cancelled: 'Your order has been cancelled',
            };

            const message = notificationMessages[status];
            if (message) {
                // In a real app, you'd save this to a Notification model
                // For now, we'll return it in the response so the frontend can handle it
                const notification = {
                    type: `order_${status}` as const,
                    orderId: order._id.toString(),
                    orderNumber: order.orderNumber,
                    message,
                    distributorName: userData.businessName || 'Distributor',
                    retailerId: order.retailerId,
                };

                return NextResponse.json(
                    {
                        success: true,
                        order,
                        message: 'Order status updated',
                        notification
                    },
                    { status: 200 }
                );
            }
        }

        return NextResponse.json(
            { success: true, order, message: 'Order status updated' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Update order error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
