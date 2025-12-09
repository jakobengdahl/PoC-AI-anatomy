import { MemoryService } from './memoryService';

describe('MemoryService', () => {
  let memoryService: MemoryService;

  beforeEach(() => {
    memoryService = new MemoryService();
  });

  it('should store and retrieve messages', () => {
    const sessionId = 'test-session';
    const msg = { role: 'user' as const, content: 'Hello' };

    memoryService.addMessage(sessionId, msg);
    const history = memoryService.getHistory(sessionId);

    expect(history).toHaveLength(1);
    expect(history[0]).toEqual(msg);
  });

  it('should limit history size', () => {
    const sessionId = 'test-session-limit';

    for (let i = 0; i < 15; i++) {
      memoryService.addMessage(sessionId, { role: 'user', content: `Message ${i}` });
    }

    const history = memoryService.getHistory(sessionId);
    expect(history).toHaveLength(10);
    // Should contain the last 10 messages (5 to 14)
    expect(history[0].content).toBe('Message 5');
    expect(history[9].content).toBe('Message 14');
  });

  it('should return empty array for unknown session', () => {
    expect(memoryService.getHistory('unknown')).toEqual([]);
  });

  it('should clear history', () => {
    const sessionId = 'test-clear';
    memoryService.addMessage(sessionId, { role: 'user', content: 'Hello' });
    memoryService.clear(sessionId);
    expect(memoryService.getHistory(sessionId)).toEqual([]);
  });
});
