// Shapes returned by the analytics endpoints (GET /api/stats and
// /api/conversations[/:id]). All owner-scoped — see server/src/routes/analytics.ts.
import type { ChatSource } from './chat';

export interface StatTotals {
  chatbots: number;
  documents: number;
  conversations: number;
  messages: number;
}

export interface PerBotStat {
  id: string;
  name: string;
  accentColor: string;
  conversations: number;
  messages: number;
  documents: number;
}

export interface RecentConversation {
  id: string;
  botId: string;
  botName: string;
  accentColor: string;
  preview: string;
  messageCount: number;
  updatedAt: string;
}

export interface StatsResponse {
  totals: StatTotals;
  perBot: PerBotStat[];
  recent: RecentConversation[];
}

export interface ConversationSummary {
  id: string;
  botId: string;
  botName: string;
  accentColor: string;
  visitorId: string | null;
  preview: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  createdAt: string;
}

export interface ConversationDetail {
  id: string;
  botId: string;
  botName: string;
  accentColor: string;
  visitorId: string | null;
  createdAt: string;
  messages: ConversationMessage[];
}
