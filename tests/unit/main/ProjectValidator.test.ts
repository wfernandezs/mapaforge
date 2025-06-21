import 'reflect-metadata';
import { ProjectValidator } from '../../../src/main/modules/validation/ProjectValidator';
import { IFileSystemService, ILogger } from '../../../src/main/core/interfaces';
import { ProjectConfig, ProjectType, ArchitectureType } from '../../../src/shared/types';

// Mock dependencies
const mockFileSystemService: jest.Mocked<IFileSystemService> = {
  exists: jest.fn(),
  createDirectory: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
  copyFile: jest.fn(),
  deleteFile: jest.fn(),
  glob: jest.fn()
};

const mockLogger: jest.Mocked<ILogger> = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('ProjectValidator', () => {
  let validator: ProjectValidator;

  beforeEach(() => {
    validator = new ProjectValidator(mockFileSystemService, mockLogger);
    jest.clearAllMocks();
  });

  describe('validateName', () => {
    it('accepts valid project names', () => {
      expect(validator.validateName('my-project')).toBe(true);
      expect(validator.validateName('myProject')).toBe(true);
      expect(validator.validateName('my_project')).toBe(true);
      expect(validator.validateName('project123')).toBe(true);
    });

    it('rejects invalid project names', () => {
      expect(validator.validateName('')).toBe(false);
      expect(validator.validateName('1project')).toBe(false);
      expect(validator.validateName('-project')).toBe(false);
      expect(validator.validateName('project with spaces')).toBe(false);
      expect(validator.validateName('project@name')).toBe(false);
      expect(validator.validateName('a')).toBe(false); // too short
    });
  });

  describe('validatePath', () => {
    it('accepts valid absolute paths', () => {
      expect(validator.validatePath('/valid/absolute/path')).toBe(true);
      expect(validator.validatePath('/home/user/projects')).toBe(true);
    });

    it('accepts relative paths that resolve to absolute', () => {
      expect(validator.validatePath('./relative/path')).toBe(true);
      expect(validator.validatePath('../parent/path')).toBe(true);
    });

    it('rejects invalid paths', () => {
      expect(validator.validatePath('')).toBe(false);
    });
  });

  describe('validate', () => {
    const validConfig: ProjectConfig = {
      name: 'test-project',
      type: ProjectType.FULL_STACK,
      architecture: ArchitectureType.MONOLITHIC,
      outputPath: '/valid/path',
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

    it('validates a correct configuration', async () => {
      mockFileSystemService.exists.mockResolvedValue(false); // output path doesn't exist

      const result = await validator.validate(validConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects invalid project name', async () => {
      const invalidConfig = { ...validConfig, name: '123invalid' };
      mockFileSystemService.exists.mockResolvedValue(false);

      const result = await validator.validate(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            code: expect.stringContaining('pattern')
          })
        ])
      );
    });

    it('rejects missing project type', async () => {
      const invalidConfig = { ...validConfig };
      delete (invalidConfig as any).type;
      mockFileSystemService.exists.mockResolvedValue(false);

      const result = await validator.validate(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'type'
          })
        ])
      );
    });

    it('validates technology stack requirements for backend-only projects', async () => {
      const backendConfig: ProjectConfig = {
        ...validConfig,
        type: ProjectType.BACKEND_ONLY,
        technologies: {
          backend: {
            language: 'node',
            framework: 'express'
          }
        }
      };
      mockFileSystemService.exists.mockResolvedValue(false);

      const result = await validator.validate(backendConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('warns about unnecessary frontend tech for backend-only projects', async () => {
      const backendConfig: ProjectConfig = {
        ...validConfig,
        type: ProjectType.BACKEND_ONLY,
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
      mockFileSystemService.exists.mockResolvedValue(false);

      const result = await validator.validate(backendConfig);

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'technologies.frontend',
            code: 'UNNECESSARY_FRONTEND_TECH'
          })
        ])
      );
    });

    it('warns when output path already exists', async () => {
      mockFileSystemService.exists.mockResolvedValue(true); // path exists

      const result = await validator.validate(validConfig);

      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'outputPath',
            code: 'PATH_EXISTS'
          })
        ])
      );
    });

    it('rejects reserved project names', async () => {
      const reservedConfig = { ...validConfig, name: 'node_modules' };
      mockFileSystemService.exists.mockResolvedValue(false);

      const result = await validator.validate(reservedConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            code: 'RESERVED_NAME'
          })
        ])
      );
    });
  });
});