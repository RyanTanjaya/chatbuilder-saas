// Shared chatbot type — matches the publicBot() projection from the server.
export interface Chatbot {
  id: string;
  name: string;
  description: string | null;
  welcomeMessage: string;
  accentColor: string;
  position: 'bottom-right' | 'bottom-left';
  allowedDomains: string[];
  webhookUrl: string | null;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
  conversationCount: number;
}

// Minimal projection returned by GET /api/chatbots/:id to unauthenticated
// callers (public chat page + embed widget). The owner gets a superset.
export interface PublicChatbot {
  id: string;
  name: string;
  welcomeMessage: string;
  accentColor: string;
  position: 'bottom-right' | 'bottom-left';
  allowedDomains: string[];
}

export interface NewChatbotInput {
  name: string;
  description?: string;
  welcomeMessage?: string;
  accentColor?: string;
  position?: 'bottom-right' | 'bottom-left';
  allowedDomains?: string[];
  webhookUrl?: string | null;
}
