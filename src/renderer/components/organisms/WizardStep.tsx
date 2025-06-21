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
import { Button } from '../atoms/Button';

export interface WizardStepProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  skipLabel?: string;
  nextDisabled?: boolean;
  showNext?: boolean;
  showPrevious?: boolean;
  showSkip?: boolean;
  loading?: boolean;
  className?: string;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  title,
  description,
  children,
  onNext,
  onPrevious,
  onSkip,
  nextLabel = 'Next',
  previousLabel = 'Previous',
  skipLabel = 'Skip',
  nextDisabled = false,
  showNext = true,
  showPrevious = true,
  showSkip = false,
  loading = false,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {children}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          {showPrevious && onPrevious && (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={loading}
            >
              {previousLabel}
            </Button>
          )}
          {showSkip && onSkip && (
            <Button
              variant="ghost"
              onClick={onSkip}
              disabled={loading}
            >
              {skipLabel}
            </Button>
          )}
        </div>

        {showNext && onNext && (
          <Button
            onClick={onNext}
            disabled={nextDisabled || loading}
            loading={loading}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
};