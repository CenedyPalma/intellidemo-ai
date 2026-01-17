import { Socket } from 'socket.io';

export interface MessagePayload {
    name: string;
    message: string;
    replyTo?: {
        username: string;
        message: string;
    };
}

export interface ChatMessage extends MessagePayload {
    dateTime: string;
}

export interface FeedbackPayload {
    feedback: string;
}

export interface ServerToClientEvents {
    'clients-total': (count: number) => void;
    'chat-message': (data: ChatMessage) => void;
    feedback: (data: FeedbackPayload) => void;
}

export interface ClientToServerEvents {
    message: (data: MessagePayload) => void;
    feedback: (data: FeedbackPayload) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    username?: string;
}

export type TypedSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;
