import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('header exists', () => {
  render(<App />);
  const linkElement = screen.getByText(/საწვავი საქართველოში/i);
  expect(linkElement).toBeInTheDocument();
});