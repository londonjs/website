import { describe, test, expect } from 'vitest';
import { buildOsmEmbedUrl, buildOsmLink, buildOsmSearchLink } from './osmMap';

const LAT = 51.51611;
const LON = -0.08083;
const QUERY = 'Salesforce Tower, 110 Bishopsgate, London, EC2N 4AY';

const EXPECTED_EMBED_URL =
  'https://www.openstreetmap.org/export/embed.html?bbox=-0.08483,51.51361,-0.07683,51.51861&layer=mapnik&marker=51.51611,-0.08083';
const EXPECTED_LINK_URL =
  'https://www.openstreetmap.org/?mlat=51.51611&mlon=-0.08083#map=17/51.51611/-0.08083';
const EXPECTED_SEARCH_URL =
  'https://www.openstreetmap.org/search?query=Salesforce%20Tower%2C%20110%20Bishopsgate%2C%20London%2C%20EC2N%204AY';

describe('buildOsmEmbedUrl', () => {
  test('returns the expected embed URL for Salesforce Tower', () => {
    expect(buildOsmEmbedUrl(LAT, LON)).toBe(EXPECTED_EMBED_URL);
  });
});

describe('buildOsmLink', () => {
  test('returns the expected link URL for Salesforce Tower', () => {
    expect(buildOsmLink(LAT, LON)).toBe(EXPECTED_LINK_URL);
  });
});

describe('buildOsmSearchLink', () => {
  test('returns the expected search URL for Salesforce Tower', () => {
    expect(buildOsmSearchLink(QUERY)).toBe(EXPECTED_SEARCH_URL);
  });

  test('encodes an ampersand and a space in the query', () => {
    expect(buildOsmSearchLink('Fish & Chips')).toBe(
      'https://www.openstreetmap.org/search?query=Fish%20%26%20Chips'
    );
  });
});

describe('no Google references', () => {
  test('none of the three results contains google', () => {
    const embed = buildOsmEmbedUrl(LAT, LON);
    const link = buildOsmLink(LAT, LON);
    const search = buildOsmSearchLink(QUERY);

    expect(embed.toLowerCase()).not.toContain('google');
    expect(link.toLowerCase()).not.toContain('google');
    expect(search.toLowerCase()).not.toContain('google');
  });
});
