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

import { ProjectConfig, GenerationResult, GenerationProgress } from '@shared/types';

export interface ILogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error, meta?: Record<string, unknown>): void;
}

export interface ITemplateEngine {
  readonly name: string;
  compile(template: string, data: Record<string, unknown>): string;
  compileFile(templatePath: string, data: Record<string, unknown>): string;
  validate(template: string): boolean;
}

export interface IFileGenerator {
  generate(config: ProjectConfig): Promise<GenerationResult>;
  validateConfig(config: ProjectConfig): Promise<boolean>;
  addObserver(observer: IGenerationObserver): void;
  removeObserver(observer: IGenerationObserver): void;
}

export interface IProjectValidator {
  validate(config: ProjectConfig): Promise<ValidationResult>;
  validateName(name: string): boolean;
  validatePath(path: string): boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface IFileSystemService {
  exists(path: string): Promise<boolean>;
  createDirectory(path: string): Promise<void>;
  writeFile(path: string, content: string): Promise<void>;
  readFile(path: string): Promise<string>;
  copyFile(source: string, destination: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
  glob(pattern: string, options?: GlobOptions): Promise<string[]>;
}

export interface GlobOptions {
  cwd?: string;
  ignore?: string[];
}

export interface ITemplateLoader {
  loadTemplate(templateName: string): Promise<Template>;
  listTemplates(): Promise<string[]>;
  validateTemplate(template: Template): Promise<boolean>;
}

export interface Template {
  name: string;
  version: string;
  description: string;
  author: string;
  supportedTypes: string[];
  files: TemplateFile[];
  config: TemplateConfig;
}

export interface TemplateFile {
  path: string;
  content: string;
  isTemplate: boolean;
  permissions?: string;
}

export interface TemplateConfig {
  variables: TemplateVariable[];
  hooks?: TemplateHooks;
  dependencies?: TemplateDependencies;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'boolean' | 'number' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: unknown;
  validation?: string;
}

export interface TemplateHooks {
  preGeneration?: string[];
  postGeneration?: string[];
}

export interface TemplateDependencies {
  npm?: string[];
  system?: string[];
}

export interface IGenerationObserver {
  onProgress(progress: GenerationProgress): void;
  onComplete(result: GenerationResult): void;
  onError(error: Error): void;
}

export interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  
  init(context: PluginContext): Promise<void>;
  execute(config: ProjectConfig): Promise<void>;
  cleanup(): Promise<void>;
}

export interface PluginContext {
  logger: ILogger;
  fileSystem: IFileSystemService;
  templateEngine: ITemplateEngine;
}

export interface IPluginManager {
  register(plugin: IPlugin): void;
  unregister(pluginName: string): void;
  getPlugin(name: string): IPlugin | undefined;
  listPlugins(): IPlugin[];
  executePlugins(config: ProjectConfig): Promise<void>;
}