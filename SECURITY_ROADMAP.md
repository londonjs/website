# Security & CI/CD Roadmap

This document is an actionable roadmap for hardening this repository against
supply chain attacks and aligning it with OpenSSF Scorecard, SLSA v1.0, and
Linux Foundation open source best practices.

Each phase is a discrete unit of work. Phases MUST be completed in order.
Each task includes acceptance criteria that MUST all pass before moving on.

**Target**: Improve estimated OpenSSF Scorecard from ~3.5/10 to ~8.5/10.

---

## Baseline Context

- **Repo**: `londonjs/website` (fork: `mcleo-d/website`)
- **Stack**: Astro 5, React 19, Tailwind CSS v4, TypeScript, Node.js, npm
- **Test runner**: Vitest (jsdom) with `npm test`
- **Build command**: `npm run build` (runs `astro build`)
- **Type checker**: `npx astro check`
- **Deploy target**: GitHub Pages at `london.js.org`
- **Existing CI**: Single `deploy.yml` workflow
- **Pre-commit hooks**: None configured
- **Linting/formatting**: None configured

---

## Phase 1: Critical — Supply Chain & Secret Detection

### 1.1 Pin all GitHub Actions to full SHA hashes

**Why**: OpenSSF Scorecard `Pinned-Dependencies` check. Mutable tags can be
redirected by a compromised action repository.

**Action**: In every workflow file, replace tag references with pinned SHAs.

Reference SHA pins (verified 2026-03-27):

```text
actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683           # v4.2.2
actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020         # v4.4.0
actions/upload-pages-artifact@56afc609e74202658d3ffba0e8f6dda462b719fa # v3.0.1
actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02     # v4.6.2
actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e       # v4.0.5
withastro/action@56781b97402ce0487b7e61ce2cb960c0e2cc5289           # v3.0.2
github/codeql-action@3b1a19a80ab047f35cbb237b5bd9bdc1e14f166c       # v3
gitleaks/gitleaks-action@dcedce43c6f43de0b836d1fe38946645c9c638dc   # v2
ossf/scorecard-action@ff5dd8929f96a8a4dc67d13f32b8c75057829621      # v2.4.0
```

**Acceptance criteria**:
- [ ] No workflow file contains an `@v` tag reference for any action
- [ ] Every `uses:` line has a 40-character SHA followed by a `# vX.Y.Z` comment

### 1.2 Create `ci.yml` — build and test on every PR

**Why**: OpenSSF Scorecard `CI-Tests` check. PRs currently have no quality gate.

**Action**: Create `.github/workflows/ci.yml` with the following behaviour:

- Trigger on `pull_request` to `main` and `push` to `main`
- Top-level `permissions: contents: read`
- Steps:
  1. `actions/checkout` (pinned)
  2. `actions/setup-node` (pinned, node 22, cache npm)
  3. `npm ci`
  4. `npm test`
  5. `npx astro check`
  6. `npm run build`

**Acceptance criteria**:
- [ ] Workflow file exists at `.github/workflows/ci.yml`
- [ ] All actions pinned to SHA
- [ ] `permissions` block grants only `contents: read`
- [ ] Uses `npm ci` (not `npm install`)
- [ ] Runs tests, type check, and build in that order

### 1.3 Harden `deploy.yml`

**Why**: OpenSSF Scorecard `Token-Permissions` and `Dangerous-Workflow` checks.
The current workflow has overly broad permissions and no fork guard.

**Action**: Rewrite `.github/workflows/deploy.yml`:

- Add `if: github.repository == 'londonjs/website'` to the `deploy` job
- Move `pages: write` and `id-token: write` from top-level to the `deploy` job only
- Set top-level `permissions: contents: read`
- Add concurrency control: `concurrency: { group: pages-deploy, cancel-in-progress: false }`
- Reduce `schedule` cron from hourly to daily (`0 6 * * *`)
- Pin all actions to SHA

**Acceptance criteria**:
- [ ] `deploy` job has `if: github.repository == 'londonjs/website'`
- [ ] Top-level permissions are `contents: read` only
- [ ] `pages: write` and `id-token: write` scoped to `deploy` job
- [ ] Concurrency group is set
- [ ] Cron schedule is daily or less frequent
- [ ] All actions pinned to SHA

### 1.4 Install pre-commit hooks (husky + lint-staged + gitleaks)

**Why**: OpenSSF Best Practices. Secrets committed to git history are permanent.
Pre-commit prevention is cheaper than remediation.

**Action**:

1. Install dev dependencies: `husky`, `lint-staged`
2. Add `"prepare": "husky"` to `package.json` scripts
3. Create `.husky/pre-commit` containing `npx lint-staged`
4. Add `lint-staged` config to `package.json`:
   ```json
   {
     "lint-staged": {
       "*": ["gitleaks protect --staged --no-banner"]
     }
   }
   ```
5. Document that contributors must install `gitleaks` locally
   (`brew install gitleaks` or download from GitHub releases)

**Note**: Linting and formatting hooks are added in Phase 2 after those tools
are configured. Do NOT add lint/format steps to `lint-staged` in this phase.

**Acceptance criteria**:
- [ ] `husky` and `lint-staged` are in `devDependencies`
- [ ] `package.json` has a `prepare` script that runs `husky`
- [ ] `.husky/pre-commit` exists and runs `npx lint-staged`
- [ ] `lint-staged` config runs gitleaks on all staged files
- [ ] Running `npm install` activates the hooks (test by committing a dummy secret)

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
    - uses: gitleaks/gitleaks-action@dcedce43c6f43de0b836d1fe38946645c9c638dc # v2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Acceptance criteria**:
- [ ] `secret-scan` job exists in `ci.yml`
- [ ] Job uses `fetch-depth: 0` for full history scan
- [ ] Action is pinned to SHA
- [ ] Job permissions are `contents: read` only

### 1.6 Create `SECURITY.md`

**Why**: OpenSSF Scorecard `Security-Policy` check. Vulnerability reporters need
a safe disclosure channel.

**Action**: Create `SECURITY.md` in the repository root with:

- Instructions to NOT open a public issue for security vulnerabilities
- Contact method (maintainer email or GitHub Private Vulnerability Reporting)
- Expected response timeline (acknowledge within 48h, assess within 7 days)
- Scope statement (this repository and london.js.org)
- Supported versions (latest on main only)

**Acceptance criteria**:
- [ ] `SECURITY.md` exists at the repository root
- [ ] Contains a private disclosure channel (not just "open an issue")
- [ ] Contains response timeline commitments

---

## Phase 2: High — Code Quality & Vulnerability Scanning

### 2.1 Add ESLint

**Action**:

1. Install: `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-astro`
2. Create `eslint.config.js` extending recommended configs
3. Add `"lint": "eslint ."` to `package.json` scripts
4. Add `npm run lint` step to `ci.yml` (after `npm ci`, before `npm test`)
5. Update `lint-staged` config to include:
   ```json
   "*.{js,jsx,ts,tsx,astro}": ["eslint --fix --max-warnings 0"]
   ```

**Acceptance criteria**:
- [ ] ESLint config file exists
- [ ] `npm run lint` passes with zero warnings
- [ ] CI runs lint before tests
- [ ] Pre-commit hook lints staged JS/TS/Astro files

### 2.2 Add Prettier

**Action**:

1. Install: `prettier`, `prettier-plugin-astro`
2. Create `.prettierrc` with project conventions
3. Create `.prettierignore` (dist, node_modules, package-lock.json)
4. Add `"format:check": "prettier --check ."` to `package.json` scripts
5. Add format check step to `ci.yml`
6. Update `lint-staged` config to include:
   ```json
   "*.{js,jsx,ts,tsx,astro,css,json,md}": ["prettier --write"]
   ```

**Acceptance criteria**:
- [ ] Prettier config file exists
- [ ] `npm run format:check` passes
- [ ] CI runs format check
- [ ] Pre-commit hook auto-formats staged files

### 2.3 Add markdownlint

**Action**:

1. Install: `markdownlint-cli2`
2. Create `.markdownlint-cli2.jsonc`:
   ```json
   {
     "config": {
       "default": true,
       "MD013": false,
       "MD033": false
     },
     "globs": ["**/*.md"],
     "ignores": ["node_modules", "dist"]
   }
   ```
3. Add `"lint:md": "markdownlint-cli2"` to `package.json` scripts
4. Add markdown lint step to `ci.yml`
5. Update `lint-staged` config to include:
   ```json
   "*.md": ["markdownlint-cli2"]
   ```

**Acceptance criteria**:
- [ ] markdownlint config file exists
- [ ] `npm run lint:md` passes
- [ ] CI runs markdown lint
- [ ] Pre-commit hook lints staged markdown files

### 2.4 Add CodeQL SAST scanning

**Why**: OpenSSF Scorecard `SAST` check.

**Action**: Create `.github/workflows/codeql.yml`:

- Trigger on push to `main`, PRs to `main`, and weekly schedule
- Permissions: `contents: read`, `security-events: write`
- Language matrix: `javascript-typescript`
- Pin all actions to SHA

**Acceptance criteria**:
- [ ] Workflow file exists at `.github/workflows/codeql.yml`
- [ ] All actions pinned to SHA
- [ ] Permissions are scoped to `contents: read` and `security-events: write`
- [ ] Schedule is weekly

### 2.5 Add dependency vulnerability scanning

**Action**: Add an `audit` step to `ci.yml` after `npm ci`:

```yaml
- run: npm audit --audit-level=high
```

**Acceptance criteria**:
- [ ] `npm audit` step exists in `ci.yml`
- [ ] Audit level is `high` (fails on high and critical vulnerabilities)
- [ ] Step runs after `npm ci`

### 2.6 Add `dependabot.yml`

**Action**: Create `.github/dependabot.yml` covering both ecosystems:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
    groups:
      production-deps:
        dependency-type: "production"
      dev-deps:
        dependency-type: "development"
        update-types: ["minor", "patch"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    labels:
      - "ci"
```

**Acceptance criteria**:
- [ ] File exists at `.github/dependabot.yml`
- [ ] Covers both `npm` and `github-actions` ecosystems
- [ ] Groups are configured to reduce PR noise

---

## Phase 3: Medium — Repository Hygiene & Hardening

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

Remove existing `.env` and `.env.production` lines (covered by the glob).

**Acceptance criteria**:
- [ ] `.gitignore` covers all env file variants, key material, and `.npmrc`
- [ ] No duplicate entries

### 3.2 Remove `.cache/` from git tracking

**Action**:

1. Add `.cache/` to `.gitignore`
2. Run `git rm -r --cached .cache/`

**Acceptance criteria**:
- [ ] `.cache/` is in `.gitignore`
- [ ] `.cache/` is no longer tracked by git
- [ ] Build still succeeds (cache is regenerated at build time)

### 3.3 Add CODEOWNERS

**Action**: Create `.github/CODEOWNERS`:

```text
* @mcleo-d

.github/ @mcleo-d
astro.config.mjs @mcleo-d
package.json @mcleo-d
tsconfig.json @mcleo-d
```

**Acceptance criteria**:
- [ ] File exists at `.github/CODEOWNERS`
- [ ] Workflow and config files require maintainer review

### 3.4 Add PR template

**Action**: Create `.github/pull_request_template.md` with sections for:
description, type of change (checkboxes), and contributor checklist.

**Acceptance criteria**:
- [ ] File exists at `.github/pull_request_template.md`
- [ ] Includes a checklist with "tested locally" and "follows code style" items

### 3.5 Create `sync-fork.yml`

**Why**: Keeps forks in sync with upstream without manual intervention.

**Action**: Create `.github/workflows/sync-fork.yml`:

- Trigger on `workflow_dispatch` and weekly schedule (Monday 6am UTC)
- Guard with `if: github.repository != 'londonjs/website'`
- Permissions: `contents: write`
- Steps: checkout with `fetch-depth: 0`, add upstream remote, fetch, fast-forward merge, push
- Pin all actions to SHA

**Acceptance criteria**:
- [ ] Workflow file exists at `.github/workflows/sync-fork.yml`
- [ ] Guard prevents execution on upstream repo
- [ ] Uses `--ff-only` merge (fails if diverged rather than creating merge commits)
- [ ] All actions pinned to SHA

### 3.6 Add OpenSSF Scorecard workflow

**Action**: Create `.github/workflows/scorecard.yml`:

- Trigger on push to `main` and weekly schedule
- Guard with `if: github.repository == 'londonjs/website'` (Scorecard only meaningful on upstream)
- Permissions: `contents: read`, `security-events: write`, `id-token: write`
- Upload SARIF results to GitHub Security tab
- Pin all actions to SHA

**Acceptance criteria**:
- [ ] Workflow file exists at `.github/workflows/scorecard.yml`
- [ ] Guard prevents execution on forks
- [ ] SARIF upload step is present
- [ ] All actions pinned to SHA

---

## Phase 4: Low — Polish & Best Practices

### 4.1 Add issue templates

**Action**: Create `.github/ISSUE_TEMPLATE/bug_report.yml` and
`.github/ISSUE_TEMPLATE/feature_request.yml` using GitHub's YAML form schema.

### 4.2 Create `CONTRIBUTING.md`

**Action**: Write standalone contributing guidelines covering: dev setup,
pre-commit hooks, testing, content contribution (adding meetups), and PR process.

### 4.3 Add SBOM generation

**Action**: Add `anchore/sbom-action` (pinned to SHA) to `ci.yml` to generate
an SPDX SBOM on each build. Upload as a build artifact.

### 4.4 Add CI caching

**Action**: Ensure `actions/setup-node` is configured with `cache: 'npm'` in
all workflows that run `npm ci`.

### 4.5 Register for OpenSSF Best Practices badge

**Action**: Register the project at https://www.bestpractices.dev/en and add
the badge to `README.md`.

---

## Final Lint-Staged Configuration

After all phases are complete, the `lint-staged` block in `package.json` should
be:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,astro}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.md": [
      "markdownlint-cli2",
      "prettier --write"
    ],
    "*.{css,json}": [
      "prettier --write"
    ],
    "*": [
      "gitleaks protect --staged --no-banner"
    ]
  }
}
```

---

## Branch Protection (Manual — Requires Admin)

These settings must be configured in GitHub repo Settings > Branches > `main`:

- [x] Require pull request reviews before merging (1 reviewer minimum)
- [x] Dismiss stale approvals on new commits
- [x] Require status checks to pass (require `ci` workflow)
- [x] Require branches to be up to date before merging
- [x] Do not allow force pushes
- [x] Do not allow branch deletions
- [x] Enable GitHub Private Vulnerability Reporting

---

## Verification

After all phases are complete, run the OpenSSF Scorecard locally to verify:

```bash
scorecard --repo=github.com/londonjs/website --show-details
```

Expected result: score >= 8.0/10.
