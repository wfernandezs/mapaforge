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

import React from 'react';
import { ProjectType } from '../../../shared/types';

interface ProjectTypeOption {
  type: ProjectType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface ProjectTypeSelectorProps {
  selectedType: ProjectType | null;
  onSelect: (type: ProjectType) => void;
  className?: string;
}

const projectTypeOptions: ProjectTypeOption[] = [
  {
    type: ProjectType.BACKEND_ONLY,
    title: 'Backend Only',
    description: 'API, microservices, or server-side applications',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    )
  },
  {
    type: ProjectType.FRONTEND_ONLY,
    title: 'Frontend Only',
    description: 'Single-page applications, websites, or mobile apps',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    type: ProjectType.FULL_STACK,
    title: 'Full Stack',
    description: 'Complete applications with frontend and backend',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  }
];

export const ProjectTypeSelector: React.FC<ProjectTypeSelectorProps> = ({
  selectedType,
  onSelect,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-900">Choose Project Type</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {projectTypeOptions.map((option) => {
          const isSelected = selectedType === option.type;
          
          return (
            <div
              key={option.type}
              className={`project-type-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(option.type)}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 p-2 rounded-lg ${
                    isSelected ? 'text-blue-600 bg-blue-100' : 'text-gray-400 bg-gray-100'
                  }`}
                >
                  {option.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-lg font-semibold ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {option.title}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}
                  >
                    {option.description}
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};