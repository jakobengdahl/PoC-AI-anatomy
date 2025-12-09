import { ExampleConfig } from '../../examples/config';

interface HeaderProps {
  currentExample: ExampleConfig;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
}

export const Header = ({ currentExample, currentStep, totalSteps, onNext, onPrevious }: HeaderProps) => {
  return (
    <header style={{
      padding: '1rem',
      borderBottom: '1px solid #444',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#333'
    }}>
      <button onClick={onPrevious} disabled={currentStep === 1} style={{ padding: '0.5rem 1rem' }}>
        &larr; Föregående
      </button>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem' }}>{currentExample.name}</h1>
        <small style={{ color: '#aaa' }}>Steg {currentStep} av {totalSteps}</small>
        <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{currentExample.description}</div>
      </div>

      <button onClick={onNext} disabled={currentStep === totalSteps} style={{ padding: '0.5rem 1rem' }}>
        Nästa &rarr;
      </button>
    </header>
  );
};
