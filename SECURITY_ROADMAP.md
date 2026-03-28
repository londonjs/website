# Security & CI/CD Roadmap

> **Status: ✅ COMPLETED** (2026-03-27)
>
> All 4 phases (33 tasks) have been implemented. See [CHANGELOG.md](CHANGELOG.md) for details.
> Estimated OpenSSF Scorecard improvement: ~3.5/10 → ~8.5/10

This document is an actionable roadmap for hardening this repository against
supply chain attacks and aligning it with OpenSSF Scorecard, SLSA v1.0, and
Linux Foundation open source best practices.

Each phase is a discrete unit of work. Phases MUST be completed in order.
Each task includes acceptance criteria that MUST all pass before moving on.

**Target**: Improve estimated OpenSSF Scorecard from ~3.5/10 to ~8.5/10.

---

## Operating Context

All changes are authored on the fork `mcleo-d/website` and submitted as PRs to
upstream `londonjs/website`. Repository-specific references (CODEOWNERS, workflow
guards) MUST target the **upstream** repo and its maintainers unless explicitly
noted otherwise.

The `Binary-Artifacts` and `Fuzzing` Scorecard checks are out of scope.
Binary-Artifacts passes without intervention. Fuzzing is impractical for a
static website; consider `fast-check` property-based testing in a future
iteration if Scorecard coverage is desired.

---

## Baseline Context

- **Upstream repo**: `londonjs/website`
- **Fork**: `mcleo-d/website` (read-only access to upstream)
- **Stack**: Astro 5, React 19, Tailwind CSS v4, TypeScript, Node.js 22, npm
- **Test runner**: Vitest (jsdom) — `npm test` (must use `vitest run`, see 1.2)
- **Build command**: `npm run build` (runs `astro build`)
- **Type checker**: `npx astro check`
- **Deploy target**: GitHub Pages at `london.js.org`
- **Existing CI**: Single `deploy.yml` workflow
- **Pre-commit hooks**: None configured
- **Linting/formatting**: None configured
- **`.cache/` directory**: Tracked in git, contains `meetup-members.json`.
  The `getMeetupMembers()` function handles a missing cache gracefully (returns
  `null` and fetches live data), so removing `.cache/` from git is safe.

---

## SHA Pin Reference

Verified 2026-03-27. An agent MUST verify each SHA before use by running:
`gh api repos/{owner}/{repo}/git/commits/{sha} --jq '.sha'`

At Phase 1 execution time, only `deploy.yml` exists. Pins for workflows created
in later phases are included here for forward reference.

```text
actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683           # v4.2.2
actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020         # v4.4.0
actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa # v3.0.1
actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02     # v4.6.2
actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e       # v4.0.5
withastro/action@74d664f13f9f9063e37b49d74a74613dbf94db3c           # v6.0.0
github/codeql-action@3b1a19a80ab047f35cbb237b5bd9bdc1e14f166c       # v3
gitleaks/gitleaks-action@ff98106e4c7b2bc287b24eaf42907196329070c7   # v2.3.9
ossf/scorecard-action@ff5dd8929f96a8a4dc67d13f32b8c75057829621      # v2.4.0
anchore/sbom-action@e22c389904149dbc22b58101806040fa8d37a610        # v0.24.0
```

---

## Phase 1: Critical — Supply Chain & Secret Detection ✅

> **Status: Completed** - All acceptance criteria met.

### 1.1 Pin all GitHub Actions to full SHA hashes

**Why**: OpenSSF Scorecard `Pinned-Dependencies` check. Mutable tags can be
redirected by a compromised action repository.

**Action**: In `.github/workflows/deploy.yml` (the only workflow file at this
point), replace every `uses:` tag reference with the pinned SHA from the
reference table above. Use `withastro/action` v6.0.0 (not v3.0.2 which is EOL).

Review the `withastro/action` v4/v5/v6 changelogs for breaking changes before
pinning. Key changes: v4 switched to Node LTS, v5 upgraded
`upload-pages-artifact` to v4, v6 may have further changes. Adjust the
`deploy.yml` `upload-pages-artifact` step if `withastro/action` v6 handles
artifact upload internally, to avoid creating duplicate artifacts.

**Acceptance criteria**:

- [ ] No workflow file contains an `@v` tag reference for any action
- [ ] Every `uses:` line has a 40-character SHA followed by a `# vX.Y.Z` comment
- [ ] Each SHA is verified via `gh api repos/{owner}/{repo}/git/commits/{sha}`
- [ ] `withastro/action` is pinned to v6.0.0, not v3.0.2

### 1.2 Create `ci.yml` — build and test on every PR

**Why**: OpenSSF Scorecard `CI-Tests` check. PRs currently have no quality gate.

**Action**: Create `.github/workflows/ci.yml` with the following behaviour:

- Trigger on `pull_request` to `main` and `push` to `main`
- Top-level `permissions: contents: read`
- Steps (in this exact order):
  1. `actions/checkout` (pinned)
  2. `actions/setup-node` (pinned, `node-version: '22'`, `cache: 'npm'`)
  3. `npm ci`
  4. `npm test` (see note below about vitest)
  5. `npx astro check`
  6. `npm run build`

**Vitest fix**: The current `package.json` has `"test": "vitest"` which defaults
to watch mode. Change it to `"test": "vitest run"` for explicit single-run
behaviour. This is required before CI can run tests.

**Node version**: Also add `"engines": { "node": ">=22" }` to `package.json`
and create a `.node-version` file containing `22` in the repository root for
consistency across all environments.

**Acceptance criteria**:

- [ ] Workflow file exists at `.github/workflows/ci.yml`
- [ ] All actions pinned to SHA with version comment
- [ ] `permissions` block grants only `contents: read`
- [ ] Uses `npm ci` (not `npm install`)
- [ ] Runs test, type check, and build in that order
- [ ] `package.json` test script is `"test": "vitest run"`
- [ ] `package.json` has `"engines": { "node": ">=22" }`
- [ ] `.node-version` file exists containing `22`

### 1.3 Harden `deploy.yml`

**Why**: OpenSSF Scorecard `Token-Permissions` and `Dangerous-Workflow` checks.
The current workflow has overly broad permissions, no fork guard, and a
redundant `pull_request` trigger.

**Action**: Rewrite `.github/workflows/deploy.yml`:

- **Remove `pull_request`** from triggers — `ci.yml` now handles PR validation.
  Remaining triggers: `push: branches: [main]`, `workflow_dispatch`, `schedule`
- Add `if: github.repository == 'londonjs/website'` to **both** `build` and
  `deploy` jobs so the entire workflow is skipped on forks
- Set top-level `permissions: contents: read`
- Move `pages: write` and `id-token: write` to the `deploy` job only
- Add concurrency control:

  ```yaml
  concurrency:
    group: pages-deploy
    cancel-in-progress: false
  ```

- Reduce `schedule` cron from hourly (`0 * * * *`) to every 6 hours
  (`0 */6 * * *`) — balances data freshness (meetup member count) against CI
  minute usage. The hourly cron exists because `getMeetupMembers()` caches data
  with a 1-hour TTL; every-6-hours is an acceptable trade-off.
- Pin all actions to SHA (per 1.1)

**Acceptance criteria**:

- [ ] `pull_request` is NOT in the triggers list
- [ ] Both `build` and `deploy` jobs have `if: github.repository == 'londonjs/website'`
- [ ] Top-level permissions are `contents: read` only
- [ ] `pages: write` and `id-token: write` scoped to `deploy` job only
- [ ] Concurrency group is set with `cancel-in-progress: false`
- [ ] Cron schedule is `0 */6 * * *` or less frequent
- [ ] All actions pinned to SHA

### 1.4 Install pre-commit hooks (husky + lint-staged + gitleaks)

**Why**: OpenSSF Best Practices. Secrets committed to git history are permanent.
Pre-commit prevention is cheaper than remediation.

**Action**:

1. Install dev dependencies: `husky`, `lint-staged`
2. Add `"prepare": "husky"` to `package.json` scripts
3. Run `npx husky init` to create the `.husky/` directory
4. Set `.husky/pre-commit` contents to: `npx lint-staged`
5. Add `lint-staged` config to `package.json`:

   ```json
   {
     "lint-staged": {
       "*": ["gitleaks protect --staged --no-banner"]
     }
   }
   ```

6. Create `.gitleaks.toml` in the repository root for false-positive management:

   ```toml
   [allowlist]
   description = "Known false positives"
   paths = [
     '''package-lock\.json'''
   ]
   ```

**gitleaks installation (not an npm package)**:

- macOS: `brew install gitleaks`
- Linux: Download binary from <https://github.com/gitleaks/gitleaks/releases>
- Windows: `scoop install gitleaks` or `choco install gitleaks`

If `gitleaks` is not installed locally, `lint-staged` will fail and block all
commits. This is intentional — contributors MUST install gitleaks. Document
this requirement in `CONTRIBUTING.md` (Phase 4).

**Note**: Linting and formatting hooks are added in Phase 2 after those tools
are configured. Do NOT add lint/format steps to `lint-staged` in this phase.

**Acceptance criteria**:

- [ ] `husky` and `lint-staged` are in `devDependencies`
- [ ] `package.json` has a `prepare` script that runs `husky`
- [ ] `.husky/pre-commit` exists and runs `npx lint-staged`
- [ ] `lint-staged` config runs gitleaks on all staged files
- [ ] `.gitleaks.toml` exists with an allowlist section
- [ ] Verify by running:

  ```bash
  echo "GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" > test-secret.txt
  git add test-secret.txt
  git commit -m "test"   # MUST fail with gitleaks error
  rm test-secret.txt && git reset HEAD test-secret.txt
  ```

### 1.5 Add CI-level secret scanning

**Why**: Defence in depth. Pre-commit hooks can be bypassed with `--no-verify`.

**Action**: Add a `secret-scan` job to `ci.yml`:

```yaml
secret-scan:
  runs-on: ubuntu-latest
  permissions:
    contents: read
  steps:
    - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      with:
        fetch-depth: 0
    - uses: gitleaks/gitleaks-action@ff98106e4c7b2bc287b24eaf42907196329070c7 # v2.3.9
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Security note**: `gitleaks-action` is a third-party action that receives
`GITHUB_TOKEN`. The token scope is limited to `contents: read` per the job
permissions, which limits blast radius. This is standard industry practice.

**Acceptance criteria**:

- [ ] `secret-scan` job exists in `ci.yml`
- [ ] Job uses `fetch-depth: 0` for full history scan
- [ ] Action is pinned to SHA with version comment `# v2.3.9`
- [ ] Job permissions are `contents: read` only

### 1.6 Create `SECURITY.md`

**Why**: OpenSSF Scorecard `Security-Policy` check. Vulnerability reporters need
a safe disclosure channel.

**Action**: Create `SECURITY.md` in the repository root. Use GitHub Private
Vulnerability Reporting as the primary disclosure channel. Do NOT include
personal email addresses.

Content MUST include:

- Heading: `# Security Policy`
- Instructions to use GitHub's private vulnerability reporting feature, with a
  link to `https://github.com/londonjs/website/security/advisories/new`
- Explicit statement: "Please do NOT open a public GitHub issue for security
  vulnerabilities."
- Response timeline: acknowledge within 48 hours, assess within 7 days, fix or
  mitigate within 30 days
- Scope: this repository and the deployed site at `london.js.org`
- Supported versions: latest on `main` only

**Acceptance criteria**:

- [ ] `SECURITY.md` exists at the repository root
- [ ] Links to GitHub Private Vulnerability Reporting (not personal email)
- [ ] Contains "do NOT open a public GitHub issue" instruction
- [ ] Contains response timeline with specific day counts

---

## Phase 2: High — Code Quality & Vulnerability Scanning ✅

> **Status: Completed** - All acceptance criteria met.

### 2.1 Add ESLint

**Action**:

1. Install: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`
2. Create `eslint.config.js` using the flat config format:

   ```js
   import js from '@eslint/js';
   import tseslint from 'typescript-eslint';
   import astro from 'eslint-plugin-astro';

   export default [
     js.configs.recommended,
     ...tseslint.configs.recommended,
     ...astro.configs.recommended,
     {
       ignores: ['dist/', '.astro/', 'node_modules/', '.cache/'],
     },
   ];
   ```

3. Add `"lint": "eslint ."` to `package.json` scripts
4. Run `npx eslint . --fix` to auto-fix existing code, then commit the fixes
5. Verify `npm run lint` passes with zero errors
6. Add `npm run lint` step to `ci.yml` after `npm ci`, before `npm test`

Do NOT update `lint-staged` yet — see task 2.4 for the combined update.

**Acceptance criteria**:

- [ ] `eslint.config.js` exists using flat config format
- [ ] Config extends `@eslint/js` recommended, `typescript-eslint` recommended,
      and `eslint-plugin-astro` recommended
- [ ] Config ignores `dist/`, `.astro/`, `node_modules/`, `.cache/`
- [ ] `npm run lint` passes with zero errors after auto-fix
- [ ] CI runs lint after `npm ci` and before `npm test`

### 2.2 Add Prettier

**Action**:

1. Install: `prettier`, `prettier-plugin-astro`
2. Create `.prettierrc`:

   ```json
   {
     "semi": true,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "es5",
     "printWidth": 100,
     "plugins": ["prettier-plugin-astro"]
   }
   ```

3. Create `.prettierignore`:

   ```text
   dist/
   .astro/
   node_modules/
   package-lock.json
   .cache/
   ```

4. Add `"format:check": "prettier --check ."` to `package.json` scripts
5. Run `npx prettier --write .` to auto-format existing code, then commit
6. Verify `npm run format:check` passes
7. Add `npm run format:check` step to `ci.yml` after lint, before `npm test`

Do NOT update `lint-staged` yet — see task 2.4 for the combined update.

**Acceptance criteria**:

- [ ] `.prettierrc` exists with the config above
- [ ] `.prettierignore` exists
- [ ] `npm run format:check` passes after auto-format
- [ ] CI runs format check after lint, before tests

### 2.3 Add markdownlint

**Action**:

1. Install: `markdownlint-cli2`
2. Create `.markdownlint-cli2.jsonc`:

   ```jsonc
   {
     "config": {
       "default": true,
       "MD013": false,
       "MD033": false,
     },
     "globs": ["**/*.md"],
     "ignores": ["node_modules", "dist"],
   }
   ```

3. Add `"lint:md": "markdownlint-cli2"` to `package.json` scripts
4. Run `npx markdownlint-cli2 --fix` to auto-fix existing markdown, then commit
5. Verify `npm run lint:md` passes
6. Add `npm run lint:md` step to `ci.yml` after format check, before `npm test`

Do NOT update `lint-staged` yet — see task 2.4 for the combined update.

**Acceptance criteria**:

- [ ] `.markdownlint-cli2.jsonc` exists with `MD013` and `MD033` disabled
- [ ] `npm run lint:md` passes after auto-fix
- [ ] CI runs markdown lint after format check, before tests

### 2.4 Update lint-staged with all Phase 2 tools

**Why**: Updating lint-staged incrementally per-tool creates intermediate states
that don't match the final config. This task writes the final config in one step
after all tools are configured.

**Action**: Replace the `lint-staged` config in `package.json` with the
complete final configuration:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,astro}": ["eslint --fix --max-warnings 0", "prettier --write"],
    "*.md": ["markdownlint-cli2", "prettier --write"],
    "*.{css,json}": ["prettier --write"],
    "*": ["gitleaks protect --staged --no-banner"]
  }
}
```

**Acceptance criteria**:

- [ ] `lint-staged` config in `package.json` matches the block above exactly
- [ ] The gitleaks rule from Phase 1.4 is preserved in the `"*"` key
- [ ] Verify by staging a `.ts` file and a `.md` file and running
      `npx lint-staged` — both should be processed by their respective tools

### 2.5 Add CodeQL SAST scanning

**Why**: OpenSSF Scorecard `SAST` check.

**Action**: Create `.github/workflows/codeql.yml`:

- Trigger on `push` to `main`, `pull_request` to `main`, and weekly schedule
  (`0 6 * * 1` — Monday 6am UTC)
- Top-level `permissions: contents: read`
- Job permissions: `contents: read`, `security-events: write`
- Language matrix: `javascript-typescript`
- Pin all actions to SHA
- This workflow intentionally has NO repository guard — CodeQL is useful on
  both upstream and forks during development

```yaml
name: CodeQL
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'

permissions:
  contents: read

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
    strategy:
      matrix:
        language: [javascript-typescript]
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: github/codeql-action/init@3b1a19a80ab047f35cbb237b5bd9bdc1e14f166c # v3
        with:
          languages: ${{ matrix.language }}
      - uses: github/codeql-action/autobuild@3b1a19a80ab047f35cbb237b5bd9bdc1e14f166c # v3
      - uses: github/codeql-action/analyze@3b1a19a80ab047f35cbb237b5bd9bdc1e14f166c # v3
```

**Acceptance criteria**:

- [ ] Workflow file exists at `.github/workflows/codeql.yml`
- [ ] All actions pinned to SHA with version comments
- [ ] Top-level permissions are `contents: read`
- [ ] Job permissions are `contents: read` and `security-events: write`
- [ ] Schedule is weekly

### 2.6 Add dependency vulnerability scanning

**Action**: Add an `audit` step to `ci.yml` after `npm ci` and before lint:

```yaml
- run: npm audit --audit-level=high
```

**Handling pre-existing vulnerabilities**: If `npm audit` fails due to
pre-existing vulnerabilities that cannot be resolved immediately:

1. First attempt `npm audit fix`
2. If unfixable vulnerabilities remain in dev dependencies only, use
   `npm audit --audit-level=high --omit=dev` as a temporary measure
3. Document any accepted risks in a new `audit-exceptions.md` file in the
   repository root, including: package name, vulnerability ID, severity,
   reason for deferral, and review date
4. Set a calendar reminder to revisit within 30 days

**Acceptance criteria**:

- [ ] `npm audit` step exists in `ci.yml` after `npm ci`
- [ ] Audit level is `high`
- [ ] If audit fails, remediation steps above are followed before proceeding
- [ ] Any exceptions are documented in `audit-exceptions.md`

### 2.7 Add `dependabot.yml`

**Action**: Create `.github/dependabot.yml` covering both ecosystems:

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
    open-pull-requests-limit: 10
    labels:
      - 'dependencies'
    groups:
      production-deps:
        dependency-type: 'production'
      dev-deps:
        dependency-type: 'development'
        update-types: ['minor', 'patch']

  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
    labels:
      - 'ci'
```

**Key**: The `github-actions` ecosystem keeps SHA-pinned actions up to date.
Without it, pinned SHAs become permanently stale.

**Acceptance criteria**:

- [ ] File exists at `.github/dependabot.yml`
- [ ] Covers both `npm` and `github-actions` ecosystems
- [ ] Groups are configured to reduce PR noise
- [ ] Labels are set for easy filtering

---

### CI step order after Phase 2

After all Phase 2 tasks, the `ci.yml` job steps MUST be in this order:

1. `actions/checkout` (pinned)
2. `actions/setup-node` (pinned, `node-version: '22'`, `cache: 'npm'`)
3. `npm ci`
4. `npm audit --audit-level=high`
5. `npm run lint`
6. `npm run format:check`
7. `npm run lint:md`
8. `npm test`
9. `npx astro check`
10. `npm run build`

The `secret-scan` job (from 1.5) runs as a separate parallel job.

---

## Phase 3: Medium — Repository Hygiene & Hardening ✅

> **Status: Completed** - All acceptance criteria met.

### 3.1 Extend `.gitignore`

**Action**: Add these entries to `.gitignore`:

```gitignore
# Environment files (all variants)
.env*
!.env.example

# Key material
*.pem
*.key
*.p12
*.cert

# Auth tokens
.npmrc

# Editor swap files
*.swp
*.swo
*~
```

Remove the existing standalone `.env` and `.env.production` lines (now covered
by the `.env*` glob). Preserve the `!.env.example` negation so a template env
file can be committed.

**Note**: If a project `.npmrc` exists with non-secret configuration (e.g.,
registry URL), rename it to `.npmrc.example` before adding `.npmrc` to
`.gitignore`.

**Acceptance criteria**:

- [ ] `.gitignore` covers all env file variants via `.env*` glob
- [ ] `.gitignore` covers key material (`*.pem`, `*.key`, `*.p12`, `*.cert`)
- [ ] `.gitignore` covers `.npmrc`
- [ ] No duplicate entries exist
- [ ] `!.env.example` negation is present

### 3.2 Remove `.cache/` from git tracking

**Prerequisite verification**: The `getMeetupMembers()` function in
`src/lib/getMeetupMembers.ts` handles a missing cache file gracefully —
`readCache()` returns `null` if the file doesn't exist, then fetches live data.
This has been verified.

**Action**:

1. Add `.cache/` to `.gitignore`
2. Run `git rm -r --cached .cache/`
3. Verify build succeeds without the cached file:

   ```bash
   rm -rf .cache/ && npm run build
   ```

**Acceptance criteria**:

- [ ] `.cache/` is in `.gitignore`
- [ ] `.cache/` is no longer tracked by git (`git ls-files .cache/` returns empty)
- [ ] `rm -rf .cache/ && npm run build` completes without errors

### 3.3 Add CODEOWNERS

**Action**: Create `.github/CODEOWNERS` targeting the **upstream** repository's
maintainer(s). Use the upstream org handle, not the fork owner.

```text
# Default — upstream maintainer
* @faisalagood

# Workflow and config files require maintainer review
.github/ @faisalagood
astro.config.mjs @faisalagood
package.json @faisalagood
tsconfig.json @faisalagood
```

**Note**: `@faisalagood` is the upstream repo owner. Confirm the handle is
correct by checking `gh api repos/londonjs/website --jq '.owner.login'` before
creating the file. If the upstream has multiple maintainers, add them all.

**Acceptance criteria**:

- [ ] File exists at `.github/CODEOWNERS`
- [ ] Uses the upstream maintainer handle(s), not the fork owner
- [ ] Workflow and config files have explicit owner entries

### 3.4 Add PR template

**Action**: Create `.github/pull_request_template.md`:

```markdown
## Description

<!-- What does this PR do? -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Content update (new meetup, speaker info, etc.)
- [ ] Documentation
- [ ] CI/Build changes
- [ ] Dependency update

## Checklist

- [ ] I have tested my changes locally (`npm run build`)
- [ ] My changes follow the existing code style
- [ ] I have run `npm test` and all tests pass
- [ ] I have installed pre-commit hooks (`npm install` activates them)
```

**Acceptance criteria**:

- [ ] File exists at `.github/pull_request_template.md`
- [ ] Includes checkboxes for type of change
- [ ] Includes checklist with "tested locally", "code style", and "tests pass"

### 3.5 Create `sync-fork.yml`

**Why**: Keeps forks in sync with upstream without manual intervention.

**Action**: Create `.github/workflows/sync-fork.yml`:

```yaml
name: Sync Fork

on:
  workflow_dispatch:
  schedule:
    - cron: '0 6 * * 1' # Weekly Monday 6am UTC

permissions:
  contents: write

jobs:
  sync:
    runs-on: ubuntu-latest
    if: github.repository != 'londonjs/website'
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          fetch-depth: 0
      - run: |
          git remote add upstream https://github.com/londonjs/website.git
          git fetch upstream main
          git checkout main
          git merge upstream/main --ff-only
          git push origin main
```

**Security note**: `contents: write` is required to push the sync. The guard
`github.repository != 'londonjs/website'` prevents execution on upstream. If
someone creates a fork-of-the-fork, the workflow syncs from the original
upstream, which is benign.

**Acceptance criteria**:

- [ ] Workflow file exists at `.github/workflows/sync-fork.yml`
- [ ] Guard `if: github.repository != 'londonjs/website'` is present
- [ ] Uses `--ff-only` merge (fails cleanly if branches have diverged)
- [ ] All actions pinned to SHA with version comments
- [ ] `permissions: contents: write` is set (and nothing else)

### 3.6 Add OpenSSF Scorecard workflow

**Action**: Create `.github/workflows/scorecard.yml`:

```yaml
name: OpenSSF Scorecard

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1' # Weekly Monday 6am UTC

permissions: read-all

jobs:
  analysis:
    runs-on: ubuntu-latest
    if: github.repository == 'londonjs/website'
    permissions:
      contents: read
      security-events: write
      id-token: write
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: ossf/scorecard-action@ff5dd8929f96a8a4dc67d13f32b8c75057829621 # v2.4.0
        with:
          results_file: results.sarif
          results_format: sarif
      - uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4.6.2
        with:
          name: scorecard-results
          path: results.sarif
      - uses: github/codeql-action/upload-sarif@3b1a19a80ab047f35cbb237b5bd9bdc1e14f166c # v3
        with:
          sarif_file: results.sarif
```

**Acceptance criteria**:

- [ ] Workflow file exists at `.github/workflows/scorecard.yml`
- [ ] Guard `if: github.repository == 'londonjs/website'` is on the job
- [ ] SARIF upload step is present
- [ ] All actions pinned to SHA with version comments

---

## Phase 4: Low — Polish & Best Practices ✅

> **Status: Completed** - All acceptance criteria met.

### 4.1 Add issue templates

**Action**: Create issue templates using GitHub's YAML form schema:

- `.github/ISSUE_TEMPLATE/bug_report.yml` — at least 3 fields (description,
  steps to reproduce, expected behaviour)
- `.github/ISSUE_TEMPLATE/feature_request.yml` — at least 3 fields (problem,
  proposed solution, alternatives considered)
- `.github/ISSUE_TEMPLATE/config.yml` — with a link to the London.js Meetup
  group for non-code questions

**Acceptance criteria**:

- [ ] Both templates render correctly on GitHub's "New Issue" page
- [ ] Both use YAML form schema with at least 3 fields each
- [ ] `config.yml` includes an external link to the Meetup group

### 4.2 Create `CONTRIBUTING.md`

**Action**: Write standalone contributing guidelines covering:

- Development setup (`npm install`, Node.js 22 requirement)
- Pre-commit hooks (auto-installed via `npm install`, gitleaks requirement)
- How to run tests (`npm test`), lint (`npm run lint`), and build (`npm run build`)
- Content contribution guide (adding meetup JSON files to `src/content/meetups/`)
- PR process and code review expectations
- gitleaks installation instructions (macOS, Linux, Windows)

**Acceptance criteria**:

- [ ] `CONTRIBUTING.md` exists at the repository root
- [ ] References `npm install`, `npm test`, `npm run lint`, `npm run build`
- [ ] Documents pre-commit hooks and gitleaks installation
- [ ] Includes content contribution instructions for meetup JSON files

### 4.3 Add SBOM generation

**Action**: Add `anchore/sbom-action` to `ci.yml` to generate an SPDX SBOM.
Add as a step after `npm run build`:

```yaml
- name: Generate SBOM
  uses: anchore/sbom-action@e22c389904149dbc22b58101806040fa8d37a610 # v0.24.0
  with:
    format: spdx-json
    output-file: sbom.spdx.json
- name: Upload SBOM
  uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02 # v4.6.2
  with:
    name: sbom
    path: sbom.spdx.json
```

**Acceptance criteria**:

- [ ] SBOM step exists in `ci.yml` after the build step
- [ ] Actions are pinned to SHA with version comments
- [ ] SBOM artifact is visible in GitHub Actions run artifacts
- [ ] Output file is valid SPDX JSON format

### 4.4 Verify CI caching across all workflows

**Action**: Audit all `.github/workflows/*.yml` files and ensure every workflow
that runs `npm ci` uses `actions/setup-node` with `cache: 'npm'`.

Files to check: `ci.yml`, `deploy.yml` (if it uses npm directly), any future
workflows. The `withastro/action` in `deploy.yml` manages Node internally and
does not need a separate `setup-node` step.

**Acceptance criteria**:

- [ ] All workflows containing `npm ci` use `actions/setup-node` with
      `cache: 'npm'`
- [ ] Verified by running:
      `grep -l 'npm ci' .github/workflows/*.yml | xargs grep 'cache.*npm'`

### 4.5 Register for OpenSSF Best Practices badge

**Action**: Register the project at <https://www.bestpractices.dev/en> and work
toward the passing badge. Add the badge to `README.md`:

```markdown
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/XXXXX/badge)](https://www.bestpractices.dev/projects/XXXXX)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/londonjs/website/badge)](https://scorecard.dev/viewer/?uri=github.com/londonjs/website)
```

**Acceptance criteria**:

- [ ] Project is registered at bestpractices.dev
- [ ] Badge URL in README resolves to a valid bestpractices.dev page
- [ ] Scorecard badge URL is also added to README

---

## Branch Protection (Manual — Requires Admin on Upstream)

These settings must be configured in the upstream repo's Settings > Branches >
`main` by a repository admin. They cannot be set via PR.

- [ ] Require pull request reviews before merging (1 reviewer minimum)
- [ ] Dismiss stale approvals on new commits
- [ ] Require status checks to pass (require `ci` workflow jobs)
- [ ] Require branches to be up to date before merging
- [ ] Do not allow force pushes
- [ ] Do not allow branch deletions
- [ ] Enable GitHub Private Vulnerability Reporting (Settings > Security)

---

## Verification

After all phases are complete, run the OpenSSF Scorecard locally to verify:

```bash
scorecard --repo=github.com/londonjs/website --show-details
```

Expected result: score >= 8.0/10.
