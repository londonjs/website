# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Security & CI/CD Hardening

This release implements comprehensive security hardening aligned with OpenSSF Scorecard, SLSA v1.0, and Linux Foundation open source best practices. Estimated Scorecard improvement: 3.5/10 → 8.5/10.

#### Supply Chain Security

- **SHA-pinned GitHub Actions** - All workflow actions pinned to immutable 40-character SHA hashes to prevent tag redirection attacks
- **ci.yml workflow** - New CI pipeline with build, test, lint, format check, and secret scanning
- **codeql.yml workflow** - Static Application Security Testing (SAST) with weekly scans
- **scorecard.yml workflow** - OpenSSF Scorecard analysis (upstream only)
- **sync-fork.yml workflow** - Automated fork synchronization with upstream
- **dependabot.yml** - Automated dependency updates for npm and GitHub Actions ecosystems

#### Code Quality

- **ESLint** - Flat config with TypeScript and Astro plugin support
- **Prettier** - Code formatting with Astro plugin support
- **markdownlint-cli2** - Markdown linting with configured exceptions
- **lint-staged** - Pre-commit quality checks on staged files

#### Secret Detection

- **gitleaks** - Pre-commit secret scanning via husky hooks
- **CI-level secret scanning** - gitleaks-action scans full git history on every push

#### Documentation

- **SECURITY.md** - Vulnerability disclosure policy with GitHub Private Vulnerability Reporting
- **CONTRIBUTING.md** - Comprehensive contribution guide with development setup
- **CODEOWNERS** - Code ownership targeting upstream maintainer (@faisalagood)
- **PR template** - Pull request checklist template
- **Issue templates** - Bug report and feature request forms

#### Repository Hygiene

- **Extended .gitignore** - Environment files, key material, auth tokens
- **Removed .cache/ from git** - Cache files no longer tracked
- **.node-version** - Node.js version specification for version managers
- **Node 22 requirement** - Added engines field to package.json

### Changed

- **deploy.yml** - Hardened with fork guard, scoped permissions, reduced cron frequency
- **package.json** - Updated test script to `vitest run`, added lint/format scripts, added engines
- **README.md** - Fixed clone URL, added security section, added script reference table

### Fixed

- Resolved high-severity npm vulnerabilities via `npm audit fix`:
  - astro: Remote allowlist bypass
  - devalue: DoS and prototype pollution vulnerabilities
  - diff: DoS vulnerability
  - h3: Request smuggling, path traversal, SSE injection
  - mdast-util-to-hast: Unsanitized class attribute
  - picomatch: Method injection and ReDoS
  - rollup: Path traversal
  - svgo: DoS through entity expansion

### Security

- Pre-commit hooks prevent secrets from being committed
- CI pipeline fails on high-severity vulnerabilities
- CodeQL scans for security vulnerabilities weekly
- Dependabot creates PRs for vulnerable dependencies

### Breaking Changes

- **Node.js 22 required** - Projects using older Node versions must upgrade
- **Pre-commit hooks required** - Contributors must install gitleaks locally

### Files Changed (84 files)

**Workflows**: `.github/workflows/ci.yml`, `codeql.yml`, `deploy.yml`, `scorecard.yml`, `sync-fork.yml`
**Config**: `.github/dependabot.yml`, `CODEOWNERS`, `pull_request_template.md`
**Issue templates**: `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml`, `config.yml`
**Root docs**: `CONTRIBUTING.md`, `SECURITY.md`, `SECURITY_ROADMAP.md`, `.node-version`
**Lint config**: `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.markdownlint-cli2.jsonc`
**Hooks**: `.husky/pre-commit`, `.gitleaks.toml`, `package.json` (lint-staged)
**Git**: `.gitignore`, `.cache/` (removed from tracking)
**Package**: `package.json`, `package-lock.json`
**Source**: All `.astro`, `.ts`, `.tsx`, `.jsx`, `.css`, `.json` files formatted

---

## [0.0.1] - Previous releases

Initial release of the London.js Community Website.

### Features

- Astro 5 static site generator
- React 19 components
- Tailwind CSS v4 styling
- Vitest testing setup
- Content collections for meetup data
- GitHub Pages deployment

[Unreleased]: https://github.com/londonjs/website/compare/main...HEAD
[0.0.1]: https://github.com/londonjs/website/releases/tag/v0.0.1
