import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalytics extends Document {
  eventType: string; // 'interaction', 'visit', 'feedback'
  metadata: Record<string, unknown>;
  timestamp: Date;
}

const AnalyticsSchema: Schema = new Schema({
  eventType: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
});

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
