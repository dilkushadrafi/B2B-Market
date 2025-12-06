# Chat Support System - Implementation Plan

## 📋 Overview
A real-time chat system enabling direct communication between retailers and distributors for order inquiries, support, and business discussions.

## 🎯 Features

### Core Features:
- ✅ **One-on-one messaging** between retailer and distributor
- ✅ **Real-time updates** (polling every 5 seconds)
- ✅ **Message history** (persistent in database)
- ✅ **Unread count** (badge on chat icon)
- ✅ **Read receipts** (messages marked as read when viewed)
- ✅ **Conversation list** (all active chats)
- ✅ **Beautiful UI** (modern chat interface)

### UI Features:
- ✅ **Chat icon in navbar** with unread badge
- ✅ **Conversation list** showing all chats
- ✅ **Chat window** with message history
- ✅ **Real-time message updates**
- ✅ **Typing indicator** (visual feedback)
- ✅ **Timestamps** (relative time for messages)
- ✅ **Auto-scroll** to latest message
- ✅ **Mobile responsive**

## 🗂️ File Structure

```
src/
├── models/
│   └── Chat.ts                    ✅ Created
├── app/api/chat/
│   ├── conversations/route.ts     ✅ Created
│   └── messages/route.ts          ✅ Created
├── components/chat/
│   ├── ChatButton.tsx             ⏳ To create
│   ├── ChatWindow.tsx             ⏳ To create
│   ├── ConversationList.tsx       ⏳ To create
│   └── MessageBubble.tsx          ⏳ To create
├── hooks/
│   └── useChat.ts                 ⏳ To create
└── app/
    ├── retailer/chat/page.tsx     ⏳ To create
    └── distributor/chat/page.tsx  ⏳ To create
```

## 📊 Database Schema

### Conversation Model:
```typescript
{
    _id: ObjectId,
    retailerId: String,
    distributorId: String,
    retailerName: String,
    distributorName: String,
    lastMessage: String,
    lastMessageTime: Date,
    unreadCountRetailer: Number,
    unreadCountDistributor: Number,
    createdAt: Date,
    updatedAt: Date
}
```

### Message Model:
```typescript
{
    _id: ObjectId,
    conversationId: String,
    senderId: String,
    senderRole: 'retailer' | 'distributor',
    senderName: String,
    message: String,
    read: Boolean,
    createdAt: Date,
    updatedAt: Date
}
```

## 🔄 User Flow

### Retailer Initiates Chat:
```
1. Retailer views distributor's products
2. Clicks "Chat with Distributor" button
3. Opens chat window
4. Sends message
5. Distributor receives notification
6. Distributor responds
7. Real-time conversation
```

### Distributor Initiates Chat:
```
1. Distributor views order from retailer
2. Clicks "Chat with Retailer" button
3. Opens chat window
4. Sends message
5. Retailer receives notification
6. Retailer responds
7. Real-time conversation
```

## 🎨 UI Components

### 1. ChatButton (Navbar)
- Location: Header component
- Shows unread count badge
- Opens chat modal/page
- Icon: MessageCircle

### 2. ConversationList
- Shows all active conversations
- Displays last message preview
- Shows unread count per conversation
- Click to open chat window
- Search/filter conversations

### 3. ChatWindow
- Message history (scrollable)
- Input field for new messages
- Send button
- Auto-scroll to bottom
- Real-time updates
- Typing indicator

### 4. MessageBubble
- Different styles for sent/received
- Timestamp
- Read status
- Sender name
- Message content

## 🔧 API Endpoints

### GET /api/chat/conversations
- Returns all conversations for logged-in user
- Sorted by last message time
- Includes unread counts

### POST /api/chat/conversations
- Creates new conversation
- Parameters: otherUserId, otherUserName
- Returns conversation object

### GET /api/chat/messages?conversationId=xxx
- Returns all messages for a conversation
- Marks messages as read
- Updates unread count

### POST /api/chat/messages
- Sends a new message
- Parameters: conversationId, message
- Updates conversation last message
- Increments unread count for recipient

## 🚀 Implementation Steps

### Phase 1: Backend (✅ Complete)
- [x] Create Chat models
- [x] Create conversations API
- [x] Create messages API
- [x] Add read status tracking
- [x] Add unread count logic

### Phase 2: Core Components (Next)
- [ ] Create ChatButton component
- [ ] Create ConversationList component
- [ ] Create ChatWindow component
- [ ] Create MessageBubble component
- [ ] Create useChat hook

### Phase 3: Integration
- [ ] Add ChatButton to Header
- [ ] Create chat pages for retailer/distributor
- [ ] Add "Chat" button to product cards
- [ ] Add "Chat" button to orders page
- [ ] Integrate with sidebar navigation

### Phase 4: Real-time Updates
- [ ] Implement polling (every 5 seconds)
- [ ] Auto-refresh conversation list
- [ ] Auto-refresh messages
- [ ] Show typing indicator
- [ ] Play notification sound

### Phase 5: Polish
- [ ] Add emoji support
- [ ] Add file/image sharing
- [ ] Add message search
- [ ] Add conversation archive
- [ ] Add block/report user
- [ ] Add chat history export

## 💡 Usage Examples

### Start Chat from Product:
```tsx
<Button onClick={() => startChat(distributor.id, distributor.name)}>
    Chat with Distributor
</Button>
```

### Start Chat from Order:
```tsx
<Button onClick={() => startChat(retailer.id, retailer.name)}>
    Chat with Retailer
</Button>
```

### Send Message:
```tsx
const { sendMessage } = useChat(conversationId);
sendMessage("Hello, I have a question about my order");
```

## 🎯 Key Features to Highlight

1. **Real-time Communication**: Messages update every 5 seconds
2. **Unread Tracking**: Know when you have new messages
3. **Conversation History**: All messages saved permanently
4. **Easy Access**: Chat button in navbar and on relevant pages
5. **Mobile Friendly**: Responsive design works on all devices
6. **Professional**: Clean, modern interface for business communication

## 🔮 Future Enhancements

- [ ] WebSocket for instant messaging
- [ ] Push notifications
- [ ] Voice messages
- [ ] Video calls
- [ ] Group chats
- [ ] Message reactions
- [ ] Message editing/deletion
- [ ] Chat templates (quick replies)
- [ ] AI-powered suggestions
- [ ] Translation support

## 📝 Next Steps

1. Create ChatButton component
2. Create chat UI components
3. Create chat pages
4. Integrate with existing pages
5. Test end-to-end flow
6. Add polish and animations

This implementation will provide a complete, professional chat system for your B2B marketplace!
