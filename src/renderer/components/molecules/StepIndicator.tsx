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

export interface Step {
  id: string;
  title: string;
  description?: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = ''
}) => {
  return (
    <nav aria-label="Progress" className={className}>
      <ol className="flex items-center">
        {steps.map((step, stepIndex) => {
          const isCompleted = stepIndex < currentStep;
          const isCurrent = stepIndex === currentStep;
          const isClickable = onStepClick && stepIndex <= currentStep;
          
          return (
            <li key={step.id} className="relative flex-1">
              {stepIndex !== steps.length - 1 && (
                <div className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" />
              )}
              
              <div
                className={`group relative flex items-start ${
                  isClickable ? 'cursor-pointer' : ''
                }`}
                onClick={isClickable ? () => onStepClick(stepIndex) : undefined}
              >
                <span className="flex h-9 items-center">
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'border-2 border-blue-600 bg-white text-blue-600'
                        : 'border-2 border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{stepIndex + 1}</span>
                    )}
                  </span>
                </span>
                
                <span className="ml-4 min-w-0 flex flex-col">
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-sm text-gray-500">{step.description}</span>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};