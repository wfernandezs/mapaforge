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

import { injectable, inject } from 'inversify';
import { 
  IPluginManager, 
  IPlugin, 
  PluginContext,
  ILogger,
  IFileSystemService,
  ITemplateEngine
} from '../../core/interfaces';
import { ProjectConfig } from '@shared/types';
import { TYPES } from '../../core/Container';

@injectable()
export class PluginManager implements IPluginManager {
  private plugins: Map<string, IPlugin> = new Map();
  private context: PluginContext;

  constructor(
    @inject(TYPES.Logger) private logger: ILogger,
    @inject(TYPES.FileSystemService) private fileSystem: IFileSystemService,
    @inject(TYPES.HandlebarsEngine) private templateEngine: ITemplateEngine
  ) {
    this.context = {
      logger: this.logger,
      fileSystem: this.fileSystem,
      templateEngine: this.templateEngine
    };
  }

  register(plugin: IPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    this.plugins.set(plugin.name, plugin);
    this.logger.info(`Registered plugin: ${plugin.name} v${plugin.version}`);
  }

  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} is not registered`);
    }

    // Cleanup the plugin
    plugin.cleanup().catch(error => {
      this.logger.warn(`Plugin cleanup failed for ${pluginName}`, {
        error: error.message
      });
    });

    this.plugins.delete(pluginName);
    this.logger.info(`Unregistered plugin: ${pluginName}`);
  }

  getPlugin(name: string): IPlugin | undefined {
    return this.plugins.get(name);
  }

  listPlugins(): IPlugin[] {
    return Array.from(this.plugins.values());
  }

  async executePlugins(config: ProjectConfig): Promise<void> {
    const pluginList = this.listPlugins();
    
    if (pluginList.length === 0) {
      this.logger.debug('No plugins to execute');
      return;
    }

    this.logger.info(`Executing ${pluginList.length} plugins`);

    for (const plugin of pluginList) {
      try {
        this.logger.debug(`Initializing plugin: ${plugin.name}`);
        await plugin.init(this.context);
        
        this.logger.debug(`Executing plugin: ${plugin.name}`);
        await plugin.execute(config);
        
        this.logger.debug(`Plugin executed successfully: ${plugin.name}`);
      } catch (error) {
        this.logger.error(`Plugin execution failed: ${plugin.name}`, error as Error);
        // Continue with other plugins even if one fails
      }
    }

    this.logger.info('Plugin execution completed');
  }
}