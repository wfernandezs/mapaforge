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
import { 
  IFileGenerator, 
  ITemplateLoader, 
  ITemplateEngine, 
  IProjectValidator,
  IFileSystemService,
  ILogger,
  IGenerationObserver,
  Template
} from '../../core/interfaces';
import { 
  ProjectConfig, 
  GenerationResult, 
  GenerationProgress, 
  GenerationPhase 
} from '../../../shared/types';
import { TYPES } from '../../core/Container';

@injectable()
export class FileGenerator implements IFileGenerator {
  private observers: IGenerationObserver[] = [];

  constructor(
    @inject(TYPES.TemplateLoader) private templateLoader: ITemplateLoader,
    @inject(TYPES.HandlebarsEngine) private templateEngine: ITemplateEngine,
    @inject(TYPES.ProjectValidator) private validator: IProjectValidator,
    @inject(TYPES.FileSystemService) private fileSystem: IFileSystemService,
    @inject(TYPES.Logger) private logger: ILogger
  ) {}

  async generate(config: ProjectConfig): Promise<GenerationResult> {
    const startTime = Date.now();
    const result: GenerationResult = {
      success: false,
      outputPath: config.outputPath,
      filesGenerated: [],
      errors: [],
      warnings: []
    };

    try {
      this.notifyProgress({
        current: 0,
        total: 100,
        currentFile: 'Initializing...',
        phase: GenerationPhase.INITIALIZING
      });

      // Validate configuration
      const validationResult = await this.validator.validate(config);
      if (!validationResult.isValid) {
        result.errors = validationResult.errors.map(e => e.message);
        result.warnings = validationResult.warnings.map(w => w.message);
        throw new Error(`Configuration validation failed: ${result.errors.join(', ')}`);
      }

      // Load template
      this.notifyProgress({
        current: 10,
        total: 100,
        currentFile: 'Loading template...',
        phase: GenerationPhase.INITIALIZING
      });

      const template = await this.loadTemplate(config);
      
      // Generate directory structure
      this.notifyProgress({
        current: 20,
        total: 100,
        currentFile: 'Creating directory structure...',
        phase: GenerationPhase.GENERATING_STRUCTURE
      });

      await this.createDirectoryStructure(config, template);

      // Process template files
      this.notifyProgress({
        current: 30,
        total: 100,
        currentFile: 'Processing template files...',
        phase: GenerationPhase.PROCESSING_TEMPLATES
      });

      result.filesGenerated = await this.processTemplateFiles(config, template);

      // Finalize generation
      this.notifyProgress({
        current: 90,
        total: 100,
        currentFile: 'Finalizing...',
        phase: GenerationPhase.FINALIZING
      });

      await this.finalizeGeneration(config, template);

      result.success = true;
      
      this.notifyProgress({
        current: 100,
        total: 100,
        currentFile: 'Completed',
        phase: GenerationPhase.COMPLETED
      });

      const endTime = Date.now();
      this.logger.info(`Project generation completed successfully`, {
        projectName: config.name,
        outputPath: config.outputPath,
        filesGenerated: result.filesGenerated.length,
        duration: endTime - startTime
      });

      this.notifyComplete(result);
      return result;

    } catch (error) {
      const errorMessage = (error as Error).message;
      result.errors?.push(errorMessage);
      
      this.logger.error('Project generation failed', error as Error, {
        projectName: config.name,
        outputPath: config.outputPath
      });

      this.notifyError(error as Error);
      return result;
    }
  }

  async validateConfig(config: ProjectConfig): Promise<boolean> {
    const result = await this.validator.validate(config);
    return result.isValid;
  }

  addObserver(observer: IGenerationObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: IGenerationObserver): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  private async loadTemplate(config: ProjectConfig): Promise<Template> {
    if (config.template) {
      return await this.templateLoader.loadTemplate(config.template);
    }

    // Default template selection based on project type and architecture
    const templateName = this.getDefaultTemplateName(config);
    return await this.templateLoader.loadTemplate(templateName);
  }

  private getDefaultTemplateName(config: ProjectConfig): string {
    const { type, technologies } = config;
    
    if (type === 'backend-only' && technologies.backend?.language === 'node') {
      return 'node-express-api';
    }
    
    if (type === 'frontend-only' && technologies.frontend?.framework === 'react') {
      return 'react-spa';
    }
    
    if (type === 'full-stack') {
      return 'full-stack-mern';
    }

    return 'basic-project';
  }

  private async createDirectoryStructure(config: ProjectConfig, template: Template): Promise<void> {
    const outputPath = path.resolve(config.outputPath, config.name);
    await this.fileSystem.createDirectory(outputPath);

    // Extract unique directories from template files
    const directories = new Set<string>();
    
    for (const file of template.files) {
      const dir = path.dirname(file.path);
      if (dir !== '.' && dir !== '') {
        directories.add(dir);
        
        // Add parent directories
        let currentDir = dir;
        while (currentDir !== '.' && currentDir !== '') {
          directories.add(currentDir);
          currentDir = path.dirname(currentDir);
        }
      }
    }

    // Create directories
    for (const dir of Array.from(directories).sort()) {
      const fullPath = path.join(outputPath, dir);
      await this.fileSystem.createDirectory(fullPath);
    }
  }

  private async processTemplateFiles(config: ProjectConfig, template: Template): Promise<string[]> {
    const outputPath = path.resolve(config.outputPath, config.name);
    const filesGenerated: string[] = [];
    const templateData = this.buildTemplateData(config);

    for (let i = 0; i < template.files.length; i++) {
      const file = template.files[i];
      const progress = 30 + Math.floor((i / template.files.length) * 60);
      
      this.notifyProgress({
        current: progress,
        total: 100,
        currentFile: file.path,
        phase: GenerationPhase.PROCESSING_TEMPLATES
      });

      const outputFilePath = path.join(outputPath, file.path);
      
      try {
        let content = file.content;
        
        if (file.isTemplate) {
          content = this.templateEngine.compile(content, templateData);
        }

        await this.fileSystem.writeFile(outputFilePath, content);
        
        if (file.permissions) {
          // Set file permissions if specified (Unix systems)
          try {
            const fs = await import('fs');
            await fs.promises.chmod(outputFilePath, file.permissions);
          } catch (error) {
            this.logger.warn(`Failed to set permissions for ${file.path}`, {
              permissions: file.permissions,
              error: (error as Error).message
            });
          }
        }

        filesGenerated.push(file.path);
        
      } catch (error) {
        this.logger.error(`Failed to process template file: ${file.path}`, error as Error);
        throw new Error(`Template processing failed for ${file.path}: ${(error as Error).message}`);
      }
    }

    return filesGenerated;
  }

  private buildTemplateData(config: ProjectConfig): Record<string, unknown> {
    return {
      name: config.name,
      type: config.type,
      architecture: config.architecture,
      technologies: config.technologies,
      customOptions: config.customOptions || {},
      
      // Utility data
      nameUpperCase: config.name.toUpperCase(),
      nameLowerCase: config.name.toLowerCase(),
      nameCamelCase: this.toCamelCase(config.name),
      namePascalCase: this.toPascalCase(config.name),
      nameKebabCase: this.toKebabCase(config.name),
      nameSnakeCase: this.toSnakeCase(config.name),
      
      // Current date/time
      currentDate: new Date().toISOString().split('T')[0],
      currentYear: new Date().getFullYear(),
      
      // Conditional flags
      isBackend: config.type === 'backend-only' || config.type === 'full-stack',
      isFrontend: config.type === 'frontend-only' || config.type === 'full-stack',
      isFullStack: config.type === 'full-stack',
      
      hasDatabase: !!config.technologies.database,
      hasDeployment: !!config.technologies.deployment
    };
  }

  private async finalizeGeneration(_config: ProjectConfig, template: Template): Promise<void> {
    // Execute post-generation hooks if defined
    if (template.config.hooks?.postGeneration) {
      for (const hook of template.config.hooks.postGeneration) {
        try {
          this.logger.info(`Executing post-generation hook: ${hook}`);
          // Hook execution would be implemented here
          // This could involve running shell commands, installing dependencies, etc.
        } catch (error) {
          this.logger.warn(`Post-generation hook failed: ${hook}`, {
            error: (error as Error).message
          });
        }
      }
    }
  }

  private notifyProgress(progress: GenerationProgress): void {
    this.observers.forEach(observer => {
      try {
        observer.onProgress(progress);
      } catch (error) {
        this.logger.warn('Observer progress notification failed', {
          error: (error as Error).message
        });
      }
    });
  }

  private notifyComplete(result: GenerationResult): void {
    this.observers.forEach(observer => {
      try {
        observer.onComplete(result);
      } catch (error) {
        this.logger.warn('Observer completion notification failed', {
          error: (error as Error).message
        });
      }
    });
  }

  private notifyError(error: Error): void {
    this.observers.forEach(observer => {
      try {
        observer.onError(error);
      } catch (observerError) {
        this.logger.warn('Observer error notification failed', {
          originalError: error.message,
          observerError: (observerError as Error).message
        });
      }
    });
  }

  // Utility methods for string transformation
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