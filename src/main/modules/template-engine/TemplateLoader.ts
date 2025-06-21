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
import * as path from 'path';
import * as yaml from 'yaml';
import { 
  ITemplateLoader, 
  Template, 
  IFileSystemService, 
  ILogger 
} from '../../core/interfaces';
import { TYPES } from '../../core/Container';

@injectable()
export class TemplateLoader implements ITemplateLoader {
  private readonly templatesPath: string;

  constructor(
    @inject(TYPES.FileSystemService) private fileSystem: IFileSystemService,
    @inject(TYPES.Logger) private logger: ILogger
  ) {
    this.templatesPath = path.join(process.cwd(), 'templates');
  }

  async loadTemplate(templateName: string): Promise<Template> {
    const templatePath = path.join(this.templatesPath, templateName);
    
    if (!(await this.fileSystem.exists(templatePath))) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const configPath = path.join(templatePath, 'template.yml');
    
    if (!(await this.fileSystem.exists(configPath))) {
      throw new Error(`Template configuration not found: ${templateName}/template.yml`);
    }

    try {
      const configContent = await this.fileSystem.readFile(configPath);
      const config = yaml.parse(configContent);
      
      const template: Template = {
        name: config.name || templateName,
        version: config.version || '1.0.0',
        description: config.description || '',
        author: config.author || '',
        supportedTypes: config.supportedTypes || [],
        files: await this.loadTemplateFiles(templatePath, config.files || []),
        config: {
          variables: config.variables || [],
          hooks: config.hooks,
          dependencies: config.dependencies
        }
      };

      await this.validateTemplate(template);
      
      this.logger.info(`Loaded template: ${template.name} v${template.version}`);
      return template;
      
    } catch (error) {
      this.logger.error(`Failed to load template: ${templateName}`, error as Error);
      throw new Error(`Template loading failed: ${(error as Error).message}`);
    }
  }

  async listTemplates(): Promise<string[]> {
    try {
      if (!(await this.fileSystem.exists(this.templatesPath))) {
        this.logger.warn('Templates directory does not exist');
        return [];
      }

      const entries = await this.fileSystem.glob('*/', { cwd: this.templatesPath });
      const templates: string[] = [];

      for (const entry of entries) {
        const templateName = entry.replace('/', '');
        const configPath = path.join(this.templatesPath, templateName, 'template.yml');
        
        if (await this.fileSystem.exists(configPath)) {
          templates.push(templateName);
        }
      }

      this.logger.debug(`Found ${templates.length} templates`);
      return templates;
      
    } catch (error) {
      this.logger.error('Failed to list templates', error as Error);
      return [];
    }
  }

  async validateTemplate(template: Template): Promise<boolean> {
    const errors: string[] = [];

    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required');
    }

    if (!template.version || template.version.trim() === '') {
      errors.push('Template version is required');
    }

    if (!Array.isArray(template.supportedTypes) || template.supportedTypes.length === 0) {
      errors.push('Template must support at least one project type');
    }

    if (!Array.isArray(template.files)) {
      errors.push('Template files must be an array');
    }

    // Validate template variables
    if (template.config.variables) {
      for (const variable of template.config.variables) {
        if (!variable.name || !variable.type) {
          errors.push(`Invalid variable configuration: ${JSON.stringify(variable)}`);
        }
      }
    }

    if (errors.length > 0) {
      this.logger.error(`Template validation failed for ${template.name}:`, 
                       new Error(errors.join(', ')));
      return false;
    }

    return true;
  }

  private async loadTemplateFiles(
    templatePath: string, 
    fileConfigs: Array<{ path: string; isTemplate?: boolean; permissions?: string }>
  ): Promise<Template['files']> {
    const files: Template['files'] = [];

    for (const fileConfig of fileConfigs) {
      const filePath = path.join(templatePath, 'files', fileConfig.path);
      
      if (await this.fileSystem.exists(filePath)) {
        const content = await this.fileSystem.readFile(filePath);
        
        const templateFile: any = {
          path: fileConfig.path,
          content,
          isTemplate: fileConfig.isTemplate ?? true
        };
        
        if (fileConfig.permissions) {
          templateFile.permissions = fileConfig.permissions;
        }
        
        files.push(templateFile);
      } else {
        this.logger.warn(`Template file not found: ${fileConfig.path}`);
      }
    }

    return files;
  }
}