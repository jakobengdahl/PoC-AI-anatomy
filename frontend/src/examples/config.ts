export interface ExampleConfig {
  id: string;
  name: string;
  description: string;
  visibleNodes: string[];
}

export const examples: ExampleConfig[] = [
  {
    id: '1',
    name: 'Exempel 1 – Enbart LLM',
    description: 'Stateless LLM interaction without memory.',
    visibleNodes: ['Client', 'Backend', 'LLM'],
  },
  {
    id: '2',
    name: 'Exempel 2 – LLM med chatminne',
    description: 'LLM with basic session memory.',
    visibleNodes: ['Client', 'Backend', 'Memory', 'LLM'],
  },
  {
    id: '3',
    name: 'Exempel 3 – LLM med minne + internet',
    description: 'LLM with memory and simplified internet search.',
    visibleNodes: ['Client', 'Backend', 'Memory', 'Internet', 'LLM'],
  },
  {
    id: '4',
    name: 'Exempel 4 – LLM med minne, internet och RAG',
    description: 'LLM with memory, internet, and RAG on internal documents.',
    visibleNodes: ['Client', 'Backend', 'Memory', 'Internet', 'RAG', 'LLM'],
  },
  {
    id: '5',
    name: 'Exempel 5 – Resonerande kapacitet',
    description: 'LLM with planning and reasoning capabilities.',
    visibleNodes: ['Client', 'Backend', 'Memory', 'Internet', 'RAG', 'Reasoning', 'LLM'],
  },
  {
    id: '6',
    name: 'Exempel 6 – MCP verktyg',
    description: 'LLM with planning and Human-in-the-loop MCP tools.',
    visibleNodes: [
      'Client', 'Backend', 'Memory', 'Internet', 'RAG', 'Reasoning', 'LLM',
      'MCP Email', 'MCP Form', 'MCP Task'
    ],
  },
];
