import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { ConversationModel, MessageModel } from '@/models/Chat';
import UserModel from '@/models/User';
import { getUserFromToken, verifyToken } from '@/lib/auth';

// GET - Get all conversations for a user
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

        // Get conversations based on user role
        const query = userData.role === 'retailer'
            ? { retailerId: userData.userId }
            : { distributorId: userData.userId };

        const conversations = await ConversationModel.find(query)
            .sort({ lastMessageTime: -1 });

        return NextResponse.json(
            { success: true, conversations },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Get conversations error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Create or get conversation
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

        if (!userData) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if we have businessName in userData (it might be missing in token)
        let businessName = userData.businessName;
        if (!businessName) {
            const user = await UserModel.findById(userData.userId);
            if (user) {
                businessName = user.businessName;
                // Update userData for this request context
                userData = { ...userData, businessName };
            }
        }

        const body = await request.json();
        const { otherUserId, otherUserName } = body;

        if (!otherUserId || !otherUserName) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Determine retailer and distributor
        const isRetailer = userData.role === 'retailer';
        const retailerId = isRetailer ? userData.userId : otherUserId;
        const distributorId = isRetailer ? otherUserId : userData.userId;
        const retailerName = isRetailer ? userData.businessName : otherUserName;
        const distributorName = isRetailer ? otherUserName : userData.businessName;

        // Find or create conversation
        let conversation = await ConversationModel.findOne({
            retailerId,
            distributorId,
        });

        if (!conversation) {
            conversation = await ConversationModel.create({
                retailerId,
                distributorId,
                retailerName,
                distributorName,
            });
        }

        return NextResponse.json(
            { success: true, conversation },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Create conversation error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
