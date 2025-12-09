import request from 'supertest';
import express from 'express';
import { chatRoutes } from './chatRoutes';
import { llmService } from '../services/llmService';
import { memoryService } from '../services/memoryService';

// Mock llmService
jest.mock('../services/llmService', () => ({
  llmService: {
    chatCompletion: jest.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/api/chat', chatRoutes);

describe('POST /api/chat/:exampleId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear all memory (we can't easily iterate all sessions in current implementation,
    // so we rely on unique sessionIds in tests or we can add a reset method to service for testing)
    // For now, using unique sessionIds per test is fine.
  });

  it('should handle example 1 correctly', async () => {
    // Setup mock
    (llmService.chatCompletion as jest.Mock).mockResolvedValue({
      choices: [{ message: { content: 'Mocked response' } }]
    });

    const response = await request(app)
      .post('/api/chat/1')
      .send({ message: 'Hello' });

    expect(response.status).toBe(200);
    expect(response.body.messages).toHaveLength(1);
    expect(response.body.messages[0].text).toBe('Mocked response');
    expect(response.body.activeNodes).toEqual(['Client', 'Backend', 'LLM']);
    expect(llmService.chatCompletion).toHaveBeenCalled();

    // Check arguments to ensure history is NOT passed (only system + user msg)
    const callArgs = (llmService.chatCompletion as jest.Mock).mock.calls[0][0];
    expect(callArgs).toHaveLength(2);
    expect(callArgs[0].role).toBe('system');
    expect(callArgs[1].role).toBe('user');
  });

  it('should handle example 2 with memory', async () => {
    const sessionId = 'test-session-2';

    // First message
    (llmService.chatCompletion as jest.Mock).mockResolvedValue({
      choices: [{ message: { content: 'Response 1' } }]
    });

    const res1 = await request(app)
      .post('/api/chat/2')
      .send({ message: 'Message 1', sessionId });

    expect(res1.status).toBe(200);
    expect(res1.body.activeNodes).toContain('Memory');
    expect(memoryService.getHistory(sessionId)).toHaveLength(2); // User + Assistant

    // Second message
    (llmService.chatCompletion as jest.Mock).mockResolvedValue({
      choices: [{ message: { content: 'Response 2' } }]
    });

    const res2 = await request(app)
      .post('/api/chat/2')
      .send({ message: 'Message 2', sessionId });

    expect(res2.status).toBe(200);
    expect(memoryService.getHistory(sessionId)).toHaveLength(4); // User + Assistant + User + Assistant

    // Check LLM call arguments for second call - should contain history
    // [System, User1, Asst1, User2]
    // The mock.calls array accumulates calls.
    const lastCallArgs = (llmService.chatCompletion as jest.Mock).mock.calls[1][0];
    expect(lastCallArgs).toHaveLength(4);
    expect(lastCallArgs[1].content).toBe('Message 1');
    expect(lastCallArgs[2].content).toBe('Response 1');
    expect(lastCallArgs[3].content).toBe('Message 2');
  });

  it('should return 400 if sessionId missing for example 2', async () => {
    const response = await request(app)
      .post('/api/chat/2')
      .send({ message: 'Hello' }); // No sessionId

    expect(response.status).toBe(400);
  });

  it('should return 500 if LLM fails', async () => {
    (llmService.chatCompletion as jest.Mock).mockRejectedValue(new Error('LLM Error'));

    const response = await request(app)
      .post('/api/chat/1')
      .send({ message: 'Hello' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBeDefined();
  });
});
