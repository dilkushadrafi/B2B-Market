import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import ProductModel from '@/models/Product';
import { getUserFromToken } from '@/lib/auth';

// GET single product
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const product = await ProductModel.findById(id);

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, product }, { status: 200 });
    } catch (error: any) {
        console.error('Get product error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT update product
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

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
        const { name, description, category, price, moq, stock, unit, images, isActive } = body;

        // Check if product belongs to distributor
        const product = await ProductModel.findById(id);

        if (!product || product.distributorId.toString() !== userData.userId.toString()) {
            return NextResponse.json(
                { success: false, message: 'Product not found or unauthorized' },
                { status: 404 }
            );
        }

        // Update product
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            id,
            {
                name,
                description,
                category,
                price: parseFloat(price),
                moq: parseInt(moq),
                stock: parseInt(stock),
                unit,
                images,
                isActive,
            },
            { new: true }
        );

        return NextResponse.json(
            { success: true, product: updatedProduct, message: 'Product updated successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Update product error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

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

        // Check if product belongs to distributor
        const product = await ProductModel.findById(id);
        if (!product || product.distributorId.toString() !== userData.userId.toString()) {
            return NextResponse.json(
                { success: false, message: 'Product not found or unauthorized' },
                { status: 404 }
            );
        }

        await ProductModel.findByIdAndDelete(id);

        return NextResponse.json(
            { success: true, message: 'Product deleted successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Delete product error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
