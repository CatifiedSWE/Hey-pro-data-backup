# Chat Module - Quick Start Guide

> **For:** Developers working with the chat module  
> **Last Updated:** January 2025

---

## 🚀 Quick Start

### Using Chat APIs in Your Component

```typescript
import { 
    getConversations, 
    getConversationMessages, 
    sendConversationMessage 
} from '@/lib/api/chat';

// In your component
const [conversations, setConversations] = useState([]);
const [messages, setMessages] = useState([]);

// Fetch conversations
useEffect(() => {
    async function fetchData() {
        const data = await getConversations();
        setConversations(data);
    }
    fetchData();
}, []);

// Fetch messages for a conversation
useEffect(() => {
    async function fetchMessages() {
        const { messages } = await getConversationMessages(conversationId);
        setMessages(messages);
    }
    fetchMessages();
}, [conversationId]);

// Send a message
async function handleSend() {
    const newMessage = await sendConversationMessage(
        conversationId,
        'Hello!',
    );
    setMessages([...messages, newMessage]);
}
```

---

## 📁 File Structure

```
/app/
├── lib/api/chat.ts                           # API helper functions
├── app/(app)/(chat)/
│   ├── template.tsx                          # Chat/Groups list sidebar
│   └── inbox/
│       ├── page.tsx                          # Empty state
│       ├── c/[id]/page.tsx                   # Conversation page
│       └── g/[id]/page.tsx                   # Group page
└── documentation/backend-documentation-and-commands/chat/
    ├── 00_SUMMARY.md                         # Overview
    ├── 01_CREATE_TABLES.sql                  # Database tables
    ├── 02_INDEXES.sql                        # Database indexes
    ├── 03_RLS_POLICIES.sql                   # Security policies
    ├── 04_IMPLEMENTATION_GUIDE.md            # Backend guide
    ├── FRONTEND_INTEGRATION.md               # Frontend guide
    ├── IMPLEMENTATION_SUMMARY.md             # What was changed
    └── QUICKSTART.md                         # This file
```

---

## 🔧 Common Tasks

### 1. Add Real-Time Polling

```typescript
useEffect(() => {
    const interval = setInterval(async () => {
        const data = await getConversations();
        setConversations(data);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
}, []);
```

### 2. Implement Infinite Scroll

```typescript
const scrollRef = useRef<HTMLDivElement>(null);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(false);

const handleScroll = useCallback(() => {
    if (scrollRef.current && hasMore) {
        const { scrollTop } = scrollRef.current;
        if (scrollTop < 100) {
            loadMoreMessages();
        }
    }
}, [hasMore]);

async function loadMoreMessages() {
    const { messages, pagination } = await getConversationMessages(
        conversationId,
        page + 1
    );
    setMessages(prev => [...messages, ...prev]); // Prepend older messages
    setPage(page + 1);
    setHasMore(pagination.hasMore);
}

<div ref={scrollRef} onScroll={handleScroll}>
    {/* Messages */}
</div>
```

### 3. Optimistic UI Updates

```typescript
async function handleSend() {
    // Create temporary message
    const tempMessage = {
        id: `temp-${Date.now()}`,
        content: message,
        sender_id: user?.id,
        created_at: new Date().toISOString(),
    };

    // Show immediately
    setMessages([...messages, tempMessage]);

    try {
        // Send to server
        const realMessage = await sendConversationMessage(
            conversationId,
            message
        );

        // Replace temp with real
        setMessages(prev =>
            prev.map(msg => msg.id === tempMessage.id ? realMessage : msg)
        );
    } catch (error) {
        // Remove temp on error
        setMessages(prev =>
            prev.filter(msg => msg.id !== tempMessage.id)
        );
    }
}
```

### 4. Handle Errors Gracefully

```typescript
const [error, setError] = useState<string | null>(null);

async function fetchData() {
    try {
        setError(null);
        const data = await getConversations();
        setConversations(data);
    } catch (err) {
        setError('Failed to load conversations');
        console.error(err);
    }
}

// In render
{error && (
    <div>
        <p>{error}</p>
        <button onClick={fetchData}>Retry</button>
    </div>
)}
```

---

## 📚 API Reference

### Conversations

```typescript
// Get all conversations
getConversations(): Promise<Conversation[]>

// Start or get conversation
startConversation(participantId: string): Promise<any>

// Get messages (with pagination)
getConversationMessages(
    conversationId: string,
    page?: number,
    limit?: number
): Promise<{
    messages: Message[],
    pagination: PaginationInfo
}>

// Send message
sendConversationMessage(
    conversationId: string,
    content: string,
    attachmentUrl?: string,
    attachmentType?: string
): Promise<Message>
```

### Groups

```typescript
// Get all groups
getGroups(): Promise<Group[]>

// Get group messages (with pagination)
getGroupMessages(
    groupId: string,
    page?: number,
    limit?: number
): Promise<{
    messages: Message[],
    pagination: PaginationInfo
}>

// Send group message
sendGroupMessage(
    groupId: string,
    content: string,
    attachmentUrl?: string,
    attachmentType?: string
): Promise<Message>

// Create group
createGroup(
    name: string,
    description?: string,
    avatarUrls?: string[],
    memberIds?: string[]
): Promise<any>
```

---

## 🎯 Best Practices

### 1. Always Handle Loading States

```typescript
const [loading, setLoading] = useState(true);

async function fetchData() {
    setLoading(true);
    try {
        const data = await getConversations();
        setConversations(data);
    } finally {
        setLoading(false);
    }
}

{loading ? <Spinner /> : <ConversationList />}
```

### 2. Clean Up Intervals

```typescript
useEffect(() => {
    const interval = setInterval(pollData, 5000);
    return () => clearInterval(interval); // Clean up!
}, []);
```

### 3. Use TypeScript Types

```typescript
import type { Conversation, Message, Group } from '@/lib/api/chat';

const [conversations, setConversations] = useState<Conversation[]>([]);
const [messages, setMessages] = useState<Message[]>([]);
```

### 4. Handle Errors

```typescript
try {
    await sendMessage(conversationId, content);
} catch (error) {
    console.error('Send failed:', error);
    alert('Failed to send message');
}
```

---

## 🐛 Troubleshooting

### Messages Not Loading

**Check:**
1. User is authenticated (`useAuth()`)
2. Conversation ID is valid
3. User has access to conversation (RLS policies)
4. API endpoint is working (network tab)

**Debug:**
```typescript
console.log('Fetching messages for:', conversationId);
console.log('User:', user?.id);
const data = await getConversationMessages(conversationId);
console.log('Received:', data);
```

### Polling Not Working

**Check:**
1. Interval is running (add console.log)
2. Component is still mounted
3. Interval is cleaned up properly

**Debug:**
```typescript
useEffect(() => {
    console.log('Starting poll');
    const interval = setInterval(() => {
        console.log('Polling...');
        fetchData();
    }, 5000);
    return () => {
        console.log('Stopping poll');
        clearInterval(interval);
    };
}, []);
```

### Authentication Errors

**Check:**
1. User is logged in
2. Token is valid
3. RLS policies allow access

**Debug:**
```typescript
const { user } = useAuth();
console.log('Current user:', user);

// Check axios headers
import axios from '@/lib/axios';
console.log('Axios config:', axios.defaults);
```

---

## 📖 Learn More

- **Backend Guide:** `04_IMPLEMENTATION_GUIDE.md`
- **Frontend Integration:** `FRONTEND_INTEGRATION.md`
- **Full Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Database Schema:** `01_CREATE_TABLES.sql`

---

## 💡 Examples

### Complete Conversation Component

```typescript
'use client';
import { useState, useEffect } from 'react';
import { getConversationMessages, sendConversationMessage } from '@/lib/api/chat';
import { useAuth } from '@/contexts/AuthContext';

export default function ConversationPage({ conversationId }: { conversationId: string }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch messages
    useEffect(() => {
        async function fetch() {
            const { messages } = await getConversationMessages(conversationId);
            setMessages(messages);
            setLoading(false);
        }
        fetch();
    }, [conversationId]);

    // Poll for new messages
    useEffect(() => {
        const interval = setInterval(async () => {
            const { messages } = await getConversationMessages(conversationId);
            setMessages(messages);
        }, 3000);
        return () => clearInterval(interval);
    }, [conversationId]);

    // Send message
    async function handleSend() {
        if (!input.trim()) return;
        const newMsg = await sendConversationMessage(conversationId, input);
        setMessages([...messages, newMsg]);
        setInput('');
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="messages">
                {messages.map(msg => (
                    <div key={msg.id} className={msg.sender_id === user?.id ? 'sent' : 'received'}>
                        {msg.content}
                    </div>
                ))}
            </div>
            <div className="input">
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
}
```

---

## ⚡ Performance Tips

1. **Use pagination** - Don't load all messages at once
2. **Implement virtual scrolling** - For very long chats
3. **Debounce polling** - Don't poll too frequently
4. **Clean up intervals** - Prevent memory leaks
5. **Use optimistic updates** - For better UX

---

## 🔒 Security Notes

- All API calls are authenticated automatically
- RLS policies enforce access control
- Users can only see their own conversations
- Group access is verified server-side

---

## ✅ Checklist for New Features

- [ ] Add loading state
- [ ] Add error handling
- [ ] Clean up intervals/subscriptions
- [ ] Add TypeScript types
- [ ] Test on mobile
- [ ] Test error scenarios
- [ ] Add documentation

---

**Need Help?**
- Check `FRONTEND_INTEGRATION.md` for detailed guide
- Check `IMPLEMENTATION_SUMMARY.md` for overview
- Check API endpoints in `/app/api/chat/`

---

**Last Updated:** January 2025
