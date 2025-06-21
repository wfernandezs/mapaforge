import '@testing-library/jest-dom';

// Mock Electron APIs for testing
const mockElectronAPI = {
  generateProject: jest.fn(),
  validateConfig: jest.fn(),
  listTemplates: jest.fn(),
  selectDirectory: jest.fn(),
  showInFolder: jest.fn(),
  openExternal: jest.fn(),
  getAppVersion: jest.fn(),
  getPlatformInfo: jest.fn(),
  onGenerationProgress: jest.fn(),
  onGenerationComplete: jest.fn(),
  onGenerationError: jest.fn(),
  on: jest.fn(),
  off: jest.fn()
};

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true
});

// Mock console methods to reduce test noise
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Setup global test utilities
beforeEach(() => {
  jest.clearAllMocks();
});