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
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import { IFileSystemService, GlobOptions, ILogger } from '../../core/interfaces';
import { TYPES } from '../../core/Container';

@injectable()
export class FileSystemService implements IFileSystemService {
  constructor(@inject(TYPES.Logger) private logger: ILogger) {}

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      await fs.ensureDir(dirPath);
      this.logger.debug(`Created directory: ${dirPath}`);
    } catch (error) {
      this.logger.error(`Failed to create directory: ${dirPath}`, error as Error);
      throw new Error(`Directory creation failed: ${(error as Error).message}`);
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf-8');
      this.logger.debug(`Wrote file: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to write file: ${filePath}`, error as Error);
      throw new Error(`File write failed: ${(error as Error).message}`);
    }
  }

  async readFile(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      this.logger.debug(`Read file: ${filePath}`);
      return content;
    } catch (error) {
      this.logger.error(`Failed to read file: ${filePath}`, error as Error);
      throw new Error(`File read failed: ${(error as Error).message}`);
    }
  }

  async copyFile(source: string, destination: string): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(destination));
      await fs.copy(source, destination);
      this.logger.debug(`Copied file: ${source} -> ${destination}`);
    } catch (error) {
      this.logger.error(`Failed to copy file: ${source} -> ${destination}`, error as Error);
      throw new Error(`File copy failed: ${(error as Error).message}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.remove(filePath);
      this.logger.debug(`Deleted file: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${filePath}`, error as Error);
      throw new Error(`File deletion failed: ${(error as Error).message}`);
    }
  }

  async glob(pattern: string, options?: GlobOptions): Promise<string[]> {
    try {
      const globOptions = {
        cwd: options?.cwd || process.cwd(),
        ignore: options?.ignore || []
      };

      return await glob(pattern, globOptions);
    } catch (error) {
      this.logger.error(`Glob pattern failed: ${pattern}`, error as Error);
      throw new Error(`Glob operation failed: ${(error as Error).message}`);
    }
  }
}