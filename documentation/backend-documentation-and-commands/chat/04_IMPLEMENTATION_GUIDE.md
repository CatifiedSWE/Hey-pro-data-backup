# Chat Module - Implementation Guide

> **Document Version:** 1.0.0  
> **Last Updated:** January 2025  
> **Purpose:** Step-by-step guide for implementing chat backend APIs

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [API Implementation](#api-implementation)
4. [Helper Functions](#helper-functions)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## Prerequisites

### Required Dependencies

The project already has these dependencies:
- Next.js 15.5.4 (App Router)
- Supabase client
- TypeScript 5
- Authentication middleware

### Environment Variables

Ensure these are set in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Database Setup

### Step 1: Execute SQL Scripts

Run the SQL scripts in your Supabase SQL Editor or via psql:

```bash
# Connect to your database
psql -U postgres -d your_database_name

# Execute scripts in order
\i /path/to/01_CREATE_TABLES.sql
\i /path/to/02_INDEXES.sql
\i /path/to/03_RLS_POLICIES.sql
```

### Step 2: Verify Tables

```sql
-- Check if all tables exist
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns 
        WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'conversations',
    'group_chats',
    'group_members',
    'messages',
    'message_read_status',
    'typing_indicators'
  )
ORDER BY table_name;
```

Expected output: 6 tables with their column counts.

### Step 3: Test RLS Policies

```sql
-- Verify RLS is enabled
SELECT tablename, 
       rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'conversations',
    'group_chats',
    'group_members',
    'messages',
    'message_read_status',
    'typing_indicators'
  );
```

---

## API Implementation

### Directory Structure

Create the following API route structure:

```
app/api/chat/
├── conversations/
│   ├── route.ts                    # GET, POST
│   └── [conversationId]/
│       ├── route.ts                # GET
│       └── messages/
│           └── route.ts            # GET, POST
├── groups/
│   ├── route.ts                    # GET, POST
│   └── [groupId]/
│       ├── route.ts                # GET, PATCH, DELETE
│       ├── messages/
│       │   └── route.ts            # GET, POST
│       └── members/
│           ├── route.ts            # GET, POST
│           └── [userId]/
│               └── route.ts        # DELETE
├── messages/
│   └── [messageId]/
│       └── read/
│           └── route.ts            # PATCH
└── typing/
    └── route.ts                    # POST
```

### Implementation Pattern

All routes follow this pattern:

```typescript
// app/api/chat/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);
    
    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    // 2. Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Execute query
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        errorResponse('Database error', error.message),
        { status: 500 }
      );
    }

    // 4. Return response
    return NextResponse.json(
      successResponse('Success message', data)
    );

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
```

---

## API Route Implementations

### 1. List Conversations

**File:** `app/api/chat/conversations/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const user = await validateAuthToken(authHeader);
  
  if (!user) {
    return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get conversations where user is participant
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      id,
      user1_id,
      user2_id,
      last_message_at,
      last_message:messages!conversations_last_message_id_fkey (
        content,
        created_at,
        sender_id
      )
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json(errorResponse('Failed to fetch conversations', error.message), { status: 500 });
  }

  // Get other participant's details and unread count for each conversation
  const enrichedConversations = await Promise.all(
    conversations.map(async (conv) => {
      const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
      
      // Fetch other user's profile
      const { data: otherUser } = await supabase
        .from('user_profiles')
        .select('id, first_name, surname, profile_photo_url')
        .eq('user_id', otherUserId)
        .single();

      // Count unread messages
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', user.id)
        .neq('status', 'read');

      return {
        id: conv.id,
        user: {
          id: otherUserId,
          name: otherUser ? `${otherUser.first_name} ${otherUser.surname}` : 'Unknown',
          avatar: otherUser?.profile_photo_url || null,
        },
        lastMessage: conv.last_message,
        unreadCount: count || 0,
      };
    })
  );

  return NextResponse.json(successResponse('Conversations retrieved', { conversations: enrichedConversations }));
}
```

### 2. Start/Get Conversation

```typescript
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const user = await validateAuthToken(authHeader);
  
  if (!user) {
    return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
  }

  const body = await request.json();
  const { participantId } = body;

  if (!participantId) {
    return NextResponse.json(errorResponse('participantId is required'), { status: 400 });
  }

  if (participantId === user.id) {
    return NextResponse.json(errorResponse('Cannot create conversation with yourself'), { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Ensure user1_id < user2_id for consistency
  const [user1Id, user2Id] = [user.id, participantId].sort();

  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('user1_id', user1Id)
    .eq('user2_id', user2Id)
    .single();

  if (existing) {
    return NextResponse.json(successResponse('Conversation already exists', existing));
  }

  // Create new conversation
  const { data: newConversation, error } = await supabase
    .from('conversations')
    .insert({
      user1_id: user1Id,
      user2_id: user2Id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(errorResponse('Failed to create conversation', error.message), { status: 500 });
  }

  return NextResponse.json(successResponse('Conversation created', newConversation), { status: 201 });
}
```

### 3. Send Message

**File:** `app/api/chat/conversations/[conversationId]/messages/route.ts`

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  const authHeader = request.headers.get('Authorization');
  const user = await validateAuthToken(authHeader);
  
  if (!user) {
    return NextResponse.json(errorResponse('Authentication required'), { status: 401 });
  }

  const { conversationId } = params;
  const body = await request.json();
  const { content, attachmentUrl, attachmentType } = body;

  if (!content || content.trim().length === 0) {
    return NextResponse.json(errorResponse('Message content is required'), { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verify user is part of conversation
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (!conversation || (conversation.user1_id !== user.id && conversation.user2_id !== user.id)) {
    return NextResponse.json(errorResponse('Conversation not found or access denied'), { status: 404 });
  }

  // Insert message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
      attachment_url: attachmentUrl || null,
      attachment_type: attachmentType || null,
      status: 'sent',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(errorResponse('Failed to send message', error.message), { status: 500 });
  }

  // Update conversation's last_message_at
  await supabase
    .from('conversations')
    .update({
      last_message_id: message.id,
      last_message_at: message.created_at,
    })
    .eq('id', conversationId);

  return NextResponse.json(successResponse('Message sent', message), { status: 201 });
}
```

---

## Helper Functions

### Create Notification Helper

Add this to your notification system:

```typescript
// lib/notifications/chat.ts
export async function notifyNewMessage(
  recipientId: string,
  senderId: string,
  messageContent: string,
  conversationId?: string,
  groupId?: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.from('notifications').insert({
    user_id: recipientId,
    actor_id: senderId,
    type: groupId ? 'group_message' : 'direct_message',
    message: messageContent.substring(0, 100),
    metadata: {
      conversation_id: conversationId,
      group_id: groupId,
    },
  });
}
```

---

## Testing

### Manual Testing with curl

```bash
# Get authentication token first
TOKEN="your_auth_token"

# 1. List conversations
curl -X GET http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN"

# 2. Start a conversation
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"participantId": "user-uuid"}'

# 3. Send a message
curl -X POST http://localhost:3000/api/chat/conversations/{conversationId}/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello!"}'
```

### Integration Testing

Refer to `05_TEST_CASES.md` for comprehensive test scenarios.

---

## Deployment Checklist

- [ ] Database tables created
- [ ] Indexes applied
- [ ] RLS policies enabled
- [ ] API routes implemented
- [ ] Helper functions added
- [ ] Frontend updated to use new APIs
- [ ] Testing completed
- [ ] Documentation updated
- [ ] Environment variables set in production

---

## Next Steps

1. Implement remaining API endpoints (groups, typing indicators)
2. Update frontend to use real APIs instead of mock data
3. Add real-time updates (WebSockets/Polling)
4. Implement message reactions and replies
5. Add media upload functionality

---

## Support

For issues or questions:
- Check API documentation: `/documentation/API-Docs/API_DOC.md`
- Review test cases: `05_TEST_CASES.md`
- Contact development team
