import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { VisualizationPanel } from './components/VisualizationPanel';
import { examples } from './examples/config';

function App() {
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [activeNodes, setActiveNodes] = useState<string[]>([]);
  const [trace, setTrace] = useState<any[]>([]); // Using any for trace steps for now
  const [sessionId, setSessionId] = useState<string>('');

  const currentExample = examples[currentExampleIndex];

  // Reset visualization and session when example changes
  useEffect(() => {
    setActiveNodes([]);
    setTrace([]);
    // Generate a simple random session ID
    setSessionId(Math.random().toString(36).substring(2, 15));
  }, [currentExampleIndex]);

  const handleNext = () => {
    if (currentExampleIndex < examples.length - 1) {
      setCurrentExampleIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentExampleIndex > 0) {
      setCurrentExampleIndex(prev => prev - 1);
    }
  };

  const handleResponse = (data: any) => {
    if (data.activeNodes) setActiveNodes(data.activeNodes);
    if (data.trace) setTrace(data.trace);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Header
        currentExample={currentExample}
        currentStep={currentExampleIndex + 1}
        totalSteps={examples.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ChatPanel
          key={currentExample.id}
          exampleId={currentExample.id}
          sessionId={sessionId}
          onResponse={handleResponse}
        />
        <VisualizationPanel
          visibleNodes={currentExample.visibleNodes}
          activeNodes={activeNodes}
          trace={trace}
        />
      </div>
    </div>
  );
}

export default App;
