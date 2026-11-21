/* global console */

// WCAG 2.1 contrast checker for the brand and design alignment analysis.
// Dependency-free: no imports, no Node globals beyond console.
//
// One sibling value (tokens.css --accent-ink) is defined in oklch rather
// than hex. It is converted to hex below using the standard OKLab/sRGB
// matrices (Bjorn Ottosson's oklab reference transform) so it can be
// compared on the same numeric basis as every other pair in this file.

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function srgbChannelToLinear(c) {
  const normalised = c / 255;
  return normalised <= 0.03928 ? normalised / 12.92 : Math.pow((normalised + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }) {
  const rl = srgbChannelToLinear(r);
  const gl = srgbChannelToLinear(g);
  const bl = srgbChannelToLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(hexA, hexB) {
  const lumA = relativeLuminance(hexToRgb(hexA));
  const lumB = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function linearToSrgbChannel(c) {
  const clamped = Math.min(Math.max(c, 0), 1);
  const encoded =
    clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  return Math.round(Math.min(Math.max(encoded, 0), 1) * 255);
}

function toHexByte(n) {
  return n.toString(16).padStart(2, '0');
}

// Converts an OKLCH triple (L 0-1, C, H in degrees) to a "#rrggbb" hex
// string via OKLab then linear sRGB, so a CSS oklch() value can sit in
// the same pair list as every hex value below.
function oklchToHex(l, c, hDegrees) {
  const hRadians = (hDegrees * Math.PI) / 180;
  const a = c * Math.cos(hRadians);
  const b = c * Math.sin(hRadians);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lCubed = l_ ** 3;
  const mCubed = m_ ** 3;
  const sCubed = s_ ** 3;

  const rLin = 4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed;
  const gLin = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed;
  const bLin = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed;

  const r = linearToSrgbChannel(rLin);
  const g = linearToSrgbChannel(gLin);
  const bl = linearToSrgbChannel(bLin);

  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(bl)}`.toUpperCase();
}

const siblingAccentInkHex = oklchToHex(0.45, 0.14, 70);

// Each pair: a text-on-background combination from either the current
// website, the proposed token change, or the sibling repo's own two
// representations of the same token (recorded for the "record both" note
// in the inventory, not a website change).
const pairs = [
  {
    label: 'website ink on current website yellow (body text, Base.astro:44)',
    fg: '#333333',
    bg: '#F0DB4E',
  },
  {
    label: 'website ink on proposed sibling yellow (same text, token swapped)',
    fg: '#333333',
    bg: '#FFD93D',
  },
  {
    label: 'sibling ink on proposed sibling yellow (full token swap)',
    fg: '#161514',
    bg: '#FFD93D',
  },
  {
    label: 'current website yellow as text on white (nav hover, Navigation.astro)',
    fg: '#F0DB4E',
    bg: '#FFFFFF',
  },
  {
    label: 'proposed sibling yellow as text on white (nav hover, token swapped)',
    fg: '#FFD93D',
    bg: '#FFFFFF',
  },
  {
    label: 'website ink on white (card and header body text)',
    fg: '#333333',
    bg: '#FFFFFF',
  },
  {
    label: 'sibling ink on white (same text, token swapped)',
    fg: '#161514',
    bg: '#FFFFFF',
  },
  {
    label: 'white on website ink (RSVP button, EventDetails.astro:47)',
    fg: '#FFFFFF',
    bg: '#333333',
  },
  {
    label: 'white on website ink hover shade (RSVP button hover)',
    fg: '#FFFFFF',
    bg: '#444444',
  },
  {
    label: 'white on sibling ink (RSVP button, token swapped)',
    fg: '#FFFFFF',
    bg: '#161514',
  },
  {
    label: 'white on sibling ink-soft (RSVP button hover, token swapped)',
    fg: '#FFFFFF',
    bg: '#3A3631',
  },
  {
    label: `sibling accent-ink from tokens.css oklch(0.45 0.14 70) converted to ${siblingAccentInkHex}, on sibling cream background`,
    fg: siblingAccentInkHex,
    bg: '#F2EEE4',
  },
  {
    label: 'sibling accent-ink as hardcoded in slides.jsx (#7C4A00), on sibling cream background',
    fg: '#7C4A00',
    bg: '#F2EEE4',
  },
];

for (const { label, fg, bg } of pairs) {
  const ratio = contrastRatio(fg, bg);
  const ratioText = ratio.toFixed(2);
  const normalPass = ratio >= 4.5 ? 'PASS' : 'FAIL';
  const largePass = ratio >= 3.0 ? 'PASS' : 'FAIL';
  console.log(`${label}`);
  console.log(
    `  fg ${fg} / bg ${bg} - ratio ${ratioText}:1 - AA normal: ${normalPass} - AA large: ${largePass}`
  );
}
