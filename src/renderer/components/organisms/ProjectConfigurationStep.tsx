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

import React, { useState } from 'react';
import { WizardStep } from './WizardStep';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { ProjectTypeSelector } from '../molecules/ProjectTypeSelector';
import { useAppContext } from '../../contexts/AppContext';
import { useElectron } from '../../hooks/useElectron';
import { ArchitectureType } from '../../../shared/types';

const architectureOptions = [
  { value: ArchitectureType.MONOLITHIC, label: 'Monolithic' },
  { value: ArchitectureType.MICROSERVICES, label: 'Microservices' },
  { value: ArchitectureType.SERVERLESS, label: 'Serverless' },
  { value: ArchitectureType.JAMSTACK, label: 'JAMStack' },
  { value: ArchitectureType.SPA, label: 'Single Page Application' },
  { value: ArchitectureType.SSR, label: 'Server-Side Rendered' }
];

export const ProjectConfigurationStep: React.FC = () => {
  const { state, actions } = useAppContext();
  const { selectDirectory } = useElectron();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    actions.updateConfig({ [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleDirectorySelect = async () => {
    try {
      const directory = await selectDirectory();
      if (directory) {
        actions.updateConfig({ outputPath: directory });
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    const config = state.projectConfig;

    if (!config.name || config.name.trim() === '') {
      newErrors.name = 'Project name is required';
    } else if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(config.name)) {
      newErrors.name = 'Project name must start with a letter and contain only letters, numbers, hyphens, and underscores';
    }

    if (!config.type) {
      newErrors.type = 'Project type is required';
    }

    if (!config.architecture) {
      newErrors.architecture = 'Architecture type is required';
    }

    if (!config.outputPath || config.outputPath.trim() === '') {
      newErrors.outputPath = 'Output path is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      actions.setStep(state.currentStep + 1);
    }
  };

  const handlePrevious = () => {
    actions.setStep(state.currentStep - 1);
  };

  const isNextDisabled = !state.projectConfig.name || 
                         !state.projectConfig.type || 
                         !state.projectConfig.architecture || 
                         !state.projectConfig.outputPath;

  return (
    <WizardStep
      title="Project Configuration"
      description="Configure the basic settings for your new project"
      onNext={handleNext}
      onPrevious={state.currentStep > 0 ? handlePrevious : (() => {})}
      showPrevious={state.currentStep > 0}
      nextDisabled={isNextDisabled}
    >
      <div className="space-y-6">
        <Input
          label="Project Name"
          placeholder="my-awesome-project"
          value={state.projectConfig.name || ''}
          onChange={(value) => handleInputChange('name', value)}
          error={errors.name}
          required
        />

        <ProjectTypeSelector
          selectedType={state.projectConfig.type || null}
          onSelect={(type) => handleInputChange('type', type)}
        />
        {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}

        <Select
          label="Architecture"
          value={state.projectConfig.architecture || ''}
          onChange={(value) => handleInputChange('architecture', value)}
          options={architectureOptions}
          placeholder="Select architecture pattern"
          error={errors.architecture}
          required
        />

        <div className="space-y-2">
          <label className="form-label">
            Output Directory <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={state.projectConfig.outputPath || ''}
              onChange={(e) => handleInputChange('outputPath', e.target.value)}
              placeholder="/path/to/output/directory"
              className="form-input flex-1"
            />
            <button
              type="button"
              onClick={handleDirectorySelect}
              className="btn-outline"
            >
              Browse
            </button>
          </div>
          {errors.outputPath && <p className="text-sm text-red-600 mt-1">{errors.outputPath}</p>}
        </div>
      </div>
    </WizardStep>
  );
};