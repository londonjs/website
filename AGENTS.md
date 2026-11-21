# Website repository, agent instructions

## Content production

All London.js community content produced for or about this repository MUST
be authored by the `london-js-content-creator` subagent, canonically
defined in the sibling `london-js-slides` repository at
`agents/londonjs-content-creator.md`. Install it to your Claude Code
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
- `london-js-slides` repository, `agents/londonjs-content-creator.md`, the
  binding content-production subagent.
