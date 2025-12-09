import OpenAI from 'openai';

export class LLMService {
  private client: OpenAI;
  private hasKey: boolean;

  constructor() {
    // OpenAI client throws if apiKey is missing.
    // We provide a dummy key if missing to prevent crash on startup,
    // but flag it so we don't try to use it.
    const apiKey = process.env.OPENAI_API_KEY;
    this.hasKey = !!apiKey && apiKey !== 'your_key_here';

    this.client = new OpenAI({
      apiKey: apiKey || 'dummy_key_to_prevent_crash',
    });
  }

  async chatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    if (!this.hasKey) {
      console.warn("No valid OpenAI API Key found. Returning mock response.");
      return {
        choices: [{
          message: {
            content: "Detta är ett mockat svar eftersom ingen giltig OpenAI API-nyckel hittades i miljövariablerna. Vänligen konfigurera backend/.env."
          }
        }]
      };
    }

    return this.client.chat.completions.create({
      model: 'gpt-4o',
      messages,
    });
  }
}

export const llmService = new LLMService();
