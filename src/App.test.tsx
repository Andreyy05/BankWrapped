import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock ResizeObserver for Recharts ResponsiveContainer in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('App component render test', () => {
  it('renders BankWrapped dashboard with KPI cards and header without throwing', () => {
    render(<App />);

    // Brand and header
    expect(screen.getByText('BankWrapped')).toBeDefined();
    expect(screen.getByText('Celkové výdaje')).toBeDefined();
    expect(screen.getByText('Celkové příjmy')).toBeDefined();
    expect(screen.getByText('Čistá bilance')).toBeDefined();
    expect(screen.getByText('Vygenerovat rekapitulaci měsíce')).toBeDefined();

    // Table elements
    expect(screen.getByPlaceholderText('Hledat obchodníka nebo poznámku...')).toBeDefined();
  });
});
