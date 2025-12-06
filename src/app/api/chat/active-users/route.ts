import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import ProductModel from '@/models/Product';
import OrderModel from '@/models/Order';
import { getUserFromToken, verifyToken } from '@/lib/auth';

// GET - Get distributors who have listed products OR retailers who have placed orders
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
        const type = searchParams.get('type'); // 'distributors' or 'retailers'

        if (type === 'distributors') {
            // Get distributors who have listed products
            const products = await ProductModel.find()
                .populate('distributorId', '_id businessName email phone')
                .select('distributorId');

            // Extract unique distributors
            const distributorsMap = new Map();
            products.forEach((product: any) => {
                if (product.distributorId && product.distributorId._id) {
                    const id = product.distributorId._id.toString();
                    if (!distributorsMap.has(id)) {
                        distributorsMap.set(id, {
                            _id: product.distributorId._id,
                            businessName: product.distributorId.businessName,
                            email: product.distributorId.email,
                            phone: product.distributorId.phone,
                        });
                    }
                }
            });

            const distributors = Array.from(distributorsMap.values());

            return NextResponse.json(
                { success: true, users: distributors },
                { status: 200 }
            );
        } else if (type === 'retailers') {
            // Get retailers who have placed orders
            const orders = await OrderModel.find()
                .populate('retailerId', '_id businessName email phone')
                .select('retailerId');

            // Extract unique retailers
            const retailersMap = new Map();
            orders.forEach((order: any) => {
                if (order.retailerId && order.retailerId._id) {
                    const id = order.retailerId._id.toString();
                    if (!retailersMap.has(id)) {
                        retailersMap.set(id, {
                            _id: order.retailerId._id,
                            businessName: order.retailerId.businessName,
                            email: order.retailerId.email,
                            phone: order.retailerId.phone,
                        });
                    }
                }
            });

            const retailers = Array.from(retailersMap.values());

            return NextResponse.json(
                { success: true, users: retailers },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { success: false, message: 'Invalid type parameter. Use "distributors" or "retailers"' },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Get active users error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
