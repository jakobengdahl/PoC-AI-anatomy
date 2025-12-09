import { Router } from 'express';
import { llmService } from '../services/llmService';
import { memoryService } from '../services/memoryService';

export const chatRoutes = Router();

const SYSTEM_PROMPT_1 = "Du är en AI assistent som hjälper en anställd på en arbetsplats att planera julmat. Du har ingen tillgång till tidigare meddelanden eller annan kontext.";
const SYSTEM_PROMPT_2 = "Du är en AI assistent som hjälper en anställd på en arbetsplats att planera julmat. Du har tillgång till tidigare meddelanden i denna konversation.";

chatRoutes.post('/:exampleId', async (req, res) => {
  const { exampleId } = req.params;
  const { message, sessionId } = req.body;

  try {
    if (exampleId === '1') {
      // Stateless: Only use system prompt + current message
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT_1 },
        { role: 'user', content: message }
      ];

      const completion = await llmService.chatCompletion(messages as any);
      const answer = completion.choices[0]?.message?.content || "Ursäkta, jag kunde inte generera ett svar.";

      res.json({
        messages: [{ role: 'assistant', text: answer }],
        trace: [
          { from: "Client", to: "Backend" },
          { from: "Backend", to: "LLM" },
          { from: "LLM", "to": "Backend" },
          { from: "Backend", "to": "Client" }
        ],
        activeNodes: ["Client", "Backend", "LLM"]
      });

    } else if (exampleId === '2') {
      if (!sessionId) {
         res.status(400).json({ error: "Session ID required for example 2" });
         return;
      }

      // 1. Add user message to memory
      memoryService.addMessage(sessionId, { role: 'user', content: message });

      // 2. Retrieve full history
      const history = memoryService.getHistory(sessionId);

      // 3. Prepare messages for LLM
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT_2 },
        ...history
      ];

      // 4. Call LLM
      const completion = await llmService.chatCompletion(messages as any);
      const answer = completion.choices[0]?.message?.content || "Ursäkta, jag kunde inte generera ett svar.";

      // 5. Add assistant response to memory
      memoryService.addMessage(sessionId, { role: 'assistant', content: answer });

      res.json({
        messages: [{ role: 'assistant', text: answer }],
        trace: [
          { from: "Client", to: "Backend" },
          { from: "Backend", to: "Memory" },
          { from: "Memory", to: "Backend" },
          { from: "Backend", to: "LLM" },
          { from: "LLM", to: "Backend" },
          { from: "Backend", to: "Client" }
        ],
        activeNodes: ["Client", "Backend", "Memory", "LLM"]
      });

    } else {
      // Placeholder for other examples
      res.json({
        messages: [{ role: 'assistant', text: `Backend received: ${message} for example ${exampleId} (Not implemented yet)` }],
        trace: [],
        activeNodes: ['Client', 'Backend']
      });
    }
  } catch (error) {
    console.error("LLM Error:", error);
    res.status(500).json({ error: "Failed to communicate with LLM" });
  }
});
