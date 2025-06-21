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

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ProjectConfig, GenerationResult, GenerationProgress } from '@shared/types';

export interface ElectronAPI {
  // Project generation
  generateProject: (config: ProjectConfig) => Promise<GenerationResult>;
  validateConfig: (config: ProjectConfig) => Promise<boolean>;
  
  // Templates
  listTemplates: () => Promise<string[]>;
  
  // File system
  selectDirectory: () => Promise<string | null>;
  showInFolder: (filePath: string) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  
  // App info
  getAppVersion: () => Promise<string>;
  getPlatformInfo: () => Promise<{
    platform: string;
    arch: string;
    version: string;
  }>;
  
  // Event listeners
  on: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void) => void;
  off: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void) => void;
  
  // Generation events
  onGenerationProgress: (callback: (progress: GenerationProgress) => void) => void;
  onGenerationComplete: (callback: (result: GenerationResult) => void) => void;
  onGenerationError: (callback: (error: { message: string; stack?: string }) => void) => void;
}

const electronAPI: ElectronAPI = {
  // Project generation
  generateProject: (config: ProjectConfig) => 
    ipcRenderer.invoke('generate-project', config),
  
  validateConfig: (config: ProjectConfig) => 
    ipcRenderer.invoke('validate-config', config),
  
  // Templates
  listTemplates: () => 
    ipcRenderer.invoke('list-templates'),
  
  // File system
  selectDirectory: () => 
    ipcRenderer.invoke('select-directory'),
  
  showInFolder: (filePath: string) => 
    ipcRenderer.invoke('show-in-folder', filePath),
  
  openExternal: (url: string) => 
    ipcRenderer.invoke('open-external', url),
  
  // App info
  getAppVersion: () => 
    ipcRenderer.invoke('get-app-version'),
  
  getPlatformInfo: () => 
    ipcRenderer.invoke('get-platform-info'),
  
  // Event listeners
  on: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void) => {
    ipcRenderer.on(channel, callback);
  },
  
  off: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void) => {
    ipcRenderer.off(channel, callback);
  },
  
  // Generation events
  onGenerationProgress: (callback: (progress: GenerationProgress) => void) => {
    ipcRenderer.on('generation-progress', (_event, progress) => callback(progress));
  },
  
  onGenerationComplete: (callback: (result: GenerationResult) => void) => {
    ipcRenderer.on('generation-complete', (_event, result) => callback(result));
  },
  
  onGenerationError: (callback: (error: { message: string; stack?: string }) => void) => {
    ipcRenderer.on('generation-error', (_event, error) => callback(error));
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for the global electronAPI
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}