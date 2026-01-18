import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import { Analytics } from './models/Analytics.model';
import { Message } from './models/Message.model';
import { Logger } from './utils/logger';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  // Analytics API
  app.get('/api/analytics/stats', async (_req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [totalMessages, activeSessions, _aiInteractions] = await Promise.all([
        Message.countDocuments({ timestamp: { $gte: today } }),
        Promise.resolve(Math.floor(Math.random() * 10) + 1), 
        Message.countDocuments({ username: /AI Assistant/ }),
      ]);

      const avgResponseTime = Math.floor(Math.random() * 200) + 500;

      res.json({
        interactionsToday: totalMessages,
        activeSessions,
        aiResponseTime: avgResponseTime,
        aiConfidence: 0.98,
      });
    } catch (error) {
      Logger.error('Error fetching analytics', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  app.post('/api/analytics/track', async (req, res) => {
    try {
      const { eventType, metadata } = req.body;
      await Analytics.create({ eventType, metadata });
      res.status(201).json({ success: true });
    } catch (error) {
      Logger.error('Error tracking event', error);
      res.status(500).json({ error: 'Failed to track event' });
    }
  });

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '..', 'client', 'dist');
    app.use(express.static(clientDist));
    
    // SPA fallback - serve index.html for all non-API routes
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  return app;
};
