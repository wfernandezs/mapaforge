/**
 * Copyright (c) 2025 MapaForge
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useEffect, useCallback } from 'react';
import { ProjectConfig, GenerationResult, GenerationProgress } from '@shared/types';

export const useElectron = () => {
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  const generateProject = useCallback((config: ProjectConfig): Promise<GenerationResult> => {
    if (!isElectron) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.generateProject(config);
  }, [isElectron]);

  const validateConfig = useCallback((config: ProjectConfig): Promise<boolean> => {
    if (!isElectron) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.validateConfig(config);
  }, [isElectron]);

  const listTemplates = useCallback((): Promise<string[]> => {
    if (!isElectron) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.listTemplates();
  }, [isElectron]);

  const selectDirectory = useCallback((): Promise<string | null> => {
    if (!isElectron) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.selectDirectory();
  }, [isElectron]);

  const showInFolder = useCallback((filePath: string): Promise<void> => {
    if (!isElectron) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.showInFolder(filePath);
  }, [isElectron]);

  const openExternal = useCallback((url: string): Promise<void> => {
    if (!isElectron) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.openExternal(url);
  }, [isElectron]);

  const getAppVersion = useCallback((): Promise<string> => {
    if (!isElectron) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.getAppVersion();
  }, [isElectron]);

  const getPlatformInfo = useCallback(() => {
    if (!isElectron) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.getPlatformInfo();
  }, [isElectron]);

  const onGenerationProgress = useCallback((callback: (progress: GenerationProgress) => void) => {
    if (!isElectron) {
      throw new Error('Electron API not available');
    }
    window.electronAPI.onGenerationProgress(callback);
  }, [isElectron]);

  const onGenerationComplete = useCallback((callback: (result: GenerationResult) => void) => {
    if (!isElectron) {
      throw new Error('Electron API not available');
    }
    window.electronAPI.onGenerationComplete(callback);
  }, [isElectron]);

  const onGenerationError = useCallback((callback: (error: { message: string; stack?: string }) => void) => {
    if (!isElectron) {
      throw new Error('Electron API not available');
    }
    window.electronAPI.onGenerationError(callback);
  }, [isElectron]);

  return {
    isElectron,
    generateProject,
    validateConfig,
    listTemplates,
    selectDirectory,
    showInFolder,
    openExternal,
    getAppVersion,
    getPlatformInfo,
    onGenerationProgress,
    onGenerationComplete,
    onGenerationError
  };
};

export const useElectronEvents = (
  onProgress?: (progress: GenerationProgress) => void,
  onComplete?: (result: GenerationResult) => void,
  onError?: (error: { message: string; stack?: string }) => void
) => {
  const { isElectron, onGenerationProgress, onGenerationComplete, onGenerationError } = useElectron();

  useEffect(() => {
    if (!isElectron) return;

    if (onProgress) {
      onGenerationProgress(onProgress);
    }

    if (onComplete) {
      onGenerationComplete(onComplete);
    }

    if (onError) {
      onGenerationError(onError);
    }
  }, [isElectron, onProgress, onComplete, onError, onGenerationProgress, onGenerationComplete, onGenerationError]);
};