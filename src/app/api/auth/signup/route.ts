import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import UserModel from '@/models/User';
import { hashPassword, generateToken } from '@/lib/auth';
import { AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, password, role, businessName, contactPerson, phone, address } = body;

        // Validate required fields
        if (!email || !password || !role || !businessName || !contactPerson || !phone || !address) {
            return NextResponse.json(
                { success: false, message: 'All fields are required' } as AuthResponse,
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'Email already registered' } as AuthResponse,
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const user = await UserModel.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            businessName,
            contactPerson,
            phone,
            address,
            isVerified: true,
        });

        // Generate token
        const token = await generateToken({
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        const response = NextResponse.json(
            {
                success: true,
                token,
                user: {
                    _id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    businessName: user.businessName,
                },
            } as AuthResponse,
            { status: 201 }
        );

        response.cookies.set('token', token, {
            httpOnly: false, // Allow client to read if needed
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' } as AuthResponse,
            { status: 500 }
        );
    }
}
