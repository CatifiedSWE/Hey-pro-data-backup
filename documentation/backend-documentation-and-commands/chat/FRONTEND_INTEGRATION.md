# Chat Module - Frontend Integration Documentation

> **Document Version:** 1.0.0  
> **Last Updated:** January 2025  
> **Purpose:** Documentation of chat frontend integration with real-time database

---

## Overview

This document details the integration of the chat frontend with the Supabase database backend, replacing dummy data with real-time API calls.

---

## Changes Summary

### Files Modified

1. **`/app/lib/api/chat.ts`** (NEW)
   - Created comprehensive API helper functions for all chat operations
   - Handles authentication, error handling, and type safety

2. **`/app/app/(app)/(chat)/template.tsx`**
   - Replaced dummy data imports with real API calls
   - Added real-time polling (every 5 seconds) for conversations and groups
   - Added loading states and error handling
   - Preserved original UI/UX

3. **`/app/app/(app)/(chat)/inbox/c/[id]/page.tsx`**
   - Replaced dummy conversation messages with real API data
   - Implemented infinite scroll for message history (WhatsApp-style)
   - Added real-time polling (every 3 seconds) for new messages
   - Implemented optimistic UI updates for message sending
   - Added proper error handling and loading states

4. **`/app/app/(app)/(chat)/inbox/g/[id]/page.tsx`**
   - Replaced dummy group messages with real API data
   - Implemented infinite scroll for message history
   - Added real-time polling for new messages
   - Implemented optimistic UI updates
   - Added proper error handling and loading states

---

## API Helper Functions (`/app/lib/api/chat.ts`)

### Conversations

```typescript
// Get all conversations for current user
getConversations(): Promise<Conversation[]>

// Start a new conversation or get existing one
startConversation(participantId: string): Promise<any>

// Get messages for a conversation (with pagination)
getConversationMessages(conversationId: string, page?: number, limit?: number): Promise<{messages: Message[], pagination: PaginationInfo}>

// Send a message in a conversation
sendConversationMessage(conversationId: string, content: string, attachmentUrl?: string, attachmentType?: string): Promise<Message>
```

### Groups

```typescript
// Get all groups for current user
getGroups(): Promise<Group[]>

// Get messages for a group (with pagination)
getGroupMessages(groupId: string, page?: number, limit?: number): Promise<{messages: Message[], pagination: PaginationInfo}>

// Send a message in a group
sendGroupMessage(groupId: string, content: string, attachmentUrl?: string, attachmentType?: string): Promise<Message>

// Create a new group
createGroup(name: string, description?: string, avatarUrls?: string[], memberIds?: string[]): Promise<any>
```

### Utilities

```typescript
// Mark a message as read
markMessageAsRead(messageId: string): Promise<void>

// Send typing indicator
sendTypingIndicator(conversationId?: string, groupId?: string): Promise<void>
```

---

## Features Implemented

### 1. Real-Time Updates

**Conversations & Groups List (template.tsx)**
- Polls every 5 seconds for new conversations/groups
- Updates list automatically when new messages arrive
- Updates unread counts in real-time

**Message Pages (c/[id] and g/[id])**
- Polls every 3 seconds for new messages
- Auto-scrolls to bottom when new messages arrive
- Preserves scroll position when loading older messages

### 2. Infinite Scroll (WhatsApp-Style)

**Implementation:**
- Loads 50 messages initially
- Detects scroll position near top (< 100px)
- Automatically loads older messages
- Prepends older messages to maintain scroll position
- Shows loading indicator while fetching

**Usage:**
```typescript
const handleScroll = useCallback(() => {
    if (scrollRef.current && hasMore && !loadingMore) {
        const { scrollTop } = scrollRef.current;
        if (scrollTop < 100) {
            fetchMessages(page + 1, true);
        }
    }
}, [hasMore, loadingMore, page, fetchMessages]);
```

### 3. Optimistic UI Updates

**Message Sending:**
- Immediately displays sent message (optimistic update)
- Shows message in UI before server confirmation
- Replaces temporary message with server response
- Removes message if sending fails
- Provides instant feedback to user

**Example:**
```typescript
const optimisticMessage: Message = {
    id: `temp-${Date.now()}`,
    conversation_id: id,
    sender_id: user?.id || '',
    content: message.trim(),
    status: 'sent',
    created_at: new Date().toISOString(),
};

setMessages(prev => [...prev, optimisticMessage]);

// Send to server
const sentMessage = await sendConversationMessage(id, message.trim());

// Replace optimistic with real
setMessages(prev => 
    prev.map(msg => msg.id === optimisticMessage.id ? sentMessage : msg)
);
```

### 4. Loading States

**List View:**
- Spinner while loading conversations/groups
- Skeleton screens for empty states
- Error messages with retry button

**Message View:**
- Full-page spinner on initial load
- Small spinner when loading older messages (infinite scroll)
- Disabled input while sending

### 5. Error Handling

**Network Errors:**
- Graceful error messages
- Retry functionality
- Preserves existing data on error

**Message Send Failures:**
- Removes optimistic message
- Shows alert to user
- Maintains input state

---

## Data Flow

### Conversations List

```
User opens /inbox
  ↓
template.tsx mounts
  ↓
useEffect calls getConversations() and getGroups()
  ↓
API calls /api/chat/conversations and /api/chat/groups
  ↓
Supabase returns data with user profiles, last messages, unread counts
  ↓
State updates, UI renders list
  ↓
setInterval polls every 5 seconds
  ↓
Updates list when new data arrives
```

### Conversation Messages

```
User clicks conversation
  ↓
Page mounts with conversation ID
  ↓
useEffect calls getConversationMessages(id, 1, 50)
  ↓
API calls /api/chat/conversations/[id]/messages
  ↓
Supabase returns 50 most recent messages
  ↓
State updates, messages render, auto-scroll to bottom
  ↓
setInterval polls every 3 seconds for new messages
  ↓
User scrolls to top → triggers handleScroll
  ↓
Loads page 2 (next 50 older messages)
  ↓
Prepends to existing messages
```

### Sending Message

```
User types message and clicks send
  ↓
handleSend creates optimistic message
  ↓
Message immediately appears in UI
  ↓
sendConversationMessage calls API
  ↓
API inserts message in database
  ↓
API updates conversation last_message_at
  ↓
API creates notification for recipient
  ↓
Server returns real message with ID
  ↓
Replace optimistic message with real one
  ↓
Polling picks up message on recipient's side
```

---

## Performance Optimizations

### 1. Pagination
- Loads 50 messages at a time instead of all messages
- Reduces initial load time
- Reduces memory usage

### 2. Debounced Scrolling
- Uses `useCallback` to prevent unnecessary re-renders
- Only triggers load when actually near top

### 3. Conditional Polling
- Only polls when component is mounted
- Cleans up intervals on unmount
- Compares message counts before updating state

### 4. Optimistic Updates
- Instant UI feedback
- Reduces perceived latency
- Better user experience

---

## UI/UX Preservation

All original UI/UX has been preserved:

✅ **Visual Design**
- Same gradient borders
- Same color scheme (#31A7AC, #FA596E)
- Same rounded corners and shadows
- Same font sizes and spacing

✅ **Interactions**
- Same hover effects
- Same transitions
- Same mobile responsiveness
- Same back button behavior

✅ **Message Bubbles**
- Same border radius logic
- Same sender/receiver colors
- Same timestamp display
- Same grouping logic

✅ **Layout**
- Same two-column layout (sidebar + messages)
- Same mobile behavior (hide sidebar when chat open)
- Same responsive breakpoints

---

## Testing Checklist

### Conversations List
- [ ] Conversations load on page mount
- [ ] Groups load on page mount
- [ ] Loading spinner shows initially
- [ ] Error message shows on API failure
- [ ] Retry button works
- [ ] New conversations appear automatically (polling)
- [ ] Unread counts update automatically
- [ ] Last message preview shows correctly
- [ ] Clicking conversation navigates to messages

### Conversation Messages
- [ ] Messages load on page mount
- [ ] Loading spinner shows initially
- [ ] Auto-scrolls to bottom on load
- [ ] Infinite scroll loads older messages
- [ ] Loading indicator shows when loading more
- [ ] New messages appear automatically (polling)
- [ ] Auto-scrolls to bottom on new messages
- [ ] Sending message works
- [ ] Optimistic UI shows message immediately
- [ ] Message updates after server confirmation
- [ ] Error handling works if send fails
- [ ] Enter key sends message
- [ ] Shift+Enter adds new line
- [ ] Send button disabled when empty
- [ ] Send button disabled while sending

### Group Messages
- [ ] Same as conversation messages
- [ ] Group avatar displays correctly
- [ ] Member count shows correctly

### Real-Time Updates
- [ ] New messages appear within 3 seconds
- [ ] New conversations appear within 5 seconds
- [ ] Unread counts update automatically
- [ ] Polling stops when component unmounts

### Mobile Responsiveness
- [ ] Sidebar hides when chat open
- [ ] Back button appears on mobile
- [ ] Back button works correctly
- [ ] Layout adapts to small screens
- [ ] Messages readable on mobile

---

## Known Limitations

1. **Attachments Not Implemented**
   - Paperclip button is disabled
   - Backend supports attachments but frontend doesn't upload yet
   - **Future Enhancement:** Add file upload functionality

2. **Typing Indicators Not Displayed**
   - API exists but not displayed in UI
   - **Future Enhancement:** Add "User is typing..." indicator

3. **Message Read Status Not Updated**
   - Messages marked as read on backend but not reflected in UI
   - **Future Enhancement:** Show read receipts (checkmarks)

4. **No Message Search**
   - No search functionality for messages
   - **Future Enhancement:** Add search bar

5. **No Message Reactions**
   - Backend doesn't support reactions yet
   - **Future Enhancement:** Add emoji reactions

6. **No Message Replies**
   - No threaded replies
   - **Future Enhancement:** Add reply functionality

---

## Troubleshooting

### Messages Not Loading

**Symptom:** Spinner shows indefinitely or error message appears

**Possible Causes:**
1. Authentication token expired
2. User not part of conversation/group
3. Network error
4. API endpoint down

**Solutions:**
1. Check browser console for errors
2. Verify user is logged in
3. Check API endpoint is accessible
4. Verify RLS policies in Supabase

### Messages Not Updating in Real-Time

**Symptom:** New messages don't appear until page refresh

**Possible Causes:**
1. Polling interval not running
2. API returning old data
3. React state not updating

**Solutions:**
1. Check browser console for polling errors
2. Verify setInterval is running (use debugger)
3. Check if lastMessageCount is updating
4. Verify API returns latest messages

### Infinite Scroll Not Working

**Symptom:** Scrolling to top doesn't load older messages

**Possible Causes:**
1. hasMore is false (no more messages)
2. Scroll handler not firing
3. loadingMore stuck at true
4. Page number not incrementing

**Solutions:**
1. Check pagination.hasMore in response
2. Add console.log in handleScroll
3. Check loadingMore state in React DevTools
4. Verify page state is incrementing

### Optimistic Messages Not Replaced

**Symptom:** Message shows with temp ID forever

**Possible Causes:**
1. API call failed silently
2. Message ID not matching
3. State update not triggering

**Solutions:**
1. Check network tab for API response
2. Verify temp ID format matches in map function
3. Check if error is caught and logged
4. Add console.log before/after API call

---

## Future Enhancements

### Phase 1 (High Priority)
1. ✅ Real-time data integration (DONE)
2. ✅ Infinite scroll (DONE)
3. ✅ Optimistic UI (DONE)
4. File attachments upload
5. Image preview in messages
6. Typing indicators display

### Phase 2 (Medium Priority)
1. Message search
2. Read receipts (double checkmarks)
3. Message editing
4. Message deletion
5. Group member management UI
6. Group avatar upload

### Phase 3 (Low Priority)
1. Message reactions (emojis)
2. Threaded replies
3. Voice messages
4. Video messages
5. Message forwarding
6. Chat themes

---

## Performance Metrics

### Target Metrics
- Initial load: < 2 seconds
- Message send: < 500ms (perceived)
- Infinite scroll load: < 1 second
- Polling interval: 3-5 seconds
- Memory usage: < 100MB

### Monitoring
- Use browser DevTools Performance tab
- Monitor network requests
- Check memory leaks with heap snapshots
- Test on slow 3G connection

---

## Maintenance Notes

### When to Update Polling Intervals

**Increase interval (slower polling) if:**
- Server load is high
- Users complain about battery drain
- Network bandwidth is limited

**Decrease interval (faster polling) if:**
- Real-time feel is important
- Server can handle more requests
- Users expect instant updates

**Current Settings:**
- Conversations/Groups: 5 seconds
- Messages: 3 seconds

### When to Increase Page Size

**Increase from 50 to 100 if:**
- Users frequently scroll to load more
- Server response time is fast
- Network bandwidth is good

**Decrease from 50 to 25 if:**
- Initial load is slow
- Memory usage is high
- Mobile performance suffers

---

## Code Style Guidelines

### Naming Conventions
- React hooks: `use` prefix (e.g., `useAuth`, `useMessages`)
- Event handlers: `handle` prefix (e.g., `handleSend`, `handleScroll`)
- Boolean state: `is` or `has` prefix (e.g., `isLoading`, `hasMore`)
- Async functions: `fetch` prefix (e.g., `fetchMessages`, `fetchData`)

### State Management
- Use `useState` for component-local state
- Use `useRef` for values that don't trigger re-renders
- Use `useCallback` for event handlers to prevent re-renders
- Use `useEffect` for side effects (API calls, polling)

### Error Handling
- Always wrap API calls in try-catch
- Log errors to console for debugging
- Show user-friendly error messages
- Provide retry functionality

### Type Safety
- Import types from `/app/lib/api/chat.ts`
- Use TypeScript interfaces for all data structures
- Avoid `any` types when possible
- Use optional chaining (`?.`) for nullable values

---

## Contact & Support

For questions or issues:
- Check API documentation: `04_IMPLEMENTATION_GUIDE.md`
- Review backend docs: `00_SUMMARY.md`
- Contact development team

---

**Last Updated:** January 2025  
**Maintained By:** HeyProData Development Team
