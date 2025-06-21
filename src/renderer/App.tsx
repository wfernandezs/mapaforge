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
import { AppProvider, useAppContext } from './contexts/AppContext';
import { StepIndicator, Step } from './components/molecules/StepIndicator';
import { ProjectConfigurationStep } from './components/organisms/ProjectConfigurationStep';
import { Logo } from './components/atoms/Logo';
import { useElectronEvents } from './hooks/useElectron';

const steps: Step[] = [
  {
    id: 'project-config',
    title: 'Project Configuration',
    description: 'Basic project settings'
  },
  {
    id: 'technology-stack',
    title: 'Technology Stack',
    description: 'Choose your technologies'
  },
  {
    id: 'template-selection',
    title: 'Template Selection',
    description: 'Select project template'
  },
  {
    id: 'review-generate',
    title: 'Review & Generate',
    description: 'Review and create project'
  }
];

const AppContent: React.FC = () => {
  const { state, actions } = useAppContext();

  useElectronEvents(
    (progress) => actions.setProgress(progress),
    (result) => actions.setResult(result),
    (error) => actions.setError(error.message)
  );

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 0:
        return <ProjectConfigurationStep />;
      case 1:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Technology Stack Selection</h2>
            <p className="mt-4 text-gray-600">This step is coming soon...</p>
          </div>
        );
      case 2:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Template Selection</h2>
            <p className="mt-4 text-gray-600">This step is coming soon...</p>
          </div>
        );
      case 3:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Review & Generate</h2>
            <p className="mt-4 text-gray-600">This step is coming soon...</p>
          </div>
        );
      default:
        return <ProjectConfigurationStep />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto py-12 px-6">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-6 animate-float">
            <Logo size="lg" className="mr-4 glow" />
            <h1 className="text-4xl font-bold gradient-text text-shadow-lg">
              MapaForge
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-medium">
            Generate clean, maintainable project boilerplates
          </p>
        </div>

        <div className="mb-10">
          <StepIndicator
            steps={steps}
            currentStep={state.currentStep}
            onStepClick={(stepIndex) => {
              if (stepIndex <= state.currentStep) {
                actions.setStep(stepIndex);
              }
            }}
          />
        </div>

        <div className="card glow-hover">
          <div className="p-10">
            {renderCurrentStep()}
          </div>
        </div>

        {state.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{state.error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;