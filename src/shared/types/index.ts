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

export interface ProjectConfig {
  name: string;
  type: ProjectType;
  architecture: ArchitectureType;
  technologies: TechnologyStack;
  outputPath: string;
  template?: string;
  customOptions?: Record<string, unknown>;
}

export enum ProjectType {
  BACKEND_ONLY = 'backend-only',
  FRONTEND_ONLY = 'frontend-only',
  FULL_STACK = 'full-stack'
}

export enum ArchitectureType {
  MONOLITHIC = 'monolithic',
  MICROSERVICES = 'microservices',
  SERVERLESS = 'serverless',
  JAMSTACK = 'jamstack',
  SPA = 'spa',
  SSR = 'ssr'
}

export interface TechnologyStack {
  backend?: BackendTech;
  frontend?: FrontendTech;
  database?: DatabaseTech;
  deployment?: DeploymentTech;
}

export interface BackendTech {
  language: 'node' | 'python' | 'java' | 'go' | 'csharp';
  framework: string;
  orm?: string;
}

export interface FrontendTech {
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  styling: 'css' | 'scss' | 'tailwind' | 'styled-components';
  bundler: 'webpack' | 'vite' | 'parcel';
}

export interface DatabaseTech {
  type: 'sql' | 'nosql';
  name: string;
}

export interface DeploymentTech {
  platform: 'docker' | 'kubernetes' | 'aws' | 'vercel' | 'netlify';
  ci: 'github-actions' | 'gitlab-ci' | 'jenkins';
}

export interface GenerationProgress {
  current: number;
  total: number;
  currentFile: string;
  phase: GenerationPhase;
}

export enum GenerationPhase {
  INITIALIZING = 'initializing',
  GENERATING_STRUCTURE = 'generating-structure',
  PROCESSING_TEMPLATES = 'processing-templates',
  FINALIZING = 'finalizing',
  COMPLETED = 'completed'
}

export interface GenerationResult {
  success: boolean;
  outputPath: string;
  filesGenerated: string[];
  errors?: string[];
  warnings?: string[];
}