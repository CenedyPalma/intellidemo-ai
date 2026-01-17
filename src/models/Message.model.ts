import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    username: string;
    message: string;
    timestamp: Date;
    replyTo?: {
        username: string;
        message: string;
    };
}

const MessageSchema = new Schema<IMessage>(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            maxlength: [50, 'Username cannot exceed 50 characters'],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
            maxlength: [1000, 'Message cannot exceed 1000 characters'],
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        replyTo: {
            type: {
                username: String,
                message: String,
            },
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
MessageSchema.index({ timestamp: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
