import mongoose, { Schema, Model } from 'mongoose';

export interface IMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    senderRole: 'retailer' | 'distributor';
    senderName: string;
    message: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IConversation {
    _id: string;
    retailerId: string;
    distributorId: string;
    retailerName: string;
    distributorName: string;
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCountRetailer: number;
    unreadCountDistributor: number;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: String,
            required: true,
            index: true,
        },
        senderId: {
            type: String,
            required: true,
        },
        senderRole: {
            type: String,
            required: true,
            enum: ['retailer', 'distributor'],
        },
        senderName: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const ConversationSchema = new Schema<IConversation>(
    {
        retailerId: {
            type: String,
            required: true,
            index: true,
        },
        distributorId: {
            type: String,
            required: true,
            index: true,
        },
        retailerName: {
            type: String,
            required: true,
        },
        distributorName: {
            type: String,
            required: true,
        },
        lastMessage: {
            type: String,
        },
        lastMessageTime: {
            type: Date,
        },
        unreadCountRetailer: {
            type: Number,
            default: 0,
        },
        unreadCountDistributor: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
ConversationSchema.index({ retailerId: 1, distributorId: 1 }, { unique: true });

export const MessageModel: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export const ConversationModel: Model<IConversation> =
    mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
