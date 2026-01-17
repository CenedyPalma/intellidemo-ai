export class Logger {
    private static getTimestamp(): string {
        return new Date().toISOString();
    }

    static info(message: string, data?: unknown): void {
        console.log(`[${this.getTimestamp()}] INFO: ${message}`, data || '');
    }

    static error(message: string, error?: unknown): void {
        console.error(`[${this.getTimestamp()}] ERROR: ${message}`, error || '');
    }

    static warn(message: string, data?: unknown): void {
        console.warn(`[${this.getTimestamp()}] WARN: ${message}`, data || '');
    }

    static debug(message: string, data?: unknown): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[${this.getTimestamp()}] DEBUG: ${message}`, data || '');
        }
    }
}
