# Brand and design alignment analysis

This document compares the colours, fonts and brand assets used on the
website against the sibling slide deck repository, and proposes how the
website could hold brand tokens so the two stay in sync.

Source repositories checked:

- Website: this repository (Astro 7, Tailwind 4).
- Sibling: the public London.js slide deck repository (read only).

## 1. Inventory

### 1.1 Website colours

| Value     | Where                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#f0db4e` | `src/styles/global.css:20`, `src/layouts/Base.astro:44`, `src/components/common/Card.astro:20`, `src/components/common/Button.astro:16` (two uses on the line), `src/components/layout/Header/MobileMenu.astro:14`, `src/components/layout/Header/MobileMenu.astro:23`, `src/components/layout/Header/Header.astro:40`, `src/components/layout/Header/Navigation.astro:19`, `:23`, `:26`, `:36`, `:45`, `:54` |
| `#333333` | widely used as the ink colour, for example `src/layouts/Base.astro:44`, `src/styles/global.css:20`, `src/components/layout/Header/Header.astro:18`, `src/components/events/EventDetails.astro:25,47,58`                                                                                                                                                                                                       |
| `#666666` | `src/components/events/EventDetails.astro:47` (RSVP button shadow)                                                                                                                                                                                                                                                                                                                                            |
| `#444444` | `src/components/events/EventDetails.astro:47` (RSVP button hover background)                                                                                                                                                                                                                                                                                                                                  |
| `#FFF`    | `src/components/icons/LinkedIn.astro:14` (icon glyph fill, not a text colour)                                                                                                                                                                                                                                                                                                                                 |

### 1.2 Website fonts

- Poppins is loaded via Google Fonts in `src/layouts/Base.astro:38`
  (`weights 400;600;900`) and referenced with a `font-poppins` class on
  `src/layouts/Base.astro:44`.
- `src/components/layout/Header/Header.astro:21` uses a `font-arial`
  class for the "London.js" wordmark text.
- Neither `font-poppins` nor `font-arial` is declared anywhere in an
  `@theme` block or Tailwind config. Confirmed by running `npx astro
build` and checking the generated CSS in `dist/`: there is no
  `.font-poppins` or `.font-arial` rule anywhere in the output, and the
  only match for "Arial" is inside Tailwind's default `--font-sans`
  fallback stack. Both classes are no-ops, so the Poppins font loaded
  via the `<link>` tag is never actually applied to any element, and the
  "London.js" wordmark renders in whatever the browser's default
  sans-serif is, not Arial specifically.

### 1.3 Website logo and brand assets

- `public/logo.avif` exists but is not referenced anywhere under `src/`.
  It appears to be an unused, dead asset.
- The visible "London.js" brand mark in the header is plain styled text
  (see 1.2), not an image or SVG.
- `public/favicon.ico` is the only brand image actually wired up, via
  `src/layouts/Base.astro:34`.

### 1.4 Sibling: tokens.css colours

| Token             | Value                 | Line |
| ----------------- | --------------------- | ---- |
| `--bg`            | `#F2EEE4`             | 11   |
| `--bg-alt`        | `#1B1D1C`             | 12   |
| `--bg-warm`       | `#FFD93D`             | 13   |
| `--ink`           | `#161514`             | 14   |
| `--ink-soft`      | `#3A3631`             | 15   |
| `--ink-mute`      | `#7A726A`             | 16   |
| `--rule`          | `#1615141A`           | 17   |
| `--rule-strong`   | `#16151433`           | 18   |
| `--accent`        | `#FFD93D`             | 19   |
| `--accent-mint`   | `#3DD9A5`             | 20   |
| `--accent-purple` | `#B794FF`             | 21   |
| `--accent-teal`   | `#2DD4BF`             | 22   |
| `--accent-pink`   | `#FF7AC6`             | 23   |
| `--accent-ink`    | `oklch(0.45 0.14 70)` | 24   |
| `--paper`         | `#FFFFFF`             | 25   |

Type axes are built on a variable font, Fraunces, referenced at
`tokens.css:95` and `:113` (`font-family: "Fraunces", Georgia, serif`).

### 1.5 Sibling: slides.jsx `C` colour object and fonts

`C` is defined at `slides.jsx:22-45`:

| Key                | Value       | Also in tokens.css?                                                 |
| ------------------ | ----------- | ------------------------------------------------------------------- |
| `bg`               | `#F2EEE4`   | yes (`--bg`)                                                        |
| `bgAlt`            | `#1B1D1C`   | yes (`--bg-alt`)                                                    |
| `bgWarm`           | `#FFD93D`   | yes (`--bg-warm`)                                                   |
| `ink`              | `#161514`   | yes (`--ink`)                                                       |
| `inkSoft`          | `#3A3631`   | yes (`--ink-soft`)                                                  |
| `inkMute`          | `#7A726A`   | yes (`--ink-mute`)                                                  |
| `rule`             | `#1615141A` | yes (`--rule`)                                                      |
| `ruleStrong`       | `#16151433` | yes (`--rule-strong`)                                               |
| `accent`           | `#FFD93D`   | yes (`--accent`)                                                    |
| `accentMint`       | `#3DD9A5`   | yes (`--accent-mint`)                                               |
| `accentInk`        | `#7C4A00`   | **differs**: tokens.css has `oklch(0.45 0.14 70)` for the same name |
| `paper`            | `#FFFFFF`   | yes (`--paper`)                                                     |
| `aubergine`        | `#481A54`   | **no** (Slack-derived, used for talk panel backgrounds)             |
| `creamOnAubergine` | `#F2EEE4`   | no (duplicate of `bg`, named for its use on the aubergine panel)    |
| `lavender`         | `#F9F0FF`   | **no**                                                              |
| `accentPurple`     | `#B794FF`   | yes (`--accent-purple`)                                             |
| `accentTeal`       | `#2DD4BF`   | yes (`--accent-teal`)                                               |
| `accentPink`       | `#FF7AC6`   | yes (`--accent-pink`)                                               |

As flagged in the Context: `accentInk` is the one value that differs
between the two sibling sources. `tokens.css:24` holds it as
`oklch(0.45 0.14 70)`; `slides.jsx:33` holds it as the hardcoded hex
`#7C4A00`. Section 2 shows the two are close in contrast behaviour
against the sibling's cream background but are not numerically
identical colours.

Fonts used directly in `slides.jsx`: `"Inter Tight", system-ui,
sans-serif` (body and UI text, for example `slides.jsx:53,98,231,236`)
and `"JetBrains Mono", ui-monospace, monospace` (mono labels, for
example `slides.jsx:69,89,269,567`).

### 1.6 Sibling: entry HTML font link

The single `London JS - *.html` file at the sibling repository root
loads fonts at line 8:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

Note this link does not include Fraunces, even though `tokens.css`
declares `font-family: "Fraunces", Georgia, serif"` for title reveals.
That is a sibling-repository observation, out of scope for this
website-focused Story.

### 1.7 Sibling: assets/

The brand mark exists as proper vector assets in the sibling, unlike
the website (see 1.3):

- `icon-dark.svg`, `icon-light.svg`, `icon-alarmalade.svg`: standalone
  mark in three colour treatments.
- `wordmark-colour-dark.svg`, `wordmark-colour-light.svg`,
  `wordmark-mono-dark.svg`, `wordmark-mono-light.svg`: full wordmark in
  colour and mono, each with a light and dark background variant.
- Third-party sponsor and partner marks: `slack-logo-full-colour.svg`,
  `slack-logo-white.svg`, `natwestgroup-logo-white.svg`,
  `planit-logo-white.svg`, `albany-logo-white.svg`,
  `github-lockup-white.svg`, `omnea-logo.png`, plus a QR code asset and
  speaker/organiser photos, none of which are brand marks for London.js
  itself.

## 2. Contrast script output

Generated by `docs/alignment/scripts/contrast.mjs`
(`node docs/alignment/scripts/contrast.mjs`):

```text
website ink on current website yellow (body text, Base.astro:44)
  fg #333333 / bg #F0DB4E - ratio 8.99:1 - AA normal: PASS - AA large: PASS
website ink on proposed sibling yellow (same text, token swapped)
  fg #333333 / bg #FFD93D - ratio 9.17:1 - AA normal: PASS - AA large: PASS
sibling ink on proposed sibling yellow (full token swap)
  fg #161514 / bg #FFD93D - ratio 13.24:1 - AA normal: PASS - AA large: PASS
current website yellow as text on white (nav hover, Navigation.astro)
  fg #F0DB4E / bg #FFFFFF - ratio 1.40:1 - AA normal: FAIL - AA large: FAIL
proposed sibling yellow as text on white (nav hover, token swapped)
  fg #FFD93D / bg #FFFFFF - ratio 1.38:1 - AA normal: FAIL - AA large: FAIL
website ink on white (card and header body text)
  fg #333333 / bg #FFFFFF - ratio 12.63:1 - AA normal: PASS - AA large: PASS
sibling ink on white (same text, token swapped)
  fg #161514 / bg #FFFFFF - ratio 18.24:1 - AA normal: PASS - AA large: PASS
white on website ink (RSVP button, EventDetails.astro:47)
  fg #FFFFFF / bg #333333 - ratio 12.63:1 - AA normal: PASS - AA large: PASS
white on website ink hover shade (RSVP button hover)
  fg #FFFFFF / bg #444444 - ratio 9.74:1 - AA normal: PASS - AA large: PASS
white on sibling ink (RSVP button, token swapped)
  fg #FFFFFF / bg #161514 - ratio 18.24:1 - AA normal: PASS - AA large: PASS
white on sibling ink-soft (RSVP button hover, token swapped)
  fg #FFFFFF / bg #3A3631 - ratio 11.99:1 - AA normal: PASS - AA large: PASS
sibling accent-ink from tokens.css oklch(0.45 0.14 70) converted to #844200, on sibling cream background
  fg #844200 / bg #F2EEE4 - ratio 6.57:1 - AA normal: PASS - AA large: PASS
sibling accent-ink as hardcoded in slides.jsx (#7C4A00), on sibling cream background
  fg #7C4A00 / bg #F2EEE4 - ratio 6.39:1 - AA normal: PASS - AA large: PASS
```

## 3. Mapping table

| Website value                                                                                 | Nearest sibling value and where it lives                                                                                                                | Proposed change                                                                                                                                                         | Contrast ratio(s)                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#f0db4e` (brand yellow, 13 locations, see 1.1)                                               | `#FFD93D` "motorway yellow" (`tokens.css:13,19`, `slides.jsx:25,31`)                                                                                    | Replace the hardcoded hex with a shared yellow token matching the sibling's value.                                                                                      | Ink-on-yellow stays well clear of AA either way: `#333333`/`#F0DB4E` 8.99:1 to `#333333`/`#FFD93D` 9.17:1. The existing yellow-text-on-white nav hover state fails AA now (1.40:1) and keeps failing after the swap (1.38:1): the token change is contrast-neutral here, it does not fix or worsen an existing failure. |
| `#333333` (ink, used throughout, see 1.1)                                                     | `#161514` `--ink` / `C.ink` (`tokens.css:14`, `slides.jsx:26`)                                                                                          | Replace the hardcoded ink hex with a shared ink token matching the sibling's value.                                                                                     | On white: `#333333`/`#FFFFFF` 12.63:1 to `#161514`/`#FFFFFF` 18.24:1. On yellow: `#333333`/`#F0DB4E` 8.99:1 to `#161514`/`#FFD93D` 13.24:1. Both pass AA before and after.                                                                                                                                              |
| `#333333` as a button background, with `#444444` as its hover shade (`EventDetails.astro:47`) | `--ink` `#161514` and `--ink-soft` `#3A3631` (`tokens.css:14-15`, `slides.jsx:26-27`)                                                                   | Map the button's base and hover backgrounds onto `--ink` and `--ink-soft` respectively.                                                                                 | White text stays well clear of AA: `#FFFFFF`/`#333333` 12.63:1 and `#FFFFFF`/`#444444` 9.74:1 today, versus `#FFFFFF`/`#161514` 18.24:1 and `#FFFFFF`/`#3A3631` 11.99:1 after the swap.                                                                                                                                 |
| `#666666` (button shadow colour only, `EventDetails.astro:47`)                                | `--ink-mute` `#7A726A` (`tokens.css:16`)                                                                                                                | Map the shadow colour onto `--ink-mute`. It is a decorative drop-shadow, not text, so no contrast ratio applies.                                                        | n/a                                                                                                                                                                                                                                                                                                                     |
| Poppins, loaded but unused (see 1.2); `font-arial` for the wordmark text                      | `"Inter Tight"` for body and UI text (`slides.jsx:53` and others; entry HTML line 8); `"Fraunces"` for display/heading treatments (`tokens.css:95,113`) | Fix the broken font utilities first (see 4), then adopt Inter Tight for body text and consider Fraunces for large display headings, matching the sibling's type system. | n/a, a font-family change does not alter text contrast.                                                                                                                                                                                                                                                                 |
| `public/logo.avif`, unused; plain text wordmark in the header                                 | `icon-dark.svg` / `icon-light.svg` and `wordmark-colour-dark.svg` / `wordmark-colour-light.svg` (sibling `assets/`)                                     | Adopt the sibling's SVG wordmark and icon as the website's brand mark, replacing the plain text header and the unused `.avif` file.                                     | n/a, this is a graphic asset, not text; WCAG text contrast does not apply.                                                                                                                                                                                                                                              |

Note: `--accent-ink` is not represented in the mapping table above
because the website does not currently use this colour at all. It is
recorded in 1.5 and measured in section 2 purely to satisfy the "record
both" instruction for the one value that differs between `tokens.css`
and `slides.jsx`; there is no website value to map it from.

## 4. Proposed token holding (fenced, no source files changed)

```css
@theme {
  /* Core palette, named to mirror the sibling's tokens.css custom
     properties so values and names can be kept in sync. */
  --color-brand-yellow: #ffd93d;
  --color-brand-ink: #161514;
  --color-brand-ink-soft: #3a3631;
  --color-brand-ink-mute: #7a726a;
  --color-brand-paper: #ffffff;

  /* Fonts, once the broken font-poppins/font-arial utilities are fixed
     (see the QUICK WIN below). */
  --font-brand-sans: 'Inter Tight', system-ui, sans-serif;
  --font-brand-display: 'Fraunces', Georgia, serif;
}
```

With this in place, the current `bg-[#f0db4e]`, `text-[#333333]` and
similar bracketed-hex utilities across the components listed in 1.1
would become `bg-brand-yellow`, `text-brand-ink`, and so on, generated
automatically by Tailwind 4 from the `@theme` variables above. No
layout or spacing utility needs to change for this.

## 5. Recommendations

1. Replace `#f0db4e` with the `--color-brand-yellow` token (`#FFD93D`)
   across the 13 locations in 1.1. **QUICK WIN**: single find-and-replace
   plus the `@theme` addition, no layout change, contrast stays within
   the same AA pass/fail outcome as today (see section 3).
2. Replace `#333333` with the `--color-brand-ink` token (`#161514`)
   across its locations in 1.1. **QUICK WIN**: same shape of change as
   (1), contrast improves and stays AA pass on every pair measured.
3. Replace the `#444444` hover shade and `#666666` shadow colour on the
   RSVP button with `--color-brand-ink-soft` and `--color-brand-ink-mute`.
   **QUICK WIN**: one component file, contrast stays AA pass.
4. Fix the dead `font-poppins` and `font-arial` utility classes, then
   point body text at `--font-brand-sans` ("Inter Tight") to match the
   sibling. **FOLLOW-ON**: touches the `@theme` font tokens and the
   `font-poppins`/`font-arial` usages together with a visual check,
   more than a one-line swap, and worth confirming the chosen typeface
   renders acceptably at the site's existing type scale before merging.
5. Adopt the sibling's SVG icon and wordmark assets in place of the
   unused `public/logo.avif` and the plain text "London.js" wordmark in
   the header. **FOLLOW-ON**: needs a decision on which wordmark
   variant suits the yellow background, and a visual/layout check in
   the header component, so it is not a same-day swap.
6. Fix the yellow-text-on-white nav hover state (1.40:1 today, still
   1.38:1 with the proposed yellow), which fails AA for both normal and
   large text regardless of which yellow is chosen. **FOLLOW-ON**: this
   needs a different hover treatment (for example a darker ink hover
   colour instead of yellow-on-white), not a token rename, so it is
   tracked separately from items 1 to 3.
7. Resolve the sibling repository's own `--accent-ink` mismatch between
   `tokens.css` (`oklch(0.45 0.14 70)`) and `slides.jsx` (`#7C4A00`).
   **FOLLOW-ON**: this is sibling-repository housekeeping, out of scope
   for a website pull request, and is recorded here only because the
   Story asked for the discrepancy to be captured.
