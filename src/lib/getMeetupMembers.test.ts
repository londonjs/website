import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMeetupMembers } from './getMeetupMembers';
import * as fs from 'node:fs/promises';
import path from 'node:path';

// Mock fs.readFile and fs.writeFile
vi.mock('node:fs/promises', () => {
  const readFile = vi.fn();
  const writeFile = vi.fn();
  const mkdir = vi.fn().mockResolvedValue(undefined);
  return { readFile, writeFile, mkdir };
});

// Setup for cache mocks
const CACHE_DIR = '.cache';
const CACHE_FILE = path.join(CACHE_DIR, 'meetup-members.json');
const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds

// Sample HTML with JSON-LD that contains memberCount
const validHtmlWithJsonLd = `
<!DOCTYPE html>
<html>
<head>
  <title>London.js Meetup</title>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "London.js",
    "memberCount": 4075
  }
  </script>
</head>
<body>
  <h1>London.js</h1>
  <p>A JavaScript community</p>
</body>
</html>
`;

// Sample HTML with JSON-LD in @graph structure
const validHtmlWithGraphJsonLd = `
<!DOCTYPE html>
<html>
<head>
  <title>London.js Meetup</title>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "London.js",
        "memberCount": 3500
      }
    ]
  }
  </script>
</head>
<body>
  <h1>London.js</h1>
  <p>A JavaScript community</p>
</body>
</html>
`;

// Sample HTML without JSON-LD but with member count in HTML
const validHtmlWithoutJsonLd = `
<!DOCTYPE html>
<html>
<head>
  <title>London.js Meetup</title>
</head>
<body>
  <h1>London.js</h1>
  <p>A JavaScript community</p>
  <div data-testid="group-members-count">2500 members</div>
</body>
</html>
`;

// Sample HTML with member count in plain text
const validHtmlWithPlainText = `
<!DOCTYPE html>
<html>
<head>
  <title>London.js Meetup</title>
</head>
<body>
  <h1>London.js</h1>
  <p>A JavaScript community with 1800 members</p>
</body>
</html>
`;

// Sample HTML with no member count
const invalidHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>London.js Meetup</title>
</head>
<body>
  <h1>London.js</h1>
  <p>A JavaScript community</p>
</body>
</html>
`;

describe('getMeetupMembers', () => {
  // Setup global fetch mock
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    // Clear mock call history
    vi.clearAllMocks();
  });

  // Restore original fetch after each test
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('extracts member count from JSON-LD data', async () => {
    // Mock cache to be empty (file not found)
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('File not found'));
    
    // Mock fetch to return valid HTML with JSON-LD
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validHtmlWithJsonLd)
    });

    const result = await getMeetupMembers();
    expect(result).toBe(4075);
    expect(global.fetch).toHaveBeenCalledWith('https://meetup.com/london-js/');
    
    // Check that writeFile was called with the correct data
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledWith(
      CACHE_FILE,
      expect.stringContaining('"count": 4075'),
      'utf-8'
    );
  });

  test('uses cached data if less than 1 hour old', async () => {
    // Create a cache timestamp that is 30 minutes old
    const now = Date.now();
    const thirtyMinutesAgo = now - (30 * 60 * 1000);
    
    // Mock cache to return valid recent data
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({
      count: 4200,
      timestamp: thirtyMinutesAgo
    }));
    
    const result = await getMeetupMembers();
    
    // Should return cached count without calling fetch
    expect(result).toBe(4200);
    expect(global.fetch).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  test('fetches new data if cache is older than 1 hour', async () => {
    // Create a cache timestamp that is 2 hours old
    const now = Date.now();
    const twoHoursAgo = now - (2 * ONE_HOUR);
    
    // Mock cache to return old data
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({
      count: 4100,
      timestamp: twoHoursAgo
    }));
    
    // Mock fetch to return new data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validHtmlWithJsonLd)
    });
    
    const result = await getMeetupMembers();
    
    // Should return new data from fetch
    expect(result).toBe(4075);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    // Check that writeFile was called with the updated data
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledWith(
      CACHE_FILE,
      expect.stringContaining('"count": 4075'),
      'utf-8'
    );
  });

  test('handles errors in reading cache gracefully', async () => {
    // Mock cache read to throw unexpected error
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('Unknown file system error'));
    
    // Mock fetch to return valid data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validHtmlWithJsonLd)
    });
    
    const result = await getMeetupMembers();
    
    // Should proceed with fetching data
    expect(result).toBe(4075);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('extracts member count from JSON-LD data with @graph structure', async () => {
    // Mock cache to be empty
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('File not found'));
    
    // Mock fetch to return valid HTML with JSON-LD in @graph structure
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validHtmlWithGraphJsonLd)
    });

    const result = await getMeetupMembers();
    expect(result).toBe(3500);
  });

  test('extracts member count from HTML elements when JSON-LD is missing', async () => {
    // Mock fetch to return HTML with member count in element
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validHtmlWithoutJsonLd)
    });

    const result = await getMeetupMembers();
    expect(result).toBe(2500);
  });

  test('extracts member count from text when specific elements are missing', async () => {
    // Mock fetch to return HTML with member count in plain text
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validHtmlWithPlainText)
    });

    const result = await getMeetupMembers();
    expect(result).toBe(1800);
  });

  test('throws error when fetch fails', async () => {
    // Mock cache to be empty
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('File not found'));
    
    // Mock fetch to fail
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await expect(getMeetupMembers()).rejects.toThrow('Error getting meetup members: Failed to fetch meetup page: 404 Not Found');
  });

  test('throws error when member count is not found', async () => {
    // Mock fetch to return HTML without member count
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(invalidHtml)
    });

    await expect(getMeetupMembers()).rejects.toThrow('Error getting meetup members: Member count not found on the meetup page');
  });

  test('handles network errors', async () => {
    // Mock fetch to throw network error
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(getMeetupMembers()).rejects.toThrow('Error getting meetup members: Network error');
  });

  test('handles invalid JSON in JSON-LD but still finds count in HTML', async () => {
    // Create HTML with invalid JSON in JSON-LD script but member count in HTML
    const htmlWithInvalidJson = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>London.js Meetup</title>
      <script type="application/ld+json">
      {
        "invalid JSON
      </script>
    </head>
    <body>
      <h1>London.js</h1>
      <div class="groupHomeHeader-memberCount">5000 members</div>
    </body>
    </html>
    `;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(htmlWithInvalidJson)
    });

    const result = await getMeetupMembers();
    expect(result).toBe(5000);
  });
}); 