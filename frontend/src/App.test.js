import { render } from '@testing-library/react';
// Mock axios so CRA/Jest doesn't try to parse its ESM build during tests
jest.mock('axios', () => ({
  create: jest.fn(() => ({ get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));
import App from './App';

test('App renders without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeTruthy();
});
