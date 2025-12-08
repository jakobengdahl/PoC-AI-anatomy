import { render } from '@testing-library/react';
import { VisualizationPanel } from './index';
import { expect, test } from 'vitest';

test('VisualizationPanel matches snapshot with active nodes', () => {
  const activeNodes = ['Client', 'Backend', 'LLM'];
  const { container } = render(<VisualizationPanel activeNodes={activeNodes} />);
  expect(container).toMatchSnapshot();
});

test('VisualizationPanel matches snapshot with specific visible nodes', () => {
  const visibleNodes = ['Client', 'Backend'];
  const { container } = render(<VisualizationPanel visibleNodes={visibleNodes} />);
  expect(container).toMatchSnapshot();
});

test('VisualizationPanel matches snapshot with no active nodes', () => {
  const { container } = render(<VisualizationPanel />);
  expect(container).toMatchSnapshot();
});

test('VisualizationPanel matches snapshot with trace', () => {
  const trace = [{ from: 'Client', to: 'Backend' }, { from: 'Backend', to: 'LLM' }];
  const { container } = render(<VisualizationPanel trace={trace} activeNodes={['Client']} />);
  expect(container).toMatchSnapshot();
});
