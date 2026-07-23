# Repository Guidelines

## Project Structure & Module Organization
This workspace currently contains only editor configuration under [`.vscode/`](.vscode/), including extension recommendations. There is no application source tree yet, so when code is added, keep the layout conventional and easy to scan:

- `src/` for application code
- `tests/` or `__tests__/` for automated tests
- `public/` or `assets/` for static files

If you introduce a different structure, document it in this file.

## Build, Test, and Development Commands
No build or test tooling is defined yet. Once the project is initialized, list the exact commands here and keep them current. Typical examples:

- `npm install` - install dependencies
- `npm run dev` - start a local development server
- `npm test` - run the test suite
- `npm run build` - produce a production build

## Coding Style & Naming Conventions
Follow the formatting rules of the chosen stack and keep them consistent across the repo. Until a formatter is added, use:

- 2-space indentation for JavaScript, TypeScript, JSON, and Markdown-friendly config files
- `camelCase` for variables and functions
- `PascalCase` for components, classes, and types
- `kebab-case` for file names unless the framework requires otherwise

If you add tools such as Prettier, ESLint, or Biome, check in their config files and prefer automated formatting over manual styling.

## Testing Guidelines
No testing framework is configured yet. When tests are introduced, name them to match the unit under test, such as `auth.service.test.ts` or `user.spec.ts`. Keep test fixtures close to the test file unless the suite becomes large.

## Commit & Pull Request Guidelines
There is no Git history available in this workspace, so no commit convention can be inferred yet. Use short, imperative commit messages such as `add login form` or `fix null check`. Pull requests should include:

- a brief summary of the change
- the commands used to verify it
- screenshots for UI changes, when applicable

## Agent-Specific Notes
The only detected repository-specific guidance is the VS Code recommendation in [`.vscode/extensions.json`](.vscode/extensions.json), which suggests the `openai.chatgpt` extension. Update this guide as soon as the codebase gains real structure, tooling, or CI checks.
