import { LLMService } from './llmService';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');

describe('LLMService', () => {
  let llmService: LLMService;
  let mockCreate: jest.Mock;
  const originalEnv = process.env;

  beforeEach(() => {
    // Set env var BEFORE instantiating
    process.env = { ...originalEnv, OPENAI_API_KEY: 'test-key' };

    mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Test response' } }]
    });

    // Mock implementation for the OpenAI constructor
    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }));

    llmService = new LLMService();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should call openai with correct parameters', async () => {
    const messages = [{ role: 'user', content: 'Hello' }] as any;
    await llmService.chatCompletion(messages);

    expect(mockCreate).toHaveBeenCalledWith({
      model: 'gpt-4o',
      messages
    });
  });
});
