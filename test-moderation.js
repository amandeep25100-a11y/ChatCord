// Test script for AI Moderation
const { moderateMessage } = require('./utils/aiModeration');

console.log('🧪 Testing ChatCord AI Moderation System\n');
console.log('='.repeat(60));

const testMessages = [
  // Should be APPROVED
  { text: 'How do I write a function in JavaScript?', expected: 'APPROVED' },
  { text: 'Can someone help me debug this code?', expected: 'APPROVED' },
  { text: 'I am learning Python programming', expected: 'APPROVED' },
  { text: 'Hello everyone!', expected: 'APPROVED' },
  
  // Should be FLAGGED (1 off-topic keyword)
  { text: 'I watched a movie yesterday', expected: 'FLAGGED' },
  { text: 'What is your religion?', expected: 'FLAGGED' },
  { text: 'I love playing games', expected: 'FLAGGED' },
  { text: 'HELLO EVERYONE!!!', expected: 'FLAGGED' }, // Excessive caps
  { text: 'aaaaaaaaa', expected: 'FLAGGED' }, // Repeated characters
  
  // Should be BLOCKED (2+ off-topic keywords)
  { text: 'Politics and religion are important topics', expected: 'BLOCKED' },
  { text: 'I hate this political party', expected: 'BLOCKED' },
  { text: 'Let\'s play some games and watch movies', expected: 'BLOCKED' },
];

async function runTests() {
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testMessages.length; i++) {
    const test = testMessages[i];
    console.log(`\nTest ${i + 1}/${testMessages.length}:`);
    console.log(`Message: "${test.text}"`);
    console.log(`Expected: ${test.expected}`);
    
    const result = await moderateMessage(test.text, 'Test Room');
    const actual = result.blocked ? 'BLOCKED' : result.flagged ? 'FLAGGED' : 'APPROVED';
    
    console.log(`Actual: ${actual}`);
    console.log(`Reason: ${result.reason}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    
    if (actual === test.expected) {
      console.log('✅ PASS');
      passed++;
    } else {
      console.log('❌ FAIL');
      failed++;
    }
    console.log('-'.repeat(60));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed out of ${testMessages.length} tests`);
  console.log('='.repeat(60));
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Moderation is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Review the moderation logic.');
  }
}

// Run tests
runTests().catch(console.error);
