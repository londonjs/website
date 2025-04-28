// Test script for caching functionality
import { getMeetupMembers } from './src/lib/getMeetupMembers.ts';
import fs from 'node:fs/promises';
import path from 'node:path';

const CACHE_FILE = path.join('.cache', 'meetup-members.json');

async function testCache() {
  try {
    console.log('Testing getMeetupMembers with caching...');
    
    // First call - should fetch and cache
    console.log('First call (should fetch from website):');
    const startTime1 = Date.now();
    const count1 = await getMeetupMembers();
    const endTime1 = Date.now();
    console.log(`Member count: ${count1} (took ${endTime1 - startTime1}ms)`);
    
    // Check if cache file exists
    try {
      const cacheData = await fs.readFile(CACHE_FILE, 'utf-8');
      const cache = JSON.parse(cacheData);
      console.log('Cache created:', cache);
    } catch (err) {
      console.error('Failed to read cache:', err);
    }
    
    // Second call - should use cache
    console.log('\nSecond call (should use cache):');
    const startTime2 = Date.now();
    const count2 = await getMeetupMembers();
    const endTime2 = Date.now();
    console.log(`Member count: ${count2} (took ${endTime2 - startTime2}ms)`);
    
    // Success!
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCache(); 