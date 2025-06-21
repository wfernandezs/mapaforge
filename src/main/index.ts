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

import 'reflect-metadata';
import { DIContainer, TYPES } from './core/Container';
import { ElectronMain } from './infrastructure/electron/ElectronMain';
import { ILogger } from './core/interfaces';

class Application {
  private container: DIContainer;
  private electronMain: ElectronMain;
  private logger: ILogger;

  constructor() {
    this.container = DIContainer.getInstance();
    this.logger = this.container.get<ILogger>(TYPES.Logger);
    this.electronMain = this.container.get<ElectronMain>(TYPES.ElectronMain);
  }

  async start(): Promise<void> {
    try {
      this.logger.info('Starting MapaForge application');
      
      // Initialize Electron
      await this.electronMain.initialize();
      
      this.logger.info('Application started successfully');
      
    } catch (error) {
      this.logger.error('Failed to start application', error as Error);
      process.exit(1);
    }
  }

  async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down application');
      // Cleanup logic would go here
    } catch (error) {
      this.logger.error('Error during shutdown', error as Error);
    }
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the application
const app = new Application();
app.start().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await app.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await app.shutdown();
  process.exit(0);
});