import request from 'supertest';
import express from 'express';
import { chatRoutes } from './chatRoutes';
import { llmService } from '../services/llmService';

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

  it('should return 500 if LLM fails', async () => {
    (llmService.chatCompletion as jest.Mock).mockRejectedValue(new Error('LLM Error'));

    const response = await request(app)
      .post('/api/chat/1')
      .send({ message: 'Hello' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBeDefined();
  });
});
