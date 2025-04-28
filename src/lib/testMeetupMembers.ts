import { getMeetupMembers } from './getMeetupMembers';

// Simple test function
async function testGetMeetupMembers() {
  try {
    console.log('Fetching London.js meetup member count...');
    const memberCount = await getMeetupMembers();
    console.log(`✅ Success! London.js has ${memberCount} members.`);
    return memberCount;
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

// Run the test
testGetMeetupMembers(); 