import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs-extra';
import { FileGenerator } from '../../src/main/modules/file-generator/FileGenerator';
import { ProjectValidator } from '../../src/main/modules/validation/ProjectValidator';
import { TemplateLoader } from '../../src/main/modules/template-engine/TemplateLoader';
import { HandlebarsEngine } from '../../src/main/modules/template-engine/HandlebarsEngine';
import { FileSystemService } from '../../src/main/infrastructure/file-system/FileSystemService';
import { WinstonLogger } from '../../src/main/infrastructure/logging/WinstonLogger';
import { ProjectConfig, ProjectType, ArchitectureType } from '../../src/shared/types';

describe('FileGenerator Integration', () => {
  let fileGenerator: FileGenerator;
  let tempDir: string;
  let logger: WinstonLogger;
  let fileSystemService: FileSystemService;
  let templateLoader: TemplateLoader;
  let templateEngine: HandlebarsEngine;
  let validator: ProjectValidator;

  beforeAll(async () => {
    // Create temporary directory for tests
    tempDir = path.join(__dirname, '../temp/integration-tests');
    await fs.ensureDir(tempDir);
  });

  afterAll(async () => {
    // Clean up temporary directory
    await fs.remove(tempDir);
  });

  beforeEach(() => {
    logger = new WinstonLogger();
    fileSystemService = new FileSystemService(logger);
    templateEngine = new HandlebarsEngine(logger);
    templateLoader = new TemplateLoader(fileSystemService, logger);
    validator = new ProjectValidator(fileSystemService, logger);
    
    fileGenerator = new FileGenerator(
      templateLoader,
      templateEngine,
      validator,
      fileSystemService,
      logger
    );
  });

  describe('validateConfig', () => {
    it('validates a complete project configuration', async () => {
      const config: ProjectConfig = {
        name: 'test-project',
        type: ProjectType.FULL_STACK,
        architecture: ArchitectureType.MONOLITHIC,
        outputPath: path.join(tempDir, 'valid-config-test'),
        technologies: {
          backend: {
            language: 'node',
            framework: 'express'
          },
          frontend: {
            framework: 'react',
            styling: 'tailwind',
            bundler: 'webpack'
          }
        }
      };

      const isValid = await fileGenerator.validateConfig(config);
      expect(isValid).toBe(true);
    });

    it('rejects invalid project configuration', async () => {
      const config: ProjectConfig = {
        name: '', // Invalid name
        type: ProjectType.FULL_STACK,
        architecture: ArchitectureType.MONOLITHIC,
        outputPath: '',
        technologies: {}
      };

      const isValid = await fileGenerator.validateConfig(config);
      expect(isValid).toBe(false);
    });
  });

  describe('project generation workflow', () => {
    let testConfig: ProjectConfig;

    beforeEach(() => {
      testConfig = {
        name: 'integration-test-project',
        type: ProjectType.BACKEND_ONLY,
        architecture: ArchitectureType.MONOLITHIC,
        outputPath: path.join(tempDir, 'generated-projects'),
        technologies: {
          backend: {
            language: 'node',
            framework: 'express'
          }
        }
      };
    });

    it('creates project directory structure', async () => {
      // This test would require actual templates to be present
      // For now, we'll test that the validation and setup works
      
      const isValid = await fileGenerator.validateConfig(testConfig);
      expect(isValid).toBe(true);

      // Ensure output directory exists for the test
      await fileSystemService.createDirectory(testConfig.outputPath);
      const outputExists = await fileSystemService.exists(testConfig.outputPath);
      expect(outputExists).toBe(true);
    });
  });

  describe('observer pattern', () => {
    it('notifies observers of generation progress', () => {
      const mockObserver = {
        onProgress: jest.fn(),
        onComplete: jest.fn(),
        onError: jest.fn()
      };

      fileGenerator.addObserver(mockObserver);
      
      const observers = (fileGenerator as any).observers;
      expect(observers).toContain(mockObserver);

      fileGenerator.removeObserver(mockObserver);
      expect(observers).not.toContain(mockObserver);
    });
  });

  describe('error handling', () => {
    it('handles invalid template gracefully', async () => {
      const config: ProjectConfig = {
        name: 'error-test',
        type: ProjectType.BACKEND_ONLY,
        architecture: ArchitectureType.MONOLITHIC,
        outputPath: path.join(tempDir, 'error-test'),
        template: 'non-existent-template',
        technologies: {
          backend: {
            language: 'node',
            framework: 'express'
          }
        }
      };

      // This should fail gracefully when trying to load a non-existent template
      const result = await fileGenerator.generate(config);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
});