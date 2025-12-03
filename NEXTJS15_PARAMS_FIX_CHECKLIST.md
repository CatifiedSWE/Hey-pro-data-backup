# Next.js 15 Params Fix Checklist

## Issue Description
In Next.js 15, `params` in API route handlers is now a Promise that must be awaited.

**Before (Incorrect):**
```typescript
{ params }: { params: { id: string } }
const id = params.id;
```

**After (Correct):**
```typescript
{ params }: { params: Promise<{ id: string }> }
const { id } = await params;
```

---

## Files to Fix: 48 Total

### Applications API (1 file)
- [ ] `/app/app/api/applications/[id]/route.ts`

### Availability API (1 file)
- [ ] `/app/app/api/availability/[id]/route.ts`

### Chat API (5 files)
- [ ] `/app/app/api/chat/conversations/[conversationId]/messages/route.ts`
- [ ] `/app/app/api/chat/conversations/[conversationId]/route.ts`
- [ ] `/app/app/api/chat/groups/[groupId]/members/[userId]/route.ts`
- [ ] `/app/app/api/chat/groups/[groupId]/members/route.ts`
- [ ] `/app/app/api/chat/groups/[groupId]/messages/route.ts`
- [ ] `/app/app/api/chat/groups/[groupId]/route.ts`
- [ ] `/app/app/api/chat/messages/[messageId]/read/route.ts`

### Collab API (9 files)
- [ ] `/app/app/api/collab/[id]/close/route.ts`
- [ ] `/app/app/api/collab/[id]/collaborators/[userId]/route.ts`
- [ ] `/app/app/api/collab/[id]/collaborators/route.ts`
- [ ] `/app/app/api/collab/[id]/comments/[commentId]/route.ts`
- [ ] `/app/app/api/collab/[id]/comments/route.ts`
- [ ] `/app/app/api/collab/[id]/interest/route.ts`
- [ ] `/app/app/api/collab/[id]/interests/route.ts`
- [ ] `/app/app/api/collab/[id]/route.ts`
- [ ] `/app/app/api/collab/[id]/save/route.ts`
- [ ] `/app/app/api/collab/[id]/share/route.ts`

### Contacts API (2 files)
- [ ] `/app/app/api/contacts/[id]/route.ts`
- [ ] `/app/app/api/contacts/gig/[gigId]/route.ts`

### Explore API (1 file)
- [ ] `/app/app/api/explore/[userId]/route.ts`

### Gigs API (5 files) ⭐ PRIMARY ISSUE
- [ ] `/app/app/api/gigs/[id]/applications/[applicationId]/status/route.ts` ⚠️ **MAIN BUG**
- [ ] `/app/app/api/gigs/[id]/applications/route.ts`
- [ ] `/app/app/api/gigs/[id]/apply/route.ts`
- [ ] `/app/app/api/gigs/[id]/availability/route.ts`
- [ ] `/app/app/api/gigs/[id]/route.ts`
- [ ] `/app/app/api/gigs/slug/[slug]/route.ts`

### Notifications API (1 file)
- [ ] `/app/app/api/notifications/[id]/read/route.ts`

### Projects API (7 files)
- [ ] `/app/app/api/projects/[id]/files/[fileId]/route.ts`
- [ ] `/app/app/api/projects/[id]/files/route.ts`
- [ ] `/app/app/api/projects/[id]/links/[linkId]/route.ts`
- [ ] `/app/app/api/projects/[id]/links/route.ts`
- [ ] `/app/app/api/projects/[id]/route.ts`
- [ ] `/app/app/api/projects/[id]/team/[userId]/route.ts`
- [ ] `/app/app/api/projects/[id]/team/route.ts`

### Skills API (1 file)
- [ ] `/app/app/api/skills/[id]/route.ts`

### Slate API (7 files)
- [ ] `/app/app/api/slate/[id]/comment/route.ts`
- [ ] `/app/app/api/slate/[id]/like/route.ts`
- [ ] `/app/app/api/slate/[id]/likes/route.ts`
- [ ] `/app/app/api/slate/[id]/route.ts`
- [ ] `/app/app/api/slate/[id]/save/route.ts`
- [ ] `/app/app/api/slate/[id]/share/route.ts`
- [ ] `/app/app/api/slate/comment/[commentId]/route.ts`

### What's On API (5 files)
- [ ] `/app/app/api/whatson/[id]/route.ts`
- [ ] `/app/app/api/whatson/[id]/rsvp/export/route.ts`
- [ ] `/app/app/api/whatson/[id]/rsvp/list/route.ts`
- [ ] `/app/app/api/whatson/[id]/rsvp/route.ts`
- [ ] `/app/app/api/whatson/[id]/save/route.ts`

---

## Progress
- **Total Files:** 48
- **Fixed:** 0
- **Remaining:** 48
- **Status:** 🔴 Not Started

---

## Testing Checklist
After all fixes:
- [ ] Test ApplicationTab component (manage-gigs page)
- [ ] Test gigs API endpoints
- [ ] Test collab API endpoints
- [ ] Test slate API endpoints
- [ ] Test chat API endpoints
- [ ] Test projects API endpoints
- [ ] Test whatson API endpoints
- [ ] Check browser console for errors
- [ ] Verify no "API Error: {}" messages

---

**Last Updated:** Starting now
**Started:** $(date)
**Estimated Completion:** ~30-45 minutes
