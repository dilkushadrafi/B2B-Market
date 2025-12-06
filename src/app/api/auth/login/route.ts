import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import UserModel from '@/models/User';
import { comparePassword, generateToken } from '@/lib/auth';
import { AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' } as AuthResponse,
                { status: 400 }
            );
        }

        // Find user
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' } as AuthResponse,
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, message: 'Invalid credentials' } as AuthResponse,
                { status: 401 }
            );
        }

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
                    contactPerson: user.contactPerson,
                    phone: user.phone,
                    address: user.address,
                },
            } as AuthResponse,
            { status: 200 }
        );

        response.cookies.set('token', token, {
            httpOnly: false, // Allow client to read if needed, or keep true and rely on API
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' } as AuthResponse,
            { status: 500 }
        );
    }
}
