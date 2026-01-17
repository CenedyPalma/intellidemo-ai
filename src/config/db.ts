import mongoose from 'mongoose';
import { Logger } from '../utils/logger';

export const connectDB = async (mongoURI: string): Promise<void> => {
    try {
        await mongoose.connect(mongoURI);
        Logger.info('✅ MongoDB connected successfully');
    } catch (error) {
        Logger.error('❌ MongoDB connection failed', error);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    Logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
    Logger.error('MongoDB error', error);
});
