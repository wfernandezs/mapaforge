# MapaForge

A desktop application for generating clean, maintainable project boilerplates with various architectures, folder structures, and technology stacks.

## Features

- **Clean Architecture**: Built with SOLID principles and dependency injection
- **Multiple Project Types**: Backend-only, Frontend-only, and Full-stack projects
- **Architecture Patterns**: Monolithic, Microservices, Serverless, JAMStack, SPA, SSR
- **Technology Stacks**: Support for popular frameworks and tools
- **Template Engine**: Pluggable template system with Handlebars, Mustache, and EJS
- **Plugin System**: Extensible architecture for custom functionality
- **Real-time Progress**: Live updates during project generation
- **Cross-platform**: Works on Windows, macOS, and Linux

## Tech Stack

### Core Technologies
- **Electron**: Desktop application framework
- **React**: User interface library
- **TypeScript**: Type-safe JavaScript
- **Node.js**: Backend runtime

### Architecture & Patterns
- **Dependency Injection**: InversifyJS container
- **Clean Architecture**: Layered design with clear boundaries
- **Observer Pattern**: Real-time progress updates
- **Strategy Pattern**: Multiple template engines
- **Factory Pattern**: Dynamic component creation

### Development Tools
- **Jest**: Unit and integration testing
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **Tailwind CSS**: Utility-first styling
- **Webpack**: Module bundling
- **Husky**: Git hooks for quality gates

## Project Structure

```
src/
├── main/                          # Electron main process
│   ├── core/                      # Core abstractions and interfaces
│   │   ├── interfaces/            # Service interfaces
│   │   ├── abstractions/          # Base classes
│   │   └── types/                 # Type definitions
│   ├── modules/                   # Business logic modules
│   │   ├── template-engine/       # Template processing
│   │   ├── file-generator/        # File generation logic
│   │   ├── project-config/        # Configuration management
│   │   └── validation/            # Input validation
│   └── infrastructure/            # External concerns
│       ├── electron/              # Electron-specific code
│       ├── file-system/           # File operations
│       └── logging/               # Logging implementation
├── renderer/                      # React frontend
│   ├── components/                # UI components
│   │   ├── atoms/                 # Basic components
│   │   ├── molecules/             # Composite components
│   │   ├── organisms/             # Complex components
│   │   └── templates/             # Page layouts
│   ├── hooks/                     # Custom React hooks
│   ├── contexts/                  # React contexts
│   ├── services/                  # Frontend services
│   └── utils/                     # Utility functions
└── shared/                        # Shared code
    ├── constants/                 # Application constants
    ├── types/                     # Shared type definitions
    └── validators/                # Validation schemas
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project-scaffolder
```

2. Install dependencies:
```bash
npm install
```

3. Set up development environment:
```bash
# Create logs directory
mkdir logs

# Set up git hooks
npm run prepare
```

### Development

1. Start the development server:
```bash
npm run dev
```

This will start both the Electron main process and the React development server.

2. Run tests:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

3. Lint and format code:
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Building

1. Build for production:
```bash
npm run build
```

2. Package the application:
```bash
# This command would be added for packaging
npm run package
```

## Architecture Principles

### Clean Code
- **Single Responsibility**: Each class has one reason to change
- **DRY**: No code duplication
- **KISS**: Simple, understandable solutions
- **YAGNI**: Implement only what's needed

### SOLID Principles
- **S**: Single Responsibility Principle
- **O**: Open/Closed Principle
- **L**: Liskov Substitution Principle
- **I**: Interface Segregation Principle
- **D**: Dependency Inversion Principle

### Design Patterns
- **Dependency Injection**: Loose coupling between components
- **Observer Pattern**: Real-time notifications
- **Strategy Pattern**: Interchangeable algorithms
- **Factory Pattern**: Object creation abstraction
- **Template Method**: Consistent processing workflows

## Testing Strategy

### Test Types
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **End-to-End Tests**: Full workflow testing

### Coverage Requirements
- Minimum 80% code coverage
- All business logic must be tested
- Critical user flows covered by E2E tests

### Test Structure
```
tests/
├── unit/                          # Unit tests
├── integration/                   # Integration tests
├── e2e/                          # End-to-end tests
└── setup.ts                      # Test configuration
```

## Contributing

### Code Standards
- Follow TypeScript strict mode
- Maximum function length: 30 lines
- Maximum file length: 300 lines
- Use meaningful variable names
- Write self-documenting code

### Commit Guidelines
- Use conventional commits
- Include tests for new features
- Update documentation as needed

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation
5. Submit pull request

## Plugin Development

The application supports custom plugins for extending functionality:

```typescript
import { BasePlugin } from '@main/core/abstractions/BasePlugin';
import { ProjectConfig } from '@shared/types';

export class CustomPlugin extends BasePlugin {
  readonly name = 'custom-plugin';
  readonly version = '1.0.0';
  readonly description = 'Custom functionality';

  protected async onInit(): Promise<void> {
    // Plugin initialization
  }

  async execute(config: ProjectConfig): Promise<void> {
    // Plugin logic
  }

  protected async onCleanup(): Promise<void> {
    // Cleanup logic
  }
}
```

## Template Development

Create custom templates by following the template structure:

```yaml
# template.yml
name: "My Custom Template"
version: "1.0.0"
description: "A custom project template"
author: "Your Name"
supportedTypes: ["full-stack"]
files:
  - path: "package.json"
    isTemplate: true
  - path: "src/index.ts"
    isTemplate: true
variables:
  - name: "projectName"
    type: "string"
    required: true
    description: "Project name"
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions