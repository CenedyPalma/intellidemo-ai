import Groq from 'groq-sdk';
import { Logger } from '../utils/logger';

// Lazy-initialize Groq client to ensure env vars are loaded
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
    if (!groqClient) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not set in environment variables');
        }
        groqClient = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });
    }
    return groqClient;
}

// Bot configuration
const BOT_NAME = 'AI Assistant';
const BOT_MODEL = 'llama-3.3-70b-versatile';

// Bot personalities
export type BotPersonality = 'friendly' | 'professional' | 'funny' | 'expert' | 'concise';

const PERSONALITIES: Record<BotPersonality, string> = {
    friendly: `You are a friendly and enthusiastic AI assistant named "${BOT_NAME}". 
    Be warm, supportive, and encouraging. Use emojis occasionally. Keep responses brief (2-3 sentences).
    You're chatting in a group, so be inclusive and friendly to everyone.`,

    professional: `You are a professional AI assistant named "${BOT_NAME}". 
    Be formal, precise, and helpful. Focus on providing accurate information.
    Keep responses concise and well-structured (2-3 sentences). Maintain a business-like tone.`,

    funny: `You are a witty and humorous AI assistant named "${BOT_NAME}". 
    Make jokes, use puns, and keep the conversation light and entertaining.
    Keep responses brief (2-3 sentences) but include humor. Don't overdo it - stay helpful!`,

    expert: `You are an expert AI assistant named "${BOT_NAME}" with deep technical knowledge.
    Provide detailed, technical explanations when needed. Use proper terminology.
    Be thorough but concise (2-4 sentences). You're knowledgeable in programming, tech, and science.`,

    concise: `You are "${BOT_NAME}", a concise AI assistant. 
    Give direct, to-the-point answers. No fluff. 1-2 sentences maximum.
    Be helpful but extremely brief.`,
};

// Current personality (default to friendly)
let currentPersonality: BotPersonality = 'friendly';

// Conversation history
const conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
}> = [];

export async function getChatbotResponse(userMessage: string, userName: string): Promise<string> {
    try {
        const groq = getGroqClient();

        // Add user message to history
        conversationHistory.push({
            role: 'user',
            content: `${userName}: ${userMessage}`,
        });

        // Keep only last 10 messages
        if (conversationHistory.length > 10) {
            conversationHistory.shift();
        }

        // Call Groq API with current personality
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: PERSONALITIES[currentPersonality],
                },
                ...conversationHistory.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
            ],
            model: BOT_MODEL,
            temperature: currentPersonality === 'funny' ? 0.9 : currentPersonality === 'professional' ? 0.5 : 0.7,
            max_tokens: currentPersonality === 'concise' ? 100 : currentPersonality === 'expert' ? 300 : 200,
        });

        const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";

        // Add assistant response to history
        conversationHistory.push({
            role: 'assistant',
            content: response,
        });

        Logger.info(`Bot responded (${currentPersonality}): ${response.substring(0, 50)}...`);
        return response;
    } catch (error) {
        Logger.error('Error getting chatbot response', error);
        return "Sorry, I'm having trouble connecting right now. Please try again later.";
    }
}

// Handle bot commands
export function handleBotCommand(command: string): string | null {
    const cmd = command.toLowerCase().trim();

    // Help command
    if (cmd === '/help' || cmd === '!help') {
        return `**🤖 Bot Commands:**
• Mention me: @bot, @ai, hey bot, hi ai
• /personality [mode] - Change my personality
• /clear - Clear conversation history
• /help - Show this help

**Personalities:** friendly, professional, funny, expert, concise
Current: **${currentPersonality}** 🎭`;
    }

    // Clear history
    if (cmd === '/clear') {
        conversationHistory.length = 0;
        return '✅ Conversation history cleared! Starting fresh.';
    }

    // Personality change
    if (cmd.startsWith('/personality')) {
        const parts = cmd.split(' ');
        const newPersonality = parts[1] as BotPersonality;

        if (newPersonality && PERSONALITIES[newPersonality]) {
            currentPersonality = newPersonality;
            conversationHistory.length = 0; // Clear history when changing personality
            return `✅ Personality changed to **${newPersonality}**! ${getPersonalityEmoji(newPersonality)}`;
        } else {
            return `❌ Invalid personality. Choose from: ${Object.keys(PERSONALITIES).join(', ')}
Current: **${currentPersonality}**`;
        }
    }

    return null; // Not a command
}

function getPersonalityEmoji(personality: BotPersonality): string {
    const emojis: Record<BotPersonality, string> = {
        friendly: '😊',
        professional: '💼',
        funny: '😄',
        expert: '🧠',
        concise: '⚡',
    };
    return emojis[personality];
}

// Check if message is directed to the bot
// For demo purposes: Bot responds to ALL messages (no @bot required)
export function shouldBotRespond(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // Check for commands first
    if (lowerMessage.startsWith('/') || lowerMessage.startsWith('!')) {
        return true;
    }

    // DEMO MODE: Always respond to engage visitors
    // In production, you might want to restore trigger-based responses
    return true;
}

// Clean message for bot (remove trigger words)
export function cleanMessageForBot(message: string): string {
    return message
        .replace(/@bot/gi, '')
        .replace(/@ai/gi, '')
        .replace(/@assistant/gi, '')
        .replace(/hey bot/gi, '')
        .replace(/hey ai/gi, '')
        .replace(/hi bot/gi, '')
        .replace(/hi ai/gi, '')
        .trim();
}

// Get current personality
export function getCurrentPersonality(): BotPersonality {
    return currentPersonality;
}
