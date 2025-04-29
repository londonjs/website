import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';

// Mock fs module before importing any files that use it
vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn()
  }
}));

// Import the module after mocking
import { getMeetupMembers } from './getMeetupMembers';
import fs from 'node:fs/promises';

// Constants for cache testing
const CACHE_DIR = '.cache';
const CACHE_FILE = path.join(CACHE_DIR, 'meetup-members.json');
const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds

// Sample HTML with memberCount for testing
const validHtml = `
<!DOCTYPE html>
<html>
<head>
  <script type="application/ld+json">
  { "@type": "Organization", "memberCount": 4200 }
  </script>
</head>
<body></body>
</html>
`;

describe('getMeetupMembers Cache', () => {
  // Setup global fetch mock
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
    
    // Mock Date.now() to have a consistent reference time
    const mockNow = 1000 * 60 * 60 * 24; // 24 hours in ms
    vi.spyOn(Date, 'now').mockReturnValue(mockNow);
    
    // Reset all mocks
    vi.mocked(fs.readFile).mockReset();
    vi.mocked(fs.writeFile).mockReset().mockResolvedValue(undefined);
    vi.mocked(fs.mkdir).mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  test('should use cached data when cache is fresh (less than 1 hour old)', async () => {
    // Setup: Create a cache timestamp that is 30 minutes ago
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
    const mockCachedData = {
      count: 4100,
      timestamp: thirtyMinutesAgo
    };

    // Mock readFile to return our "fresh" cache
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockCachedData));
    
    // We shouldn't need fetch in this test, but mock it anyway to be sure
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validHtml)
    });

    // Execute the function
    const result = await getMeetupMembers();

    // Assertions
    expect(fs.readFile).toHaveBeenCalledWith(CACHE_FILE, 'utf-8');
    expect(global.fetch).not.toHaveBeenCalled(); // Should not call fetch
    expect(fs.writeFile).not.toHaveBeenCalled(); // Should not write new cache
    expect(result).toBe(4100); // Should return the cached count
  });

  test('should fetch new data when cache is expired (more than 1 hour old)', async () => {
    // Setup: Create a cache timestamp that is 2 hours old
    const twoHoursAgo = Date.now() - (2 * ONE_HOUR);
    const mockExpiredCache = {
      count: 4000,
      timestamp: twoHoursAgo
    };

    // Mock readFile to return an "expired" cache
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockExpiredCache));

    // Mock fetch to return new data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validHtml)
    });

    // Execute the function
    const result = await getMeetupMembers();

    // Assertions
    expect(fs.readFile).toHaveBeenCalledWith(CACHE_FILE, 'utf-8');
    expect(global.fetch).toHaveBeenCalledWith('https://meetup.com/london-js/');
    expect(fs.writeFile).toHaveBeenCalledWith(
      CACHE_FILE,
      expect.stringContaining('"count": 4200'),
      'utf-8'
    );
    expect(result).toBe(4200); // Should return the new count from fetch
  });

  test('should fetch data when no cache exists', async () => {
    // Mock readFile to simulate missing cache
    vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

    // Mock fetch to return data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validHtml)
    });

    // Execute the function
    const result = await getMeetupMembers();

    // Assertions
    expect(fs.readFile).toHaveBeenCalledWith(CACHE_FILE, 'utf-8');
    expect(global.fetch).toHaveBeenCalledWith('https://meetup.com/london-js/');
    expect(fs.mkdir).toHaveBeenCalledWith(CACHE_DIR, { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(
      CACHE_FILE,
      expect.stringContaining('"count": 4200'),
      'utf-8'
    );
    expect(result).toBe(4200);
  });

  test('should handle cache read errors gracefully', async () => {
    // Mock readFile to throw an unexpected error
    vi.mocked(fs.readFile).mockRejectedValue(new Error('Unknown filesystem error'));

    // Mock fetch to return data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validHtml)
    });

    // Execute the function
    const result = await getMeetupMembers();

    // Assertions
    expect(fs.readFile).toHaveBeenCalledWith(CACHE_FILE, 'utf-8');
    expect(global.fetch).toHaveBeenCalled(); // Should fall back to fetch
    expect(result).toBe(4200);
  });

  test('should handle cache write errors gracefully', async () => {
    // Mock readFile to simulate missing cache
    vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

    // Mock mkdir to succeed but writeFile to fail
    vi.mocked(fs.writeFile).mockRejectedValue(new Error('Write permission denied'));

    // Mock fetch to return data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(validHtml)
    });

    // Execute the function without errors even if cache writing fails
    const result = await getMeetupMembers();

    // Should still return the correct count despite cache write failure
    expect(result).toBe(4200);
    
    // Verify that a write was attempted
    expect(fs.writeFile).toHaveBeenCalled();
  });

  test('should throw error when fetch fails with no valid cache', async () => {
    // Mock readFile to simulate missing cache
    vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

    // Mock fetch to fail
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    // Execute the function and expect it to throw
    await expect(getMeetupMembers()).rejects.toThrow('Error getting meetup members: Failed to fetch meetup page: 404 Not Found');
  });
}); 