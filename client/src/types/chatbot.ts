// Shared chatbot type — matches the publicBot() projection from the server.
export interface Chatbot {
  id: string;
  name: string;
  description: string | null;
  welcomeMessage: string;
  accentColor: string;
  position: 'bottom-right' | 'bottom-left';
  allowedDomains: string[];
  createdAt: string;
  updatedAt: string;
  documentCount: number;
  conversationCount: number;
}

export interface NewChatbotInput {
  name: string;
  description?: string;
  welcomeMessage?: string;
  accentColor?: string;
  position?: 'bottom-right' | 'bottom-left';
}
