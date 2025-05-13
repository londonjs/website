import { parse } from 'node-html-parser';
import * as fs from 'node:fs/promises';
import path from 'node:path';

// Cache file path
const CACHE_DIR = '.cache';
const CACHE_FILE = path.join(CACHE_DIR, 'meetup-members.json');
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Cache interface
interface MemberCountCache {
  count: number;
  timestamp: number;
}

/**
 * Fetches the London.js Meetup page and extracts the member count
 * Uses a cached value if available and less than 1 hour old
 * 
 * @returns Promise resolving to the number of members in the meetup group
 * @throws Error if there's a network issue or if the member count data is missing
 */
export async function getMeetupMembers(): Promise<number> {
  try {
    // Check for cached data first
    const cachedData = await readCache();
    if (cachedData) {
      // If cache exists and is less than 1 hour old, use it
      const now = Date.now();
      if (now - cachedData.timestamp < CACHE_TTL) {
        return cachedData.count;
      }
    }

    // If no valid cache, fetch the data
    const count = await fetchMemberCount();
    
    // Save to cache
    await writeCache(count);
    
    return count;
  } catch (error) {
    // Re-throw with a more descriptive message
    if (error instanceof Error) {
      throw new Error(`Error getting meetup members: ${error.message}`);
    } else {
      throw new Error('Unknown error occurred while getting meetup members');
    }
  }
}

/**
 * Read cached member count if it exists
 * @returns The cached data or null if no cache exists
 */
async function readCache(): Promise<MemberCountCache | null> {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(data) as MemberCountCache;
  } catch (error) {
    // If file doesn't exist or can't be read, return null
    return null;
  }
}

/**
 * Write member count to cache file
 * @param count The member count to cache
 */
async function writeCache(count: number): Promise<void> {
  try {
    // Ensure cache directory exists
    await fs.mkdir(CACHE_DIR, { recursive: true });
    
    const cacheData: MemberCountCache = {
      count,
      timestamp: Date.now()
    };
    
    await fs.writeFile(CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8');
  } catch (error) {
    // Log cache write errors but don't fail the overall operation
    console.error('Failed to write to cache:', error);
  }
}

/**
 * Fetch the member count from the Meetup page
 * @returns The member count
 */
async function fetchMemberCount(): Promise<number> {
  // Fetch the Meetup page
  const response = await fetch('https://meetup.com/london-js/');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch meetup page: ${response.status} ${response.statusText}`);
  }
  
  // Parse the HTML content
  const html = await response.text();
  const root = parse(html);
  
  // APPROACH 1: Look for JSON-LD data (preferred method)
  try {
    const jsonLdScripts = root.querySelectorAll('script[type="application/ld+json"]');
    
    if (jsonLdScripts && jsonLdScripts.length > 0) {
      for (const script of jsonLdScripts) {
        const jsonLd = JSON.parse(script.text);
        
        // Direct memberCount property
        if (jsonLd && typeof jsonLd.memberCount === 'number') {
          return jsonLd.memberCount;
        }
        
        // Nested in @graph array
        if (jsonLd && Array.isArray(jsonLd['@graph'])) {
          for (const item of jsonLd['@graph']) {
            if (item && typeof item.memberCount === 'number') {
              return item.memberCount;
            }
          }
        }
        
        // Other potential JSON-LD structures
        if (jsonLd && jsonLd.organization && typeof jsonLd.organization.memberCount === 'number') {
          return jsonLd.organization.memberCount;
        }
      }
    }
  } catch (jsonLdError) {
    // If JSON-LD parsing fails, continue to fallback methods
    console.error('JSON-LD parsing failed, trying fallback methods');
  }
  
  // APPROACH 2: Look for member count in specific elements
  const memberCountElements = [
    // Data attributes and class selectors common on Meetup
    root.querySelector('[data-testid="group-members-count"]'),
    root.querySelector('.groupHomeHeader-memberCount'),
    root.querySelector('[data-element-name="members-count"]')
  ].filter(Boolean);
  
  for (const element of memberCountElements) {
    if (!element) continue;
    const text = element.text.trim();
    const numericMatch = text.match(/(\d[\d,]+)/);
    if (numericMatch && numericMatch[1]) {
      return parseInt(numericMatch[1].replace(/,/g, ''), 10);
    }
  }
  
  // APPROACH 3: Pattern matching across all text elements
  const allElements = root.querySelectorAll('span, div, p, h1, h2, h3, h4, h5, h6');
  for (const element of allElements) {
    const text = element.text.trim();
    
    // Common patterns for member counts
    const patterns = [
      /(\d[\d,]+)\s+members?/i,
      /members?:\s+(\d[\d,]+)/i,
      /group of\s+(\d[\d,]+)/i,
      /community of\s+(\d[\d,]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1].replace(/,/g, ''), 10);
      }
    }
  }
  
  // APPROACH 4: Meta tags
  const metaTags = root.querySelectorAll('meta[property*="members"], meta[name*="members"]');
  for (const meta of metaTags) {
    const content = meta.getAttribute('content');
    if (content && /^\d+$/.test(content)) {
      return parseInt(content, 10);
    }
  }
  
  // If all approaches fail, throw an error
  throw new Error('Member count not found on the meetup page');
} 