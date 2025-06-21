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
import { Container } from 'inversify';
import { 
  ILogger, 
  ITemplateEngine, 
  IFileGenerator, 
  IProjectValidator,
  IFileSystemService,
  ITemplateLoader,
  IPluginManager 
} from './interfaces';

export const TYPES = {
  Logger: Symbol.for('Logger'),
  TemplateEngine: Symbol.for('TemplateEngine'),
  FileGenerator: Symbol.for('FileGenerator'),
  ProjectValidator: Symbol.for('ProjectValidator'),
  FileSystemService: Symbol.for('FileSystemService'),
  TemplateLoader: Symbol.for('TemplateLoader'),
  PluginManager: Symbol.for('PluginManager'),
  HandlebarsEngine: Symbol.for('HandlebarsEngine'),
  MustacheEngine: Symbol.for('MustacheEngine'),
  EjsEngine: Symbol.for('EjsEngine'),
  ElectronMain: Symbol.for('ElectronMain')
};

export class DIContainer {
  private static instance: DIContainer;
  private container: Container;

  private constructor() {
    this.container = new Container();
    this.setupBindings();
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  get<T>(serviceIdentifier: symbol): T {
    return this.container.get<T>(serviceIdentifier);
  }

  bind<T>(serviceIdentifier: symbol): interfaces.BindingToSyntax<T> {
    return this.container.bind<T>(serviceIdentifier);
  }

  private setupBindings(): void {
    // Logger
    this.container.bind<ILogger>(TYPES.Logger)
      .to(WinstonLogger)
      .inSingletonScope();

    // File System Service
    this.container.bind<IFileSystemService>(TYPES.FileSystemService)
      .to(FileSystemService)
      .inSingletonScope();

    // Template Engines
    this.container.bind<ITemplateEngine>(TYPES.HandlebarsEngine)
      .to(HandlebarsEngine)
      .inSingletonScope();

    this.container.bind<ITemplateEngine>(TYPES.MustacheEngine)
      .to(MustacheEngine)
      .inSingletonScope();

    this.container.bind<ITemplateEngine>(TYPES.EjsEngine)
      .to(EjsEngine)
      .inSingletonScope();

    // Template Loader
    this.container.bind<ITemplateLoader>(TYPES.TemplateLoader)
      .to(TemplateLoader)
      .inSingletonScope();

    // Project Validator
    this.container.bind<IProjectValidator>(TYPES.ProjectValidator)
      .to(ProjectValidator)
      .inSingletonScope();

    // File Generator
    this.container.bind<IFileGenerator>(TYPES.FileGenerator)
      .to(FileGenerator)
      .inSingletonScope();

    // Plugin Manager
    this.container.bind<IPluginManager>(TYPES.PluginManager)
      .to(PluginManager)
      .inSingletonScope();

    // Electron Main
    this.container.bind<ElectronMain>(TYPES.ElectronMain)
      .to(ElectronMain)
      .inSingletonScope();
  }
}

// Import statements will be added when we implement these classes
import { WinstonLogger } from '../infrastructure/logging/WinstonLogger';
import { FileSystemService } from '../infrastructure/file-system/FileSystemService';
import { HandlebarsEngine } from '../modules/template-engine/HandlebarsEngine';
import { MustacheEngine } from '../modules/template-engine/MustacheEngine';
import { EjsEngine } from '../modules/template-engine/EjsEngine';
import { TemplateLoader } from '../modules/template-engine/TemplateLoader';
import { ProjectValidator } from '../modules/validation/ProjectValidator';
import { FileGenerator } from '../modules/file-generator/FileGenerator';
import { PluginManager } from '../modules/plugin-manager/PluginManager';
import { ElectronMain } from '../infrastructure/electron/ElectronMain';
import { interfaces } from 'inversify';