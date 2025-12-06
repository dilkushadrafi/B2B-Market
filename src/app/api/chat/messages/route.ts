import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { ConversationModel, MessageModel } from '@/models/Chat';
import { getUserFromToken, verifyToken } from '@/lib/auth';

// GET - Get messages for a conversation
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
        const conversationId = searchParams.get('conversationId');

        if (!conversationId) {
            return NextResponse.json(
                { success: false, message: 'Conversation ID required' },
                { status: 400 }
            );
        }

        // Verify user has access to this conversation
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
            return NextResponse.json(
                { success: false, message: 'Conversation not found' },
                { status: 404 }
            );
        }

        const hasAccess = userData.role === 'retailer'
            ? conversation.retailerId === userData.userId
            : conversation.distributorId === userData.userId;

        if (!hasAccess) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get messages
        const messages = await MessageModel.find({ conversationId })
            .sort({ createdAt: 1 });

        // Mark messages as read
        await MessageModel.updateMany(
            {
                conversationId,
                senderId: { $ne: userData.userId },
                read: false,
            },
            { read: true }
        );

        // Update unread count
        if (userData.role === 'retailer') {
            conversation.unreadCountRetailer = 0;
        } else {
            conversation.unreadCountDistributor = 0;
        }
        await conversation.save();

        return NextResponse.json(
            { success: true, messages },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Send a message
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

        const body = await request.json();
        const { conversationId, message } = body;

        if (!conversationId || !message) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify conversation exists and user has access
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation) {
            return NextResponse.json(
                { success: false, message: 'Conversation not found' },
                { status: 404 }
            );
        }

        const hasAccess = userData.role === 'retailer'
            ? conversation.retailerId === userData.userId
            : conversation.distributorId === userData.userId;

        if (!hasAccess) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Create message
        const newMessage = await MessageModel.create({
            conversationId,
            senderId: userData.userId,
            senderRole: userData.role,
            senderName: userData.businessName || userData.email,
            message,
            read: false,
        });

        // Update conversation
        conversation.lastMessage = message;
        conversation.lastMessageTime = new Date();

        // Increment unread count for the other user
        if (userData.role === 'retailer') {
            conversation.unreadCountDistributor += 1;
        } else {
            conversation.unreadCountRetailer += 1;
        }

        await conversation.save();

        return NextResponse.json(
            { success: true, message: newMessage },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
