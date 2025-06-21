import { renderHook } from '@testing-library/react';
import { useElectron } from '../../../src/renderer/hooks/useElectron';
import { ProjectConfig, ProjectType, ArchitectureType } from '../../../src/shared/types';

describe('useElectron Hook', () => {
  const mockConfig: ProjectConfig = {
    name: 'test-project',
    type: ProjectType.FULL_STACK,
    architecture: ArchitectureType.MONOLITHIC,
    technologies: {
      backend: {
        language: 'node',
        framework: 'express'
      },
      frontend: {
        framework: 'react',
        styling: 'tailwind',
        bundler: 'webpack'
      }
    },
    outputPath: '/test/path'
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('detects Electron environment correctly', () => {
    const { result } = renderHook(() => useElectron());
    expect(result.current.isElectron).toBe(true);
  });

  it('calls generateProject with correct parameters', async () => {
    const mockResult = { success: true, outputPath: '/test/path', filesGenerated: [] };
    (window.electronAPI.generateProject as jest.Mock).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useElectron());
    const response = await result.current.generateProject(mockConfig);

    expect(window.electronAPI.generateProject).toHaveBeenCalledWith(mockConfig);
    expect(response).toEqual(mockResult);
  });

  it('calls validateConfig with correct parameters', async () => {
    (window.electronAPI.validateConfig as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useElectron());
    const isValid = await result.current.validateConfig(mockConfig);

    expect(window.electronAPI.validateConfig).toHaveBeenCalledWith(mockConfig);
    expect(isValid).toBe(true);
  });

  it('calls listTemplates', async () => {
    const mockTemplates = ['template1', 'template2'];
    (window.electronAPI.listTemplates as jest.Mock).mockResolvedValue(mockTemplates);

    const { result } = renderHook(() => useElectron());
    const templates = await result.current.listTemplates();

    expect(window.electronAPI.listTemplates).toHaveBeenCalled();
    expect(templates).toEqual(mockTemplates);
  });

  it('calls selectDirectory', async () => {
    const mockPath = '/selected/path';
    (window.electronAPI.selectDirectory as jest.Mock).mockResolvedValue(mockPath);

    const { result } = renderHook(() => useElectron());
    const path = await result.current.selectDirectory();

    expect(window.electronAPI.selectDirectory).toHaveBeenCalled();
    expect(path).toBe(mockPath);
  });

  it('calls showInFolder with correct path', async () => {
    const testPath = '/test/file/path';
    
    const { result } = renderHook(() => useElectron());
    await result.current.showInFolder(testPath);

    expect(window.electronAPI.showInFolder).toHaveBeenCalledWith(testPath);
  });

  it('calls openExternal with correct URL', async () => {
    const testUrl = 'https://example.com';
    
    const { result } = renderHook(() => useElectron());
    await result.current.openExternal(testUrl);

    expect(window.electronAPI.openExternal).toHaveBeenCalledWith(testUrl);
  });

  it('throws error when Electron API is not available', () => {
    // Temporarily remove electronAPI
    const originalElectronAPI = window.electronAPI;
    delete (window as any).electronAPI;

    const { result } = renderHook(() => useElectron());
    
    expect(result.current.isElectron).toBe(false);
    expect(() => result.current.generateProject(mockConfig)).toThrow('Electron API not available');

    // Restore electronAPI
    window.electronAPI = originalElectronAPI;
  });
});