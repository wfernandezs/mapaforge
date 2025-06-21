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

import { IPlugin, PluginContext, ILogger } from '../interfaces';
import { ProjectConfig } from '@shared/types';

export abstract class BasePlugin implements IPlugin {
  protected context: PluginContext | undefined;
  protected logger: ILogger | undefined;

  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly description: string;

  async init(context: PluginContext): Promise<void> {
    this.context = context;
    this.logger = context.logger;
    
    this.logger.info(`Initializing plugin: ${this.name} v${this.version}`);
    
    await this.onInit();
  }

  abstract execute(config: ProjectConfig): Promise<void>;

  async cleanup(): Promise<void> {
    this.logger?.info(`Cleaning up plugin: ${this.name}`);
    await this.onCleanup();
    
    this.context = undefined;
    this.logger = undefined;
  }

  protected abstract onInit(): Promise<void>;

  protected abstract onCleanup(): Promise<void>;

  protected ensureInitialized(): void {
    if (!this.context || !this.logger) {
      throw new Error(`Plugin ${this.name} is not initialized. Call init() first.`);
    }
  }
}