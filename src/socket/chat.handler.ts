import { TypedSocket, MessagePayload } from '../types/socket.types';
import { Message } from '../models/Message.model';
import { Logger } from '../utils/logger';
import {
    getChatbotResponse,
    shouldBotRespond,
    cleanMessageForBot,
} from '../services/chatbot.service';
import { Server } from 'socket.io';

export const handleChatEvents = (socket: TypedSocket, io: Server): void => {
    // Handle incoming messages
    socket.on('message', async (data: MessagePayload) => {
        try {
            Logger.debug('Message received', data);

            // Create message with timestamp
            const chatMessage = {
                ...data,
                dateTime: new Date().toISOString(),
            };

            // Save to database
            await Message.create({
                username: data.name,
                message: data.message,
                timestamp: new Date(),
                ...(data.replyTo && { replyTo: data.replyTo }),
            });

            Logger.info(`Message saved: ${data.name} - ${data.message}`);

            // Broadcast to all other clients
            socket.broadcast.emit('chat-message', chatMessage);

            // Check if bot should respond
            if (shouldBotRespond(data.message)) {
                // Check if it's a command first
                const cleanedMessage = cleanMessageForBot(data.message);
                const { handleBotCommand } = await import('../services/chatbot.service');
                const commandResponse = handleBotCommand(cleanedMessage);

                if (commandResponse) {
                    // It's a command, send immediate response
                    const botMessage = {
                        name: 'AI Assistant 🤖',
                        message: commandResponse,
                        dateTime: new Date().toISOString(),
                    };

                    await Message.create({
                        username: botMessage.name,
                        message: botMessage.message,
                        timestamp: new Date(),
                    });

                    io.emit('chat-message', botMessage);
                    Logger.info(`Bot executed command: ${cleanedMessage.substring(0, 30)}...`);
                } else {
                    // Not a command, get AI response
                    io.emit('feedback', { feedback: 'AI Assistant is thinking...' });

                    const botResponse = await getChatbotResponse(cleanedMessage, data.name);

                    io.emit('feedback', { feedback: '' });

                    const botMessage = {
                        name: 'AI Assistant 🤖',
                        message: botResponse,
                        dateTime: new Date().toISOString(),
                    };

                    await Message.create({
                        username: botMessage.name,
                        message: botMessage.message,
                        timestamp: new Date(),
                    });

                    io.emit('chat-message', botMessage);

                    Logger.info(`Bot responded: ${botResponse.substring(0, 50)}...`);
                }
            }
        } catch (error) {
            Logger.error('Error handling message', error);
        }
    });

    // Handle typing feedback
    socket.on('feedback', (data) => {
        Logger.debug('Feedback received', data);
        socket.broadcast.emit('feedback', data);
    });
};
