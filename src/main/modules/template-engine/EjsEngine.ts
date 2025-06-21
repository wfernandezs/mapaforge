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
import * as ejs from 'ejs';
import { BaseTemplateEngine } from '../../core/abstractions/BaseTemplateEngine';
import { ILogger } from '../../core/interfaces';
import { TYPES } from '../../core/Container';

@injectable()
export class EjsEngine extends BaseTemplateEngine {
  readonly name = 'ejs';

  constructor(@inject(TYPES.Logger) logger: ILogger) {
    super(logger);
  }

  compile(template: string, data: Record<string, unknown>): string {
    try {
      return ejs.render(template, this.enhanceData(data), {
        async: false,
        rmWhitespace: true
      });
    } catch (error) {
      this.handleCompilationError(error as Error, template);
    }
  }

  compileFile(templatePath: string, data: Record<string, unknown>): string {
    try {
      return ejs.render(
        require('fs').readFileSync(templatePath, 'utf8'),
        this.enhanceData(data),
        { rmWhitespace: true }
      );
    } catch (error) {
      this.logger.error(`Failed to compile template file: ${templatePath}`, error as Error);
      throw new Error(`Template compilation failed: ${(error as Error).message}`);
    }
  }

  private enhanceData(data: Record<string, unknown>): Record<string, unknown> {
    return {
      ...data,
      // Utility functions available in templates
      toUpperCase: (str: string) => str.toUpperCase(),
      toLowerCase: (str: string) => str.toLowerCase(),
      camelCase: (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase()),
      pascalCase: (str: string) => str.charAt(0).toUpperCase() + 
                                  str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase()),
      kebabCase: (str: string) => str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, ''),
      snakeCase: (str: string) => str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''),
      includes: (array: unknown[], item: unknown) => Array.isArray(array) && array.includes(item)
    };
  }
}