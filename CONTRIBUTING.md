# Contributing to London.js Website

Thank you for your interest in contributing to the London.js website! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- **Node.js 22** or later
- **npm** (comes with Node.js)
- **gitleaks** (for pre-commit secret scanning)

### Installing gitleaks

Pre-commit hooks use gitleaks to prevent secrets from being committed. Install it before your first commit:

- **macOS**: `brew install gitleaks`
- **Linux**: Download from <https://github.com/gitleaks/gitleaks/releases>
- **Windows**: `scoop install gitleaks` or `choco install gitleaks`

### Getting Started

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

   This automatically sets up pre-commit hooks via husky.

3. Start the development server:

   ```bash
   npm run dev
   ```

## Available Scripts

| Command                | Description                    |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Start development server       |
| `npm run build`        | Build for production           |
| `npm run preview`      | Preview production build       |
| `npm test`             | Run tests                      |
| `npm run lint`         | Run ESLint                     |
| `npm run format:check` | Check formatting with Prettier |
| `npm run lint:md`      | Lint markdown files            |

## Pre-commit Hooks

Pre-commit hooks run automatically when you commit. They:

- Check for secrets with gitleaks
- Fix and validate code style with ESLint
- Format code with Prettier
- Lint markdown files

If you need to bypass hooks (not recommended), use `git commit --no-verify`.

## Content Contributions

### Adding a New Meetup

1. Create a new JSON file in `src/content/meetups/`
2. Name it `meetup-{month}-{year}.json` (e.g., `meetup-jan-26.json`)
3. Use the template from `src/templates/meetup.json`

### Meetup JSON Structure

```json
{
  "title": "Meetup Title",
  "date": "2026-01-15T18:30:00+00:00",
  "location": "Venue Name, Address",
  "speakers": [
    {
      "name": "Speaker Name",
      "talk": "Talk Title",
      "bio": "Speaker bio"
    }
  ],
  "sponsors": ["Sponsor Name"],
  "url": "https://meetup.com/london-js/events/..."
}
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure tests pass: `npm test`
4. Ensure build succeeds: `npm run build`
5. Push your branch and open a PR
6. Wait for code review

### PR Checklist

- [ ] Tests pass locally
- [ ] Build succeeds
- [ ] Code follows existing style (enforced by pre-commit hooks)
- [ ] Commit messages are clear and descriptive

## Code Review

All PRs require review before merging. Maintainers will review your changes and may request modifications.

## Questions?

For general questions about London.js events or membership, please visit our [Meetup group](https://www.meetup.com/london-js/).
