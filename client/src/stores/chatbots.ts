// Chatbot list cache. The dashboard hits load() once on mount and after every
// mutation; individual screens (detail, settings) pull the current bot from
// here so we don't refetch on every nav.
import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Chatbot, NewChatbotInput } from '@/types/chatbot';

interface ChatbotState {
  list: Chatbot[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  create: (input: NewChatbotInput) => Promise<Chatbot>;
  update: (id: string, patch: Partial<NewChatbotInput>) => Promise<Chatbot>;
  remove: (id: string) => Promise<void>;
  getById: (id: string) => Chatbot | undefined;
}

export const useChatbots = create<ChatbotState>((set, get) => ({
  list: [],
  loading: false,
  loaded: false,

  load: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get<{ chatbots: Chatbot[] }>('/chatbots');
      set({ list: data.chatbots, loading: false, loaded: true });
    } catch {
      set({ loading: false });
    }
  },

  create: async (input) => {
    const { data } = await api.post<{ chatbot: Chatbot }>('/chatbots', input);
    set((s) => ({ list: [data.chatbot, ...s.list] }));
    return data.chatbot;
  },

  update: async (id, patch) => {
    const { data } = await api.put<{ chatbot: Chatbot }>(`/chatbots/${id}`, patch);
    set((s) => ({ list: s.list.map((b) => (b.id === id ? data.chatbot : b)) }));
    return data.chatbot;
  },

  remove: async (id) => {
    await api.delete(`/chatbots/${id}`);
    set((s) => ({ list: s.list.filter((b) => b.id !== id) }));
  },

  getById: (id) => get().list.find((b) => b.id === id),
}));
