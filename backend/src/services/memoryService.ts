export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class MemoryService {
  private store: Record<string, ChatMessage[]> = {};
  private MAX_HISTORY = 10;

  getHistory(sessionId: string): ChatMessage[] {
    return this.store[sessionId] || [];
  }

  addMessage(sessionId: string, message: ChatMessage) {
    if (!this.store[sessionId]) {
      this.store[sessionId] = [];
    }
    this.store[sessionId].push(message);

    // Enforce limit (keep last N)
    if (this.store[sessionId].length > this.MAX_HISTORY) {
      this.store[sessionId] = this.store[sessionId].slice(-this.MAX_HISTORY);
    }
  }

  clear(sessionId: string) {
    delete this.store[sessionId];
  }
}

export const memoryService = new MemoryService();
