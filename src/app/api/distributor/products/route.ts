import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import ProductModel from '@/models/Product';
import { getUserFromToken } from '@/lib/auth';

// GET all products for a distributor
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check for token in header or cookie
        const authHeader = request.headers.get('authorization');
        const cookieToken = request.cookies.get('token')?.value;
        const tokenToUse = authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);

        const userData = await getUserFromToken(tokenToUse);

        if (!userData || userData.role !== 'distributor') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const products = await ProductModel.find({ distributorId: userData.userId }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, products }, { status: 200 });
    } catch (error: any) {
        console.error('Get products error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST create new product
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Check for token in header or cookie
        const authHeader = request.headers.get('authorization');
        const cookieToken = request.cookies.get('token')?.value;
        const tokenToUse = authHeader || (cookieToken ? `Bearer ${cookieToken}` : null);

        const userData = await getUserFromToken(tokenToUse);

        if (!userData || userData.role !== 'distributor') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, description, category, price, moq, stock, unit, images } = body;

        // Validate required fields
        if (!name || !description || !category || !price || !moq || !stock || !unit) {
            return NextResponse.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        const product = await ProductModel.create({
            distributorId: userData.userId,
            name,
            description,
            category,
            price: parseFloat(price),
            moq: parseInt(moq),
            stock: parseInt(stock),
            unit,
            images: images || [],
            isActive: true,
        });

        return NextResponse.json(
            { success: true, product, message: 'Product created successfully' },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create product error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
