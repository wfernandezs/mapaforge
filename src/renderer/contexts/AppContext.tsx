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

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ProjectConfig, GenerationResult, GenerationProgress } from '@shared/types';

interface AppState {
  currentStep: number;
  projectConfig: Partial<ProjectConfig>;
  availableTemplates: string[];
  isGenerating: boolean;
  generationProgress: GenerationProgress | null;
  generationResult: GenerationResult | null;
  error: string | null;
}

type AppAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_CONFIG'; payload: Partial<ProjectConfig> }
  | { type: 'SET_TEMPLATES'; payload: string[] }
  | { type: 'START_GENERATION' }
  | { type: 'SET_PROGRESS'; payload: GenerationProgress }
  | { type: 'SET_RESULT'; payload: GenerationResult }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET_GENERATION' }
  | { type: 'RESET_ALL' };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    setStep: (step: number) => void;
    updateConfig: (config: Partial<ProjectConfig>) => void;
    setTemplates: (templates: string[]) => void;
    startGeneration: () => void;
    setProgress: (progress: GenerationProgress) => void;
    setResult: (result: GenerationResult) => void;
    setError: (error: string) => void;
    resetGeneration: () => void;
    resetAll: () => void;
  };
}

const initialState: AppState = {
  currentStep: 0,
  projectConfig: {},
  availableTemplates: [],
  isGenerating: false,
  generationProgress: null,
  generationResult: null,
  error: null
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'UPDATE_CONFIG':
      return { 
        ...state, 
        projectConfig: { ...state.projectConfig, ...action.payload },
        error: null
      };
    
    case 'SET_TEMPLATES':
      return { ...state, availableTemplates: action.payload };
    
    case 'START_GENERATION':
      return { 
        ...state, 
        isGenerating: true, 
        generationProgress: null,
        generationResult: null,
        error: null
      };
    
    case 'SET_PROGRESS':
      return { ...state, generationProgress: action.payload };
    
    case 'SET_RESULT':
      return { 
        ...state, 
        isGenerating: false,
        generationResult: action.payload,
        generationProgress: null
      };
    
    case 'SET_ERROR':
      return { 
        ...state, 
        isGenerating: false,
        error: action.payload,
        generationProgress: null
      };
    
    case 'RESET_GENERATION':
      return {
        ...state,
        isGenerating: false,
        generationProgress: null,
        generationResult: null,
        error: null
      };
    
    case 'RESET_ALL':
      return { ...initialState };
    
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setStep: (step: number) => dispatch({ type: 'SET_STEP', payload: step }),
    updateConfig: (config: Partial<ProjectConfig>) => dispatch({ type: 'UPDATE_CONFIG', payload: config }),
    setTemplates: (templates: string[]) => dispatch({ type: 'SET_TEMPLATES', payload: templates }),
    startGeneration: () => dispatch({ type: 'START_GENERATION' }),
    setProgress: (progress: GenerationProgress) => dispatch({ type: 'SET_PROGRESS', payload: progress }),
    setResult: (result: GenerationResult) => dispatch({ type: 'SET_RESULT', payload: result }),
    setError: (error: string) => dispatch({ type: 'SET_ERROR', payload: error }),
    resetGeneration: () => dispatch({ type: 'RESET_GENERATION' }),
    resetAll: () => dispatch({ type: 'RESET_ALL' })
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};