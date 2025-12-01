# Chat Module - Backend Documentation

> **Module:** Real-time Messaging System (1-on-1 & Group Chat)
> **Version:** 1.0.0
> **Last Updated:** January 2025

---

## Overview

This module provides a comprehensive messaging system for the HeyProData platform, supporting both direct (1-on-1) conversations and group chats with rich features including:

- **Direct Messaging**: Private conversations between two users
- **Group Chats**: Multi-user group conversations with member management
- **Rich Messages**: Text content with attachment support (images, files, videos)
- **Read Receipts**: Delivery and read status tracking
- **Typing Indicators**: Real-time typing status
- **Unread Counts**: Track unread messages per conversation/group

---

## Database Schema

### Tables Created

1. **conversations** - 1-on-1 chat metadata
2. **group_chats** - Group chat metadata
3. **group_members** - Group membership
4. **messages** - All messages (both direct and group)
5. **message_read_status** - Read receipts for group messages
6. **typing_indicators** - Typing status tracking

### Relationships

```
user_profiles (existing)
    |
    |-- conversations (user1_id, user2_id)
    |       |
    |       |-- messages (conversation_id)
    |
    |-- group_chats (created_by)
    |       |
    |       |-- group_members (user_id, group_id)
    |       |-- messages (group_id)
    |
    |-- messages (sender_id)
            |
            |-- message_read_status (message_id, user_id)
```

---

## API Endpoints

### Conversations (1-on-1 Chat)

#### 1. List Conversations
```
GET /api/chat/conversations
Authentication: Required
Description: Get all conversations for the current user
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "avatar": "url",
          "status": "online"
        },
        "lastMessage": {
          "content": "Hello!",
          "timestamp": "2025-01-15T10:00:00Z",
          "senderId": "uuid"
        },
        "unreadCount": 3
      }
    ]
  }
}
```

#### 2. Start/Get Conversation
```
POST /api/chat/conversations
Authentication: Required
Description: Start a new conversation or get existing one
```

**Request:**
```json
{
  "participantId": "uuid"
}
```

#### 3. Get Conversation Messages
```
GET /api/chat/conversations/[conversationId]/messages?page=1&limit=50
Authentication: Required
Description: Get messages for a specific conversation
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "senderId": "uuid",
        "content": "Hello!",
        "attachmentUrl": null,
        "attachmentType": null,
        "status": "read",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "hasMore": true
    }
  }
}
```

#### 4. Send Message
```
POST /api/chat/conversations/[conversationId]/messages
Authentication: Required
Description: Send a message in a conversation
```

**Request:**
```json
{
  "content": "Hello!",
  "attachmentUrl": "https://...",
  "attachmentType": "image"
}
```

---

### Group Chats

#### 5. List Groups
```
GET /api/chat/groups
Authentication: Required
Description: Get all groups the user is a member of
```

#### 6. Create Group
```
POST /api/chat/groups
Authentication: Required
Description: Create a new group chat
```

**Request:**
```json
{
  "name": "Photography Lovers",
  "description": "A group for photography enthusiasts",
  "avatarUrls": ["/image1.png", "/image2.png"],
  "memberIds": ["uuid1", "uuid2", "uuid3"]
}
```

#### 7. Get Group Details
```
GET /api/chat/groups/[groupId]
Authentication: Required
Description: Get group details including members
```

#### 8. Update Group
```
PATCH /api/chat/groups/[groupId]
Authentication: Required (Admin only)
Description: Update group details
```

#### 9. Get Group Messages
```
GET /api/chat/groups/[groupId]/messages?page=1&limit=50
Authentication: Required
Description: Get messages for a group
```

#### 10. Send Group Message
```
POST /api/chat/groups/[groupId]/messages
Authentication: Required
Description: Send a message in a group
```

#### 11. Get Group Members
```
GET /api/chat/groups/[groupId]/members
Authentication: Required
Description: Get all members of a group
```

#### 12. Add Group Members
```
POST /api/chat/groups/[groupId]/members
Authentication: Required (Admin only)
Description: Add members to a group
```

**Request:**
```json
{
  "memberIds": ["uuid1", "uuid2"]
}
```

#### 13. Remove Group Member
```
DELETE /api/chat/groups/[groupId]/members/[userId]
Authentication: Required (Admin only)
Description: Remove a member from a group
```

---

### Message Actions

#### 14. Mark Message as Read
```
PATCH /api/chat/messages/[messageId]/read
Authentication: Required
Description: Mark a message as read
```

#### 15. Update Typing Status
```
POST /api/chat/typing
Authentication: Required
Description: Update typing indicator
```

**Request:**
```json
{
  "conversationId": "uuid",
  "groupId": null,
  "isTyping": true
}
```

---

## Installation Steps

### 1. Run SQL Scripts

Execute the SQL scripts in order:

```bash
# 1. Create tables
psql -U postgres -d heyprodata -f 01_CREATE_TABLES.sql

# 2. Create indexes
psql -U postgres -d heyprodata -f 02_INDEXES.sql

# 3. Apply RLS policies
psql -U postgres -d heyprodata -f 03_RLS_POLICIES.sql
```

### 2. Verify Tables

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('conversations', 'group_chats', 'group_members', 'messages', 'message_read_status', 'typing_indicators');
```

### 3. Test API Endpoints

Use the provided test cases in `04_TEST_CASES.md`

---

## Features

### ✅ Implemented

- Direct messaging (1-on-1)
- Group messaging
- Message attachments (images, files, videos)
- Read receipts (delivered/read status)
- Typing indicators
- Unread message counts
- Message pagination
- Group member management
- Soft delete for messages

### 🚧 Future Enhancements

- Real-time updates via WebSockets/SSE
- Message reactions (emoji)
- Message replies/threading
- Voice messages
- Video messages
- Message search
- Message forwarding
- Media gallery view
- Message encryption

---

## Security

### Row Level Security (RLS)

- Users can only see their own conversations
- Users can only see groups they are members of
- Users can only send messages in conversations/groups they participate in
- Only group admins can add/remove members
- Only group admins can update group details

### Data Privacy

- Messages are soft-deleted (deleted_at timestamp)
- User data is protected via RLS policies
- Attachments use secure URLs from Supabase Storage

---

## Performance Considerations

### Indexes

- Composite indexes on frequently queried columns
- Indexes on foreign keys for JOIN operations
- Index on timestamps for sorting

### Pagination

- Messages are paginated (default 50 per page)
- Cursor-based pagination for efficient scrolling

### Caching

- Consider caching conversation lists
- Cache unread counts
- Cache typing indicators (short TTL)

---

## Troubleshooting

### Common Issues

1. **Cannot send messages**: Check RLS policies
2. **Messages not showing**: Verify conversation/group membership
3. **Unread counts incorrect**: Run integrity check query
4. **Slow queries**: Check index usage with EXPLAIN ANALYZE

---

## Support

For issues or questions, refer to:
- API Documentation: `/documentation/API-Docs/API_DOC.md`
- Implementation Guide: `05_IMPLEMENTATION_GUIDE.md`
