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

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { injectable, inject } from 'inversify';
import { IFileGenerator, ILogger, ITemplateLoader } from '../../core/interfaces';
import { ProjectConfig, GenerationResult } from '../../../shared/types';
import { TYPES } from '../../core/Container';

@injectable()
export class ElectronMain {
  private mainWindow: BrowserWindow | null = null;
  private isDevelopment = process.env.NODE_ENV !== 'production';

  constructor(
    @inject(TYPES.FileGenerator) private fileGenerator: IFileGenerator,
    @inject(TYPES.TemplateLoader) private templateLoader: ITemplateLoader,
    @inject(TYPES.Logger) private logger: ILogger
  ) {
    this.setupEventHandlers();
  }

  async initialize(): Promise<void> {
    await app.whenReady();
    await this.createMainWindow();
    this.setupIpcHandlers();
    
    this.logger.info('MapaForge application initialized');
  }

  private async createMainWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      },
      titleBarStyle: 'hiddenInset',
      show: false
    });

    // Load the renderer
    try {
      if (this.isDevelopment) {
        await this.mainWindow.loadURL('http://localhost:3000');
        this.mainWindow.webContents.openDevTools();
      } else {
        await this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
      }
      
      // Show window after successful load
      this.mainWindow.show();
      this.logger.info('Main window created and shown');
    } catch (error) {
      this.logger.error('Failed to load renderer', error as Error);
      // Show window anyway so user can see the error
      this.mainWindow.show();
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupEventHandlers(): void {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createMainWindow();
      }
    });

    app.on('before-quit', () => {
      this.logger.info('Application shutting down');
    });
  }

  private setupIpcHandlers(): void {
    // Generate project
    ipcMain.handle('generate-project', async (_event, config: ProjectConfig): Promise<GenerationResult> => {
      try {
        this.logger.info('Starting project generation', { projectName: config.name });
        
        // Add generation observer to send progress updates
        const observer = {
          onProgress: (progress: any) => {
            this.mainWindow?.webContents.send('generation-progress', progress);
          },
          onComplete: (result: GenerationResult) => {
            this.mainWindow?.webContents.send('generation-complete', result);
          },
          onError: (error: Error) => {
            this.mainWindow?.webContents.send('generation-error', {
              message: error.message,
              stack: error.stack
            });
          }
        };

        this.fileGenerator.addObserver(observer);
        const result = await this.fileGenerator.generate(config);
        this.fileGenerator.removeObserver(observer);

        return result;
      } catch (error) {
        this.logger.error('Project generation failed', error as Error);
        throw error;
      }
    });

    // Validate project configuration
    ipcMain.handle('validate-config', async (_event, config: ProjectConfig): Promise<boolean> => {
      try {
        return await this.fileGenerator.validateConfig(config);
      } catch (error) {
        this.logger.error('Config validation failed', error as Error);
        return false;
      }
    });

    // List available templates
    ipcMain.handle('list-templates', async (): Promise<string[]> => {
      try {
        return await this.templateLoader.listTemplates();
      } catch (error) {
        this.logger.error('Failed to list templates', error as Error);
        return [];
      }
    });

    // Select output directory
    ipcMain.handle('select-directory', async (): Promise<string | null> => {
      try {
        if (!this.mainWindow) return null;

        const result = await dialog.showOpenDialog(this.mainWindow, {
          properties: ['openDirectory', 'createDirectory'],
          title: 'Select Output Directory'
        });

        return result.canceled ? null : result.filePaths[0];
      } catch (error) {
        this.logger.error('Directory selection failed', error as Error);
        return null;
      }
    });

    // Show item in folder
    ipcMain.handle('show-in-folder', async (_event, filePath: string): Promise<void> => {
      try {
        const { shell } = await import('electron');
        await shell.showItemInFolder(filePath);
      } catch (error) {
        this.logger.error('Failed to show item in folder', error as Error);
      }
    });

    // Open external link
    ipcMain.handle('open-external', async (_event, url: string): Promise<void> => {
      try {
        const { shell } = await import('electron');
        await shell.openExternal(url);
      } catch (error) {
        this.logger.error('Failed to open external link', error as Error);
      }
    });

    // Get app version
    ipcMain.handle('get-app-version', (): string => {
      return app.getVersion();
    });

    // Get platform info
    ipcMain.handle('get-platform-info', () => {
      return {
        platform: process.platform,
        arch: process.arch,
        version: process.version
      };
    });
  }
}