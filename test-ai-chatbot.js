/**
 * AI Chatbot Test Script
 * Run: node test-ai-chatbot.js
 */

const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:8000';
const TEST_CONFIG = {
  classId: 1,
  studentId: 1,
  teacherId: 1,
};

console.log('🧪 Starting AI Chatbot Test...\n');

// Create socket connection
const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  // Add auth token if required
  // auth: { token: 'your_jwt_token_here' }
});

// Connection handlers
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server\n');
  runTests();
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
  console.log('\n💡 Make sure backend is running: npm run start:dev\n');
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('\n🔌 Disconnected from server');
});

// Message listener
socket.on('newPrivateChat', (message) => {
  console.log('\n📨 Received Message:');
  console.log('  ID:', message.id);
  console.log('  Sender Role:', message.senderRole);
  console.log('  Sender ID:', message.senderID);
  console.log('  Is AI:', message.isAI ? '✅ YES (AI Bot)' : '❌ NO');
  console.log('  Message:', message.message?.substring(0, 100));
  console.log('  Audio URL:', message.audioUrl || 'None');
  console.log('  Created:', message.createdAt);
  
  if (message.isAI) {
    console.log('\n🎉 AI Response received successfully!');
    if (message.audioUrl) {
      console.log('🔊 Audio file generated: ' + message.audioUrl);
    }
  }
  
  console.log('\n' + '='.repeat(60));
});

socket.on('joinedPrivateChat', (data) => {
  console.log('✅ Joined chat room:', data.room);
});

// Test functions
async function runTests() {
  console.log('📋 Running tests...\n');
  
  // Test 1: Join chat room
  console.log('Test 1: Joining private chat room...');
  socket.emit('joinPrivateChat', {
    classId: TEST_CONFIG.classId,
    studentId: TEST_CONFIG.studentId,
  });
  
  await sleep(1000);
  
  // Test 2: Send message WITHOUT AI
  console.log('\nTest 2: Sending regular student message (no AI)...');
  socket.emit('sendPrivateChat', {
    ...TEST_CONFIG,
    senderRole: 'student',
    message: 'Hello teacher, this is a normal message.',
    isAI: false,
  });
  
  await sleep(2000);
  
  // Test 3: Send message WITH AI
  console.log('\nTest 3: Sending student message WITH AI flag...');
  console.log('⏳ Waiting for AI response (may take 5-10 seconds)...\n');
  socket.emit('sendPrivateChat', {
    ...TEST_CONFIG,
    senderRole: 'student',
    message: 'Can you help me understand the difference between present simple and present continuous?',
    isAI: true,  // 🔥 This triggers AI processing
  });
  
  // Wait for AI response
  await sleep(15000);
  
  console.log('\n✅ Tests completed!');
  console.log('\n💡 Check the backend logs for detailed processing info.');
  console.log('💡 Check database: SELECT * FROM chat WHERE isAI = 1;');
  
  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 2000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Test interrupted by user');
  socket.disconnect();
  process.exit(0);
});
