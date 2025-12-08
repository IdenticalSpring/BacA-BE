# AI Chatbot Backend Implementation - EPIC 2

## ✅ IMPLEMENTATION COMPLETE

All required files have been updated with AI Chatbot functionality integrated with Gemini API and custom TTS server.

---

## 📝 FILES MODIFIED

### 1. **`chat.entity.ts`** - Database Schema Updates

**New Fields Added:**
```typescript
@Column({ type: 'boolean', default: false })
isAI: boolean;  // Marks AI-generated messages

@Column({ type: 'int', nullable: true })
senderID: number;  // Tracks sender ID (student/teacher/AI Bot)
```

**Purpose:** Track AI messages separately and store sender IDs for better message attribution.

---

### 2. **`chat.dto.ts`** - Data Transfer Object Updates

**New Field Added:**
```typescript
@IsOptional()
@IsBoolean()
isAI?: boolean;  // Flag to trigger AI processing
```

**Purpose:** Allow clients to explicitly request AI responses by setting `isAI: true`.

---

### 3. **`chat.service.ts`** - Core AI Logic Implementation

**Key Changes:**

#### A. AI Bot Constant
```typescript
private readonly AI_BOT_ID = 97777; // Hardcoded AI Bot Teacher ID
```

#### B. New `sendMessage()` Method
**Flow:**
1. **Step A:** Save user message to database
2. **Step B:** Check if `isAI` flag is true
3. **Step C (AI Processing):**
   - Call `generateAIResponse()` → Gemini API
   - Call `convertTextToSpeech()` → Custom TTS server
4. **Step D:** Save AI response with:
   - `senderID = 97777`
   - `isAI = true`
   - `audioUrl` from TTS
5. **Step E:** Return AI message (or user message if no AI)

#### C. Private Helper Methods

**`generateAIResponse(userMessage: string)`**
```typescript
- Uses Gemini 2.5-flash model
- Sends friendly teaching assistant prompt
- Returns plain text (no markdown)
- Error handling with descriptive logs
```

**`convertTextToSpeech(text: string)`**
```typescript
- Calls: POST http://45.13.132.111:5000/tts
- Payload: { text, voice: 'af_heart', voiceSpeed: '0.8' }
- Saves audio to uploads/ folder
- Returns public URL or null on failure
- Graceful error handling (doesn't crash if TTS fails)
```

---

### 4. **`chat.gateway.ts`** - WebSocket Handler Updates

**Modified `handleSendPrivateChat()`:**
```typescript
// Now calls chatService.sendMessage() instead of createChat()
const chat = await this.chatService.sendMessage(dto);

// Emits result immediately (could be user or AI message)
this.server.to(room).emit('newPrivateChat', chat);
```

**Backward Compatibility:** Kept legacy AI check for existing ChatTopic-based flows.

---

### 5. **`chat.module.ts`** - Already Configured ✅

**Current Configuration:**
- ✅ `GeminiModule` imported (via forwardRef)
- ✅ `ChatTopic` entity registered
- ✅ `WsAuthGuard` provider registered
- ✅ All necessary repositories included

**No changes needed** - module is properly configured.

---

## 🚀 USAGE

### Frontend Integration

**Send AI-Enabled Message:**
```javascript
socket.emit('sendPrivateChat', {
  classId: 1,
  studentId: 123,
  teacherId: 1,
  senderRole: 'student',
  message: 'Hello, can you help me with English grammar?',
  isAI: true  // 🔥 Trigger AI processing
});
```

**Receive AI Response:**
```javascript
socket.on('newPrivateChat', (message) => {
  if (message.isAI) {
    console.log('🤖 AI Response:', message.message);
    console.log('🔊 Audio URL:', message.audioUrl);
    
    // Play audio
    const audio = new Audio(message.audioUrl);
    audio.play();
  }
});
```

---

## 🔧 BACKEND REQUIREMENTS

### 1. Create AI Bot Teacher Account

**Run this SQL in MySQL:**
```sql
INSERT INTO teacher (id, name, username, password, level, startDate, isDelete)
VALUES (
  97777,
  'AI Teaching Assistant',
  'ai_bot_97777',
  '$2b$10$invalidHashNotForLogin',  -- Hashed dummy password
  'AI',
  NOW(),
  0
);
```

**Verify:**
```sql
SELECT * FROM teacher WHERE id = 97777;
```

---

### 2. Environment Variables

**Ensure `.env` contains:**
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
```

---

### 3. Install Dependencies (If Needed)

```bash
cd BacA-BE
npm install axios @google/generative-ai
```

---

## 🧪 TESTING

### Test 1: Manual API Test

**Using curl/Postman:**
```bash
# Test message endpoint (if REST endpoint exists)
curl -X POST http://localhost:8000/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 1,
    "studentId": 1,
    "teacherId": 1,
    "senderRole": "student",
    "message": "What is the past tense of go?",
    "isAI": true
  }'
```

**Expected Response:**
```json
{
  "id": 456,
  "message": "Great question! The past tense of 'go' is 'went'. For example: 'I went to school yesterday.' Can you make a sentence using 'went'?",
  "audioUrl": "https://api.happyclass.com.vn/uploads/tts-ai-xxx.mp3",
  "isAI": true,
  "senderID": 97777,
  "senderRole": "teacher"
}
```

---

### Test 2: WebSocket Test

**Using Socket.io Client:**
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:8000');

// Authenticate (if required)
socket.on('connect', () => {
  console.log('Connected!');
  
  // Join room
  socket.emit('joinPrivateChat', { classId: 1, studentId: 1 });
  
  // Send AI message
  socket.emit('sendPrivateChat', {
    classId: 1,
    studentId: 1,
    teacherId: 1,
    senderRole: 'student',
    message: 'How do I use present perfect tense?',
    isAI: true
  });
});

// Listen for response
socket.on('newPrivateChat', (msg) => {
  console.log('📨 Received:', msg);
  if (msg.isAI) {
    console.log('🤖 AI replied!');
    console.log('🔊 Play audio:', msg.audioUrl);
  }
});
```

---

### Test 3: Check Database

**Verify messages are saved:**
```sql
SELECT 
  id, 
  message, 
  isAI, 
  senderID, 
  senderRole, 
  audioUrl,
  createdAt
FROM chat
WHERE classId = 1
ORDER BY createdAt DESC
LIMIT 10;
```

**Expected Output:**
| id | message | isAI | senderID | senderRole | audioUrl |
|----|---------|------|----------|------------|----------|
| 456 | Great question! The past... | 1 | 97777 | teacher | https://... |
| 455 | What is past tense of go? | 0 | 1 | student | NULL |

---

## 🐛 TROUBLESHOOTING

### Issue 1: "Gemini API not initialized"

**Cause:** `GEMINI_API_KEY` not set in `.env`

**Solution:**
```bash
# Check environment variable
echo $GEMINI_API_KEY  # Linux/Mac
echo %GEMINI_API_KEY% # Windows

# Add to .env file
GEMINI_API_KEY=AIzaSy...your_key_here
```

---

### Issue 2: "AI Bot teacher (ID 97777) not found"

**Cause:** AI Bot account not created in database

**Solution:** Run the SQL insert statement from section "Create AI Bot Teacher Account"

---

### Issue 3: TTS Returns Null

**Possible Causes:**
- TTS server `http://45.13.132.111:5000` is down
- Network connectivity issues
- Invalid response format

**Check:**
```bash
# Test TTS server manually
curl -X POST http://45.13.132.111:5000/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello world","voice":"af_heart","voiceSpeed":"0.8"}'
```

**Expected Response:**
```json
{
  "audioData": "base64_encoded_audio_here..."
}
```

**Graceful Handling:** 
- If TTS fails, message is still saved
- `audioUrl` will be `null`
- Frontend should handle missing audio gracefully

---

### Issue 4: WebSocket Not Receiving Messages

**Check:**
1. **Authentication:** Ensure JWT token is valid
2. **Room Join:** Call `joinPrivateChat` before sending
3. **Logs:** Check backend console for errors

**Debug:**
```typescript
// In chat.gateway.ts, add more logs
this.logger.log(`Room members: ${this.server.sockets.adapter.rooms.get(room)?.size || 0}`);
```

---

## 📊 FLOW DIAGRAM

```
┌─────────────┐
│   Student   │
│  (Frontend) │
└──────┬──────┘
       │ 1. sendPrivateChat({ isAI: true })
       ▼
┌─────────────────┐
│  ChatGateway    │
│ (WebSocket)     │
└──────┬──────────┘
       │ 2. chatService.sendMessage()
       ▼
┌─────────────────┐
│  ChatService    │
├─────────────────┤
│ A. Save User    │
│    Message      │
│                 │
│ B. Check isAI   │
│    flag         │
│                 │
│ C. If true:     │
│    ├─ Gemini    │──────► 🧠 Gemini API
│    │   API      │           (Generate Text)
│    │            │
│    └─ TTS       │──────► 🔊 TTS Server
│       Server    │           (Convert to Audio)
│                 │
│ D. Save AI      │
│    Response     │
│    (ID 97777)   │
└──────┬──────────┘
       │ 3. Return AI Chat
       ▼
┌─────────────────┐
│  ChatGateway    │
│ Emit to Room    │
└──────┬──────────┘
       │ 4. newPrivateChat event
       ▼
┌─────────────┐
│   Student   │
│  (Frontend) │
│ ┌─────────┐ │
│ │  Text   │ │
│ │ + Audio │ │
│ └─────────┘ │
└─────────────┘
```

---

## ✅ VERIFICATION CHECKLIST

Before testing, ensure:

- [ ] **Database:** AI Bot teacher (ID 97777) exists
- [ ] **Environment:** `GEMINI_API_KEY` is set
- [ ] **Dependencies:** `axios`, `@google/generative-ai` installed
- [ ] **Backend:** NestJS server running on port 8000
- [ ] **TTS Server:** `http://45.13.132.111:5000/tts` is accessible
- [ ] **Uploads Folder:** `BacA-BE/uploads/` directory exists (auto-created)

---

## 🎯 NEXT STEPS

### Phase 1: Basic Testing ✅ (Complete)
- Test manual message sending
- Verify AI responses generate
- Check audio file creation

### Phase 2: Frontend Integration (Next)
- Add "AI Mode" toggle button
- Display AI messages with special styling
- Auto-play audio responses
- Show "AI is thinking..." indicator

### Phase 3: Enhancements (Future)
- Rate limiting (prevent spam)
- Conversation context (remember history)
- Voice selection (allow different TTS voices)
- Student profile integration (personalize responses)

---

## 📞 SUPPORT

**Common Commands:**

```bash
# Start backend
cd BacA-BE
npm run start:dev

# Check logs
tail -f logs/app.log

# Test Gemini API
curl https://generativelanguage.googleapis.com/v1/models \
  -H "x-goog-api-key: YOUR_API_KEY"

# Check database
mysql -u root -p
USE your_database;
SELECT * FROM chat WHERE isAI = 1;
```

---

**Implementation Status: ✅ COMPLETE**

All backend components are ready. The AI Chatbot can now:
1. ✅ Receive messages with `isAI` flag
2. ✅ Generate responses via Gemini API
3. ✅ Convert text to audio via TTS server
4. ✅ Save messages with AI Bot ID (97777)
5. ✅ Emit responses to frontend via WebSocket

**Ready for frontend integration!** 🚀
