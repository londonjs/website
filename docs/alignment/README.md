# Website alignment report

This consolidates three alignment analyses comparing this repository with
the sibling slide deck repository: governance and agent files
(`docs/alignment/governance.md`), brand and design (`docs/alignment/brand.md`
and `docs/alignment/scripts/contrast.mjs`), and shared event data
(`docs/alignment/event-data.md`). Each source report tags its own
recommendations QUICK WIN or FOLLOW-ON; this document carries those tags
across unchanged. Live event drift is reproduced first below, since it
affects the event on 23 November 2026. Seven quick wins follow, then eight
follow-on outlines, then one conflict found between the three reports.

## Live event drift

The event data report records drift between the website's event data and
the slides repository for the event on 23 November 2026: the Talk 1 and
Talk 2 role strings bundle job title and employer on the website but not in
the slides repository; Talk 4's two named co-speakers cannot be held in the
website's single `speaker` object; the schema has no field for doors time,
per-talk agenda times, or floor number; and the second organiser's employer
reads "Albany Growth" on the website against "Albany" in the slides
repository. (Source: `docs/alignment/event-data.md`, Live event drift (23
Nov 2026).)

## Quick wins

1. **Add AGENTS.md pointing community content at the content-creator
   subagent.**
   Files: `AGENTS.md` (new).
   Change: add a website-specific `AGENTS.md` that binds community content
   production to the `london-js-content-creator` subagent and lists this
   repository's own pre-commit checks.
   Risk: low; a new file with no code change, but the binding rule changes
   how future content edits are made.
   Verify: the file exists at `AGENTS.md` and `npm run lint:md` passes.
   Source: `docs/alignment/governance.md`, Proposals, "1. AGENTS.md (adapt).
   QUICK WIN".

2. **Add CLAUDE.md pointer to AGENTS.md.**
   Files: `CLAUDE.md` (new).
   Change: add a one-line `CLAUDE.md` that directs agents to read
   `AGENTS.md`.
   Risk: low; no code change.
   Verify: the file exists at `CLAUDE.md` and `npm run lint:md` passes.
   Source: `docs/alignment/governance.md`, Proposals, "2. CLAUDE.md (port).
   QUICK WIN".

3. **Port the content-creator subagent under its registered filename.**
   Files: `agents/london-js-content-creator.md` (new).
   Change: port the sibling subagent definition unchanged except for the
   filename, so it resolves under its registered name,
   `london-js-content-creator`.
   Risk: low; no code change, but the AGENTS.md binding rule in quick win 1
   depends on this file existing under the correct name.
   Verify: the file exists at `agents/london-js-content-creator.md` with
   frontmatter `name: london-js-content-creator`.
   Source: `docs/alignment/governance.md`, Proposals, "3.
   agents/london-js-content-creator.md (port under corrected filename).
   QUICK WIN".

4. **Replace the hardcoded brand yellow with a shared token.**
   Files: `src/styles/global.css`, `src/layouts/Base.astro`,
   `src/components/common/Card.astro`, `src/components/common/Button.astro`,
   `src/components/layout/Header/MobileMenu.astro`,
   `src/components/layout/Header/Header.astro`,
   `src/components/layout/Header/Navigation.astro`.
   Change: add a `--color-brand-yellow` theme token (`#FFD93D`) and replace
   the 13 hardcoded `#f0db4e` locations with it.
   Risk: low; contrast stays within the same AA pass/fail outcome as today
   on every measured pair.
   Verify: run `docs/alignment/scripts/contrast.mjs` and confirm the
   ink-on-yellow pairs stay AA pass.
   Source: `docs/alignment/brand.md`, section 5, Recommendations, item 1
   (see also section 3, Mapping table, and section 2, Contrast script
   output).

5. **Replace the hardcoded ink colour with a shared token.**
   Files: `src/layouts/Base.astro`, `src/styles/global.css`,
   `src/components/layout/Header/Header.astro`,
   `src/components/events/EventDetails.astro`.
   Change: add a `--color-brand-ink` theme token (`#161514`) and replace the
   `#333333` locations with it.
   Risk: low; contrast improves and stays AA pass on every pair measured.
   Verify: run `docs/alignment/scripts/contrast.mjs` and confirm the ink
   pairs stay AA pass.
   Source: `docs/alignment/brand.md`, section 5, Recommendations, item 2.

6. **Map the RSVP button hover and shadow colours onto ink-soft and
   ink-mute tokens.**
   Files: `src/components/events/EventDetails.astro`.
   Change: replace the `#444444` hover shade with `--color-brand-ink-soft`
   and the `#666666` shadow colour with `--color-brand-ink-mute`.
   Risk: low; one component file, contrast stays AA pass.
   Verify: run `docs/alignment/scripts/contrast.mjs` and confirm the
   white-on-ink-soft pair stays AA pass; check the RSVP button hover state.
   Source: `docs/alignment/brand.md`, section 5, Recommendations, item 3.

7. **Fix the Talk 1/2 role strings and the Albany employer mismatch.**
   Files: `src/content/meetups/meetup-nov-26.json`.
   Change: split the bundled "title at employer" role strings for Talk 1
   and Talk 2, and correct "Albany Growth" to match the "Albany" employer
   name used elsewhere.
   Risk: low; data-only edit to one JSON file, no schema or code change.
   Verify: validate the file against the `src/content.config.ts` schema
   (`npx astro check`) and compare the corrected fields against the slides
   repository sources cited in the drift table.
   Source: `docs/alignment/event-data.md`, Recommendations summary (see
   also Live event drift (23 Nov 2026), rows "Talk 1 role", "Talk 2 role",
   "Organiser 2 employer").

## Follow-on work

- **Outcome:** fix the dead `font-poppins` and `font-arial` utility
  classes, then point body text at an Inter Tight token to match the
  sibling.
  Files: theme/token configuration, `src/layouts/Base.astro`,
  `src/components/layout/Header/Header.astro`.
  Acceptance criteria: `font-poppins` and `font-arial` either resolve to a
  real declared utility or are removed; body text renders in Inter Tight
  (or an agreed fallback); a visual check confirms the chosen typeface
  renders acceptably at the existing type scale.
  Source: `docs/alignment/brand.md`, section 5, Recommendations, item 4.

- **Outcome:** adopt the sibling's SVG wordmark and icon as the website's
  brand mark, replacing the plain text header and the unused `.avif` file.
  Files: `public/` (new SVG assets), the header component, removal of
  `public/logo.avif`.
  Acceptance criteria: a decision is made on which wordmark and icon
  variant suits the yellow background; the header renders the chosen SVG
  in place of the plain text wordmark; the unused `logo.avif` is removed; a
  visual and layout check confirms no regression.
  Source: `docs/alignment/brand.md`, section 5, Recommendations, item 5.

- **Outcome:** fix the yellow-text-on-white nav hover state, which fails
  AA contrast today and after the proposed yellow token swap alike.
  Files: `src/components/layout/Header/Navigation.astro`.
  Acceptance criteria: the nav hover treatment passes AA normal and AA
  large text contrast against its background; a run of
  `docs/alignment/scripts/contrast.mjs` (or an updated version of it)
  confirms the pass.
  Source: `docs/alignment/brand.md`, section 5, Recommendations, item 6.

- **Outcome:** resolve the sibling repository's own `--accent-ink`
  mismatch between `tokens.css` and `slides.jsx`.
  Files: sibling repository only (`tokens.css` and/or `slides.jsx`); out of
  scope for this repository's pull requests.
  Acceptance criteria: `tokens.css` and `slides.jsx` hold the same value for
  `--accent-ink` / `accentInk`.
  Source: `docs/alignment/brand.md`, section 5, Recommendations, item 7.

- **Outcome:** adopt the website JSON as the single source of truth for
  every fact both repositories need.
  Files: `src/content/meetups/*.json`.
  Acceptance criteria: title, date, start and end time, venue, speakers,
  roles, talk titles, sponsors and organisers are maintained only in the
  website JSON; the slides repository stops hand-duplicating these facts.
  Source: `docs/alignment/event-data.md`, Recommendation.

- **Outcome:** add a sync script to the slides repository that diffs the
  content pack against the website JSON.
  Files: sibling repository only (new script); out of scope for this
  repository's pull requests.
  Acceptance criteria: running the script against the current event's
  website JSON prints a diff against the content pack's Title, Lineup,
  Agenda, Host and Welcome sections; it is run manually when a content pack
  is being written, not on every `slides.jsx` edit.
  Source: `docs/alignment/event-data.md`, Recommendation (sync mechanism).

- **Outcome:** add a CI validation check for bundled title-and-employer
  role strings.
  Files: an ESLint rule or a small Node script wired into the existing
  `lint` npm script.
  Acceptance criteria: the check fails if any `talks[].speaker.role` or
  `organizers[].role` string contains "at" or another separator pattern
  that signals a bundled title-and-employer string; it runs as part of the
  existing lint step.
  Source: `docs/alignment/event-data.md`, Recommendation (validation
  check).

- **Outcome:** extend the `meetups` schema to support co-speakers, a doors
  time, and per-talk agenda slots.
  Files: `src/content.config.ts`, `src/content/meetups/*.json`.
  Acceptance criteria: `talks[].speaker` accepts more than one named
  speaker with an individual role each; a doors-time field and per-talk
  agenda time fields exist on the schema; existing meetup JSON files
  validate against the extended schema.
  Source: `docs/alignment/event-data.md`, Recommendations summary (see
  also Field map, rows "talks[].speaker.name" and "talks[].speaker.role",
  and Live event drift (23 Nov 2026), rows "Talk 4 speaker(s)", "Doors
  time", "Per-talk agenda times").

## Conflicts between the reports

1. **Content-authorship rule against a direct data fix.** The governance
   report's proposed `AGENTS.md` binds "meetup listing content in
   `src/content/meetups/*.json`" to the `london-js-content-creator`
   subagent (`docs/alignment/governance.md`, Proposals, "1. AGENTS.md
   (adapt). QUICK WIN"). The event data report's quick win is a direct edit
   to that same file, `src/content/meetups/meetup-nov-26.json`, correcting
   role strings and an employer name (`docs/alignment/event-data.md`,
   Recommendations summary). Once `AGENTS.md` lands, this direct edit would
   need to go through the subagent to comply with the binding rule, and
   neither report flags the overlap. Proposed resolution: land the
   `AGENTS.md` quick win first, then carry out the meetup JSON quick win by
   invoking the subagent; or add an explicit carve-out in `AGENTS.md`'s
   binding rule for factual data corrections, as distinct from editorial
   content.

2. **Differing check lists (minor).** The governance report's draft
   `AGENTS.md` lists seven pre-commit checks: `npm run format:check`,
   `npm run lint`, `npm run lint:md`, `npm test`, `npx astro check`,
   `npm audit --audit-level=high`, and `npm run build`
   (`docs/alignment/governance.md`, Proposals, "1. AGENTS.md (adapt). QUICK
   WIN"). This report's own format-and-lint step runs only three of them.
   This is not a defect in either report, but landing the governance quick
   win asks contributors for a wider check list than this report's own
   steps used. Proposed resolution: no action needed on this report; flag
   to whoever lands the `AGENTS.md` quick win that the wider check list is
   new scope, not a restatement of existing practice.
