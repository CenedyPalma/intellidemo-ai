import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { connectDB } from './config/db';
import { initializeSocket } from './socket/socket.handler';
import { Logger } from './utils/logger';
import {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
} from './types/socket.types';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app';

const startServer = async (): Promise<void> => {
    try {
        // Connect to MongoDB
        await connectDB(MONGO_URI);

        // Create Express app
        const app = createApp();

        // Create HTTP server
        const server = http.createServer(app);

        // Initialize Socket.io
        const io = new Server<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        // Setup socket event handlers
        initializeSocket(io);

        // Start server
        server.listen(PORT, () => {
            Logger.info(`💬 Chat server running on http://localhost:${PORT}`);
            Logger.info(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Handle graceful shutdown
        process.on('SIGTERM', () => {
            Logger.info('SIGTERM received, shutting down gracefully');
            server.close(() => {
                Logger.info('Server closed');
                process.exit(0);
            });
        });
    } catch (error) {
        Logger.error('Failed to start server', error);
        process.exit(1);
    }
};

startServer();
