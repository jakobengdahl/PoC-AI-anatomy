import { LLMService } from './llmService';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');

describe('LLMService', () => {
  let llmService: LLMService;
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Test response' } }]
    });

    // Reset the mock implementation for the constructor
    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    }));

    llmService = new LLMService();
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
