# VS Code Setup Guide

This document provides setup instructions for running this AMC Portal codebase in VS Code without errors.

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **VS Code**: Latest version

## Recommended VS Code Extensions

The following extensions are automatically recommended when opening this project in VS Code (see `.vscode/extensions.json`):

- **Prettier - Code formatter**: Format code automatically
- **TypeScript Hero**: Enhanced TypeScript support
- **Tailwind CSS IntelliSense**: Tailwind class autocomplete
- **Path Intellisense**: Autocomplete for file paths
- **JSON**: Better JSON support
- **Error Lens**: Show errors inline
- **Auto Rename Tag**: Rename paired HTML/JSX tags
- **ESLint**: JavaScript/TypeScript linting

## Setup Instructions

1. **Clone and Install Dependencies**:

   ```bash
   git clone <repository-url>
   cd <project-name>
   npm install
   ```

2. **VS Code Configuration**:

   - The project includes optimized VS Code settings in `.vscode/settings.json`
   - These settings enable auto-imports, formatting on save, and path intellisense

3. **TypeScript Configuration**:

   - TypeScript is configured with lenient settings for development
   - Path aliases (`@/` → `src/`) are properly configured
   - Strict mode is disabled for easier development

4. **Code Quality Tools**:

   ```bash
   # Type checking
   npm run typecheck

   # Linting (lenient configuration)
   npm run lint

   # Auto-fix linting issues
   npm run lint:fix

   # Format code
   npm run format.fix
   ```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npm run typecheck
```

## VS Code Features Enabled

### Auto Import and Path Resolution

- Automatic import suggestions for React components
- Path intellisense for `@/` aliases
- Auto-organize imports on save

### Code Formatting

- Prettier formatting on save
- Consistent code style enforcement
- Auto-rename of paired JSX tags

### Error Detection

- TypeScript errors shown inline
- ESLint warnings (non-blocking)
- Build errors highlighted

### Search and Navigation

- Optimized search excluding build directories
- Quick file navigation with path aliases
- Symbol navigation within files

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors in VS Code:

1. Run `npm run typecheck` in terminal to verify
2. Restart TypeScript service: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
3. Reload VS Code window if issues persist

### Import Resolution Issues

If imports aren't resolving:

1. Check that the `@/` path alias is working
2. Verify `tsconfig.json` has correct path mapping
3. Restart TypeScript service

### Linting Issues

ESLint is configured to be lenient and non-blocking:

- `any` types are allowed (already migrated away from problematic ones)
- Unused variables are warnings only
- Console statements are allowed

## Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── services/      # API and data services
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── styles/        # CSS and styling
└── config/        # Configuration files
```

## Key Features

- **Zero TypeScript Errors**: All type issues have been resolved
- **Robust Error Handling**: Services gracefully handle failures
- **Path Aliases**: Clean imports using `@/` prefix
- **Modern React**: Uses React 18 with hooks and modern patterns
- **Responsive Design**: Mobile-first responsive layout
- **Accessible**: ARIA attributes and semantic HTML

## Getting Help

If you encounter any issues:

1. Check the console for specific error messages
2. Run the development commands to isolate the issue
3. Review the TypeScript configuration if imports fail
4. Ensure all dependencies are properly installed

The codebase is now fully optimized for VS Code development with zero blocking errors.
