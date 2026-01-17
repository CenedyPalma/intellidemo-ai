import { Server } from 'socket.io';
import {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
    TypedSocket,
} from '../types/socket.types';
import { handleChatEvents } from './chat.handler';
import { Logger } from '../utils/logger';

const connectedSockets = new Set<string>();

export const initializeSocket = (
    io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
): void => {
    io.on('connection', (socket: TypedSocket) => {
        Logger.info(`Socket connected: ${socket.id}`);

        // Add to connected sockets
        connectedSockets.add(socket.id);

        // Emit total connected clients
        io.emit('clients-total', connectedSockets.size);

        // Initialize chat event handlers
        handleChatEvents(socket, io);

        // Handle disconnection
        socket.on('disconnect', () => {
            Logger.info(`Socket disconnected: ${socket.id}`);
            connectedSockets.delete(socket.id);
            io.emit('clients-total', connectedSockets.size);
        });
    });
};
