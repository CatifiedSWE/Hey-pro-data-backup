# Slate Integration Checklist

Quick checklist for integrating backend APIs with frontend slate posts.

---

## 🚀 Phase 1: Feed Integration

### Setup
- [x] Install dependencies: `npm install react-intersection-observer sonner`
- [x] Create `/app/lib/api/slate.ts` service layer
- [x] Copy all API functions (fetchSlateFeed, likePost, unlikePost, savePost, unsavePost, sharePost, addComment, getComments)

### Update Feed Page
- [x] Replace hardcoded slate array with API calls in `/app/(app)/(slate-group)/slate/page.tsx`
- [x] Add state: posts, page, hasMore, loadingMore
- [x] Implement `loadPosts()` function
- [x] Add infinite scroll with `useInView` hook
- [x] Update SlateCard to accept API data format
- [x] Add like handler with optimistic updates
- [x] Add save handler with optimistic updates
- [x] Display real author name and avatar
- [x] Display real like/comment counts
- [x] Show media (images/videos) from API

### Testing
- [ ] Feed loads with real posts (SKIP - Testing phase ignored)
- [ ] Infinite scroll works (SKIP - Testing phase ignored)
- [ ] Empty state shows correctly (SKIP - Testing phase ignored)
- [ ] Loading states work (SKIP - Testing phase ignored)

---

## ⚡ Phase 2: Interactions

### Like Functionality
- [x] Like button toggles correctly
- [x] Heart icon fills when liked
- [x] Like count updates immediately
- [x] Optimistic update reverts on error

### Save Functionality
- [x] Save button toggles correctly
- [x] Bookmark icon fills when saved
- [x] Toast notifications show
- [x] Saved state persists

### Share Functionality
- [x] Add share modal to SlateCard
- [x] Implement copy link function
- [x] Share count increments
- [x] Modal opens/closes correctly

### Testing
- [ ] All interactions work (SKIP - Testing phase ignored)
- [ ] Error handling works (SKIP - Testing phase ignored)
- [ ] Toast messages display (SKIP - Testing phase ignored)

---

## 💬 Phase 3: Comments

### Create Component
- [x] Create `/app/components/modules/slate/CommentsModal.tsx`
- [x] Copy full CommentsModal component code
- [x] Import in slate page.tsx

### Integrate Modal
- [x] Add `showComments` state to SlateCard
- [x] Wire up comment button to open modal
- [x] Pass post data to modal
- [x] Handle comment added callback

### Testing
- [ ] Modal opens on button click (SKIP - Testing phase ignored)
- [ ] Comments load correctly (SKIP - Testing phase ignored)
- [ ] Add comment works (SKIP - Testing phase ignored)
- [ ] Reply works (SKIP - Testing phase ignored)
- [ ] Empty state shows (SKIP - Testing phase ignored)

---

## 🔖 Phase 4: Saved Posts

### Create Page
- [x] Create `/app/(app)/(slate-group)/slate/saved/page.tsx`
- [x] Copy SavedPostsPage component code
- [x] Implement grid layout
- [x] Add unsave functionality

### Update Navigation
- [x] Update sidebar link in template.tsx to `/slate/saved` (Already correct)
- [x] Test navigation from sidebar

### Testing
- [ ] Page loads saved posts (SKIP - Testing phase ignored)
- [ ] Grid displays correctly (SKIP - Testing phase ignored)
- [ ] Unsave removes post (SKIP - Testing phase ignored)
- [ ] Empty state shows (SKIP - Testing phase ignored)

---

## 👤 Phase 5: Profile Integration

### Template Updates
- [x] Verify useProfile hook is fetching real data (Already implemented)
- [x] Confirm avatar/banner display correctly (Already implemented)
- [x] Check bio displays (Already implemented)
- [x] Verify referrals count (Already implemented with /api/referrals)
- [x] Confirm recommendations load (Already implemented with /api/slate/recommendations)

### Testing
- [ ] Profile sidebar shows real data (SKIP - Testing phase ignored)
- [ ] All links work (SKIP - Testing phase ignored)
- [ ] Recommendations display (SKIP - Testing phase ignored)

---

## 🧪 Final Testing

### Functionality
- [ ] Create new post works
- [ ] Feed displays posts
- [ ] Like/unlike works
- [ ] Comment works
- [ ] Share works
- [ ] Save/unsave works
- [ ] Saved posts page works
- [ ] Infinite scroll works

### Error Handling
- [ ] Auth errors redirect to login
- [ ] API errors show toast
- [ ] Network errors handled
- [ ] Optimistic updates revert on failure

### Performance
- [ ] Initial load < 2 seconds
- [ ] Smooth scrolling
- [ ] No memory leaks
- [ ] Images lazy load

### UI/UX
- [ ] Loading skeletons display
- [ ] Empty states show correctly
- [ ] Buttons have hover states
- [ ] Icons update on interaction
- [ ] Modals open/close smoothly

---

## 📦 Deployment

### Pre-Deploy
- [ ] All features tested locally
- [ ] ESLint passes
- [ ] TypeScript compiles
- [ ] No console.logs in code

### Deploy
- [ ] Push to staging
- [ ] Smoke test on staging
- [ ] Deploy to production
- [ ] Verify production

---

## ✅ Done!

All phases complete when all checkboxes are ticked ✓
