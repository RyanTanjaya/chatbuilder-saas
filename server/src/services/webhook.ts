// Outbound webhook fired once when a brand-new conversation begins. This is a
// best-effort, fire-and-forget notification: the chat response has already been
// sent to the visitor by the time we call this, so a slow or failing endpoint
// must never affect them. We swallow all errors (logging a warning) and cap the
// request with a short timeout so a hung endpoint can't pile up open sockets.
export interface ConversationWebhookPayload {
  event: 'conversation.created';
  chatbotId: string;
  chatbotName: string;
  conversationId: string;
  visitorId: string | null;
  message: { role: 'user'; content: string };
  createdAt: string;
}

export async function fireConversationWebhook(
  url: string,
  payload: ConversationWebhookPayload
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ChatBuilder-Webhook/1.0',
        'X-ChatBuilder-Event': payload.event,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.warn(`[chatbuilder] webhook POST to ${url} failed: ${detail}`);
  } finally {
    clearTimeout(timer);
  }
}
