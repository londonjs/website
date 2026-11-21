# Governance and agent files alignment analysis

This report compares the governance and agent-instruction artefacts present in
this repository against the sibling `london-js-slides` repository, and
recommends whether each sibling artefact should be ported, adapted, or
skipped.

## Artefact table

| File                                                           | In website | In slides | Purpose                                                       | Recommendation                                                                |
| -------------------------------------------------------------- | ---------- | --------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `AGENTS.md`                                                    | N          | Y         | Binds all London.js community content to a named subagent     | Adapt. QUICK WIN                                                              |
| `CLAUDE.md`                                                    | N          | Y         | One-line pointer directing AI agents to `AGENTS.md`           | Port. QUICK WIN                                                               |
| `agents/londonjs-content-creator.md`                           | N          | Y         | Canonical subagent definition for London.js community content | Port (under corrected filename). QUICK WIN                                    |
| `CONTRIBUTING.md`                                              | Y          | Y         | Contributor setup and PR process guide                        | Skip. Already adequate and project-specific in this repository                |
| `CHANGELOG.md`                                                 | Y          | Y         | Release history                                               | Skip. Already maintained independently in each repository                     |
| `SECURITY.md`                                                  | Y          | N         | Security policy                                               | Skip. Website-specific; out of scope to port in the other direction           |
| `SECURITY_ROADMAP.md`                                          | Y          | N         | Planned security hardening roadmap                            | Skip. Website-specific; out of scope to port in the other direction           |
| `.github/CODEOWNERS`                                           | Y          | N         | Review ownership routing                                      | Skip. Repository administration, not an agent or content governance artefact  |
| `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/*` | Y          | N         | Contribution templates                                        | Skip. Repository administration, not an agent or content governance artefact  |
| `docs/ADAPT-FOR-NEW-EVENT.md`                                  | N          | Y         | Procedure for re-pointing the slide deck at a new event       | Skip. Specific to the slide-deck mechanism; this repository has no slide deck |
| `docs/SLIDE_ORDER_MECHANISM.md`                                | N          | Y         | Procedure governing slide play order                          | Skip. Specific to the slide-deck mechanism; this repository has no slide deck |

## Name mismatch

The sibling subagent file is `agents/londonjs-content-creator.md`, but its
own frontmatter registers `name: london-js-content-creator` (with a hyphen
between "london" and "js"). The sibling `AGENTS.md` refers to the subagent
as `londonjs-content-creator`, which does not match the registered name. Any
reference to this subagent from this repository must use the registered
name, `london-js-content-creator`, or the reference will not resolve. The
proposals below use the registered name throughout and also correct the
filename on port so the mismatch is not carried over.

## Proposals

### 1. `AGENTS.md` (adapt). QUICK WIN

Smallest website-specific version, binding community content to the
subagent by its registered name and listing this repository's own checks:

```markdown
# Website repository, agent instructions

## Content production

All London.js community content produced for or about this repository MUST
be authored by the `london-js-content-creator` subagent, canonically
defined in the sibling `london-js-slides` repository at
`agents/london-js-content-creator.md`. Install it to your Claude Code
agents directory to activate it for a session. This includes
(non-exhaustive): website copy, meetup listing content in
`src/content/meetups/*.json`, speaker bios, and social posts.

Binding rule: any change to repository content covered by the categories
above is produced by invoking the subagent. The subagent is the single
source of style, persona, and tone.

For content categories not listed above (code, configuration, build
instructions), the subagent need not be invoked; the agent author exercises
judgement.

## Checks

Before committing, run:

- `npm run format:check`
- `npm run lint`
- `npm run lint:md`
- `npm test`
- `npx astro check`
- `npm audit --audit-level=high`
- `npm run build`

## See also

- `CONTRIBUTING.md`, development setup and PR process.
- `london-js-slides` repository, `agents/london-js-content-creator.md`, the
  binding content-production subagent.
```

### 2. `CLAUDE.md` (port). QUICK WIN

The sibling version is already a minimal, repository-agnostic pointer and
needs no website-specific change:

```markdown
# CLAUDE.md

This project's agent instructions have moved to [AGENTS.md](./AGENTS.md).
All AI agents working on this repository should read AGENTS.md for binding
rules and content guidelines.
```

### 3. `agents/london-js-content-creator.md` (port under corrected filename). QUICK WIN

The subagent definition is already written to be generic to London.js
community content, not specific to the slide deck, so no rewrite is needed.
The smallest change is to port the file unchanged except for its filename,
so the name in this repository's `AGENTS.md` resolves correctly:

```yaml
---
name: london-js-content-creator
description: >
  Community content creator for London.js. Use when creating or editing event
  listings for Meetup.com, slide decks, website copy, speaker bios, or any
  community-facing content for London.js events. Proactively invoked for all
  London.js written content tasks. Enforces inclusive, DE&I-aligned language
  and reflects the London.js Code of Conduct in every output.
tools: Read, Write, Edit, Glob, Grep
model: inherit
---
```

Body unchanged from the sibling repository's
`agents/londonjs-content-creator.md` (everything after the frontmatter);
none of that content is slide-deck specific.
