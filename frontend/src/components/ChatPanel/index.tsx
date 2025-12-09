import { useState, useRef, useEffect } from 'react';

interface ChatPanelProps {
  exampleId: string;
  sessionId: string;
  onResponse: (data: any) => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const ChatPanel = ({ exampleId, sessionId, onResponse }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // In a real app, URL should come from env
      const response = await fetch(`http://localhost:3000/api/chat/${exampleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.text,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.messages) {
        setMessages(prev => [...prev, ...data.messages]);
      }

      onResponse(data);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error connecting to backend.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #444',
      backgroundColor: '#1e1e1e'
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>
            Starta konversationen för exempel {exampleId}...
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            backgroundColor: msg.role === 'user' ? '#007acc' : '#333',
            padding: '0.8rem',
            borderRadius: '8px',
            maxWidth: '80%',
            lineHeight: '1.4'
          }}>
            <strong>{msg.role === 'user' ? 'Du' : 'Assistent'}: </strong>
            {msg.text}
          </div>
        ))}
        {isLoading && <div style={{ color: '#aaa', fontStyle: 'italic' }}>Assistenten skriver...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid #444', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Skriv ett meddelande..."
          style={{
            flex: 1,
            padding: '0.8rem',
            borderRadius: '4px',
            border: '1px solid #555',
            backgroundColor: '#2d2d2d',
            color: 'white'
          }}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '0 1.5rem',
            backgroundColor: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          Skicka
        </button>
      </div>
    </div>
  );
};
