// Chat message + source shapes used by the chat UI. ChatMessage is the
// client-side render model (with transient `pending`/`error` flags); the
// server only ever sends back role/content/sources.
export interface ChatSource {
  documentId: string;
  filename: string;
}

export interface ChatMessage {
  id: string; // client-generated, used as the React key
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  pending?: boolean; // assistant placeholder while we wait on the API
  error?: boolean; // request failed — render the bubble in an error style
}

// POST /api/chatbots/:id/chat response.
export interface ChatResponse {
  conversationId: string;
  message: {
    role: 'assistant';
    content: string;
    sources?: ChatSource[];
    createdAt: string;
  };
}
