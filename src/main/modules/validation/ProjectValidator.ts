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
import * as Joi from 'joi';
import * as path from 'path';
import { 
  IProjectValidator, 
  ValidationResult, 
  ValidationError, 
  IFileSystemService,
  ILogger 
} from '../../core/interfaces';
import { ProjectConfig, ProjectType, ArchitectureType } from '../../../shared/types';
import { TYPES } from '../../core/Container';

@injectable()
export class ProjectValidator implements IProjectValidator {
  private readonly projectConfigSchema: Joi.ObjectSchema;

  constructor(
    @inject(TYPES.FileSystemService) private fileSystem: IFileSystemService,
    @inject(TYPES.Logger) private logger: ILogger
  ) {
    this.projectConfigSchema = this.createConfigSchema();
  }

  async validate(config: ProjectConfig): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Joi schema validation
    const { error } = this.projectConfigSchema.validate(config, { abortEarly: false });
    if (error) {
      errors.push(...error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        code: detail.type
      })));
    }

    // Custom validation rules
    await this.validateProjectName(config.name, errors, warnings);
    await this.validateOutputPath(config.outputPath, errors, warnings);
    this.validateTechnologyStack(config, errors, warnings);
    this.validateArchitectureCompatibility(config, errors, warnings);

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    this.logger.debug('Project validation completed', {
      isValid: result.isValid,
      errorCount: errors.length,
      warningCount: warnings.length
    });

    return result;
  }

  validateName(name: string): boolean {
    const nameRegex = /^[a-zA-Z][a-zA-Z0-9-_]*$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
  }

  validatePath(pathString: string): boolean {
    try {
      const resolvedPath = path.resolve(pathString);
      return path.isAbsolute(resolvedPath) && resolvedPath.length > 0;
    } catch {
      return false;
    }
  }

  private createConfigSchema(): Joi.ObjectSchema {
    return Joi.object({
      name: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z][a-zA-Z0-9-_]*$/)
        .required()
        .messages({
          'string.pattern.base': 'Project name must start with a letter and contain only letters, numbers, hyphens, and underscores'
        }),
      
      type: Joi.string()
        .valid(...Object.values(ProjectType))
        .required(),
      
      architecture: Joi.string()
        .valid(...Object.values(ArchitectureType))
        .required(),
      
      outputPath: Joi.string()
        .required(),
      
      technologies: Joi.object({
        backend: Joi.object({
          language: Joi.string().valid('node', 'python', 'java', 'go', 'csharp').required(),
          framework: Joi.string().required(),
          orm: Joi.string().optional()
        }).optional(),
        
        frontend: Joi.object({
          framework: Joi.string().valid('react', 'vue', 'angular', 'svelte').required(),
          styling: Joi.string().valid('css', 'scss', 'tailwind', 'styled-components').required(),
          bundler: Joi.string().valid('webpack', 'vite', 'parcel').required()
        }).optional(),
        
        database: Joi.object({
          type: Joi.string().valid('sql', 'nosql').required(),
          name: Joi.string().required()
        }).optional(),
        
        deployment: Joi.object({
          platform: Joi.string().valid('docker', 'kubernetes', 'aws', 'vercel', 'netlify').required(),
          ci: Joi.string().valid('github-actions', 'gitlab-ci', 'jenkins').required()
        }).optional()
      }).required(),
      
      template: Joi.string().optional(),
      customOptions: Joi.object().optional()
    });
  }

  private async validateProjectName(
    name: string, 
    errors: ValidationError[], 
    _warnings: ValidationError[]
  ): Promise<void> {
    if (!this.validateName(name)) {
      errors.push({
        field: 'name',
        message: 'Invalid project name format',
        code: 'INVALID_NAME_FORMAT'
      });
    }

    // Check for reserved names
    const reservedNames = ['con', 'prn', 'aux', 'nul', 'node_modules', '.git'];
    if (reservedNames.includes(name.toLowerCase())) {
      errors.push({
        field: 'name',
        message: 'Project name cannot be a reserved word',
        code: 'RESERVED_NAME'
      });
    }
  }

  private async validateOutputPath(
    outputPath: string, 
    errors: ValidationError[], 
    warnings: ValidationError[]
  ): Promise<void> {
    if (!this.validatePath(outputPath)) {
      errors.push({
        field: 'outputPath',
        message: 'Invalid output path format',
        code: 'INVALID_PATH_FORMAT'
      });
      return;
    }

    const resolvedPath = path.resolve(outputPath);
    
    // Check if path already exists
    if (await this.fileSystem.exists(resolvedPath)) {
      warnings.push({
        field: 'outputPath',
        message: 'Output path already exists and may be overwritten',
        code: 'PATH_EXISTS'
      });
    }

    // Check if parent directory exists and is writable
    const parentDir = path.dirname(resolvedPath);
    if (!(await this.fileSystem.exists(parentDir))) {
      warnings.push({
        field: 'outputPath',
        message: 'Parent directory does not exist and will be created',
        code: 'PARENT_DIR_MISSING'
      });
    }
  }

  private validateTechnologyStack(
    config: ProjectConfig, 
    errors: ValidationError[], 
    warnings: ValidationError[]
  ): void {
    const { type, technologies } = config;

    // Validate required technologies based on project type
    switch (type) {
      case ProjectType.BACKEND_ONLY:
        if (!technologies.backend) {
          errors.push({
            field: 'technologies.backend',
            message: 'Backend technology is required for backend-only projects',
            code: 'MISSING_BACKEND_TECH'
          });
        }
        if (technologies.frontend) {
          warnings.push({
            field: 'technologies.frontend',
            message: 'Frontend technology specified for backend-only project',
            code: 'UNNECESSARY_FRONTEND_TECH'
          });
        }
        break;

      case ProjectType.FRONTEND_ONLY:
        if (!technologies.frontend) {
          errors.push({
            field: 'technologies.frontend',
            message: 'Frontend technology is required for frontend-only projects',
            code: 'MISSING_FRONTEND_TECH'
          });
        }
        if (technologies.backend) {
          warnings.push({
            field: 'technologies.backend',
            message: 'Backend technology specified for frontend-only project',
            code: 'UNNECESSARY_BACKEND_TECH'
          });
        }
        break;

      case ProjectType.FULL_STACK:
        if (!technologies.backend || !technologies.frontend) {
          errors.push({
            field: 'technologies',
            message: 'Both backend and frontend technologies are required for full-stack projects',
            code: 'MISSING_FULLSTACK_TECH'
          });
        }
        break;
    }
  }

  private validateArchitectureCompatibility(
    config: ProjectConfig, 
    _errors: ValidationError[], 
    warnings: ValidationError[]
  ): void {
    const { type, architecture } = config;

    // Check architecture compatibility with project type
    const incompatibleCombinations = [
      { type: ProjectType.FRONTEND_ONLY, architecture: ArchitectureType.MICROSERVICES },
      { type: ProjectType.FRONTEND_ONLY, architecture: ArchitectureType.SERVERLESS }
    ];

    for (const combo of incompatibleCombinations) {
      if (type === combo.type && architecture === combo.architecture) {
        warnings.push({
          field: 'architecture',
          message: `${architecture} architecture may not be suitable for ${type} projects`,
          code: 'ARCHITECTURE_MISMATCH'
        });
      }
    }
  }
}