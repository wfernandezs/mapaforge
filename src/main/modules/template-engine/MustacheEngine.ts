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
import * as Mustache from 'mustache';
import * as fs from 'fs-extra';
import { BaseTemplateEngine } from '../../core/abstractions/BaseTemplateEngine';
import { ILogger } from '../../core/interfaces';
import { TYPES } from '../../core/Container';

@injectable()
export class MustacheEngine extends BaseTemplateEngine {
  readonly name = 'mustache';

  constructor(@inject(TYPES.Logger) logger: ILogger) {
    super(logger);
  }

  compile(template: string, data: Record<string, unknown>): string {
    try {
      return Mustache.render(template, this.enhanceData(data));
    } catch (error) {
      this.handleCompilationError(error as Error, template);
    }
  }

  compileFile(templatePath: string, data: Record<string, unknown>): string {
    try {
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      return this.compile(templateContent, data);
    } catch (error) {
      this.logger.error(`Failed to read template file: ${templatePath}`, error as Error);
      throw new Error(`Template file not found or inaccessible: ${templatePath}`);
    }
  }

  private enhanceData(data: Record<string, unknown>): Record<string, unknown> {
    const enhancedData = { ...data };
    
    // Add utility functions to data context
    if (typeof data.name === 'string') {
      enhancedData.nameUpperCase = data.name.toUpperCase();
      enhancedData.nameLowerCase = data.name.toLowerCase();
      enhancedData.nameCamelCase = this.toCamelCase(data.name);
      enhancedData.namePascalCase = this.toPascalCase(data.name);
      enhancedData.nameKebabCase = this.toKebabCase(data.name);
      enhancedData.nameSnakeCase = this.toSnakeCase(data.name);
    }
    
    return enhancedData;
  }

  private toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + 
           str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  private toKebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  private toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }
}