import { Router } from 'express';
import { llmService } from '../services/llmService';

export const chatRoutes = Router();

const SYSTEM_PROMPT = "Du är en AI assistent som hjälper en anställd på en arbetsplats att planera julmat. Du har ingen tillgång till tidigare meddelanden eller annan kontext.";

chatRoutes.post('/:exampleId', async (req, res) => {
  const { exampleId } = req.params;
  const { message } = req.body;

  if (exampleId === '1') {
    try {
      // Stateless: Only use system prompt + current message
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
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
    } catch (error) {
      console.error("LLM Error:", error);
      res.status(500).json({ error: "Failed to communicate with LLM" });
    }
  } else {
    // Placeholder for other examples
     res.json({
      messages: [{ role: 'assistant', text: `Backend received: ${message} for example ${exampleId} (Not implemented yet)` }],
      trace: [],
      activeNodes: ['Client', 'Backend']
    });
  }
});
