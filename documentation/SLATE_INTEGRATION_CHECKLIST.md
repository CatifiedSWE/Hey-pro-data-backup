# Slate Integration Checklist

Quick checklist for integrating backend APIs with frontend slate posts.

---

## 🚀 Phase 1: Feed Integration

### Setup
- [ ] Install dependencies: `npm install react-intersection-observer sonner`
- [ ] Create `/app/lib/api/slate.ts` service layer
- [ ] Copy all API functions (fetchSlateFeed, likePost, unlikePost, savePost, unsavePost, sharePost, addComment, getComments)

### Update Feed Page
- [ ] Replace hardcoded slate array with API calls in `/app/(app)/(slate-group)/slate/page.tsx`
- [ ] Add state: posts, page, hasMore, loadingMore
- [ ] Implement `loadPosts()` function
- [ ] Add infinite scroll with `useInView` hook
- [ ] Update SlateCard to accept API data format
- [ ] Add like handler with optimistic updates
- [ ] Add save handler with optimistic updates
- [ ] Display real author name and avatar
- [ ] Display real like/comment counts
- [ ] Show media (images/videos) from API

### Testing
- [ ] Feed loads with real posts
- [ ] Infinite scroll works
- [ ] Empty state shows correctly
- [ ] Loading states work

---

## ⚡ Phase 2: Interactions

### Like Functionality
- [ ] Like button toggles correctly
- [ ] Heart icon fills when liked
- [ ] Like count updates immediately
- [ ] Optimistic update reverts on error

### Save Functionality
- [ ] Save button toggles correctly
- [ ] Bookmark icon fills when saved
- [ ] Toast notifications show
- [ ] Saved state persists

### Share Functionality
- [ ] Add share modal to SlateCard
- [ ] Implement copy link function
- [ ] Share count increments
- [ ] Modal opens/closes correctly

### Testing
- [ ] All interactions work
- [ ] Error handling works
- [ ] Toast messages display

---

## 💬 Phase 3: Comments

### Create Component
- [ ] Create `/app/components/modules/slate/CommentsModal.tsx`
- [ ] Copy full CommentsModal component code
- [ ] Import in slate page.tsx

### Integrate Modal
- [ ] Add `showComments` state to SlateCard
- [ ] Wire up comment button to open modal
- [ ] Pass post data to modal
- [ ] Handle comment added callback

### Testing
- [ ] Modal opens on button click
- [ ] Comments load correctly
- [ ] Add comment works
- [ ] Reply works
- [ ] Empty state shows

---

## 🔖 Phase 4: Saved Posts

### Create Page
- [ ] Create `/app/(app)/(slate-group)/slate/saved/page.tsx`
- [ ] Copy SavedPostsPage component code
- [ ] Implement grid layout
- [ ] Add unsave functionality

### Update Navigation
- [ ] Update sidebar link in template.tsx to `/slate/saved`
- [ ] Test navigation from sidebar

### Testing
- [ ] Page loads saved posts
- [ ] Grid displays correctly
- [ ] Unsave removes post
- [ ] Empty state shows

---

## 👤 Phase 5: Profile Integration

### Template Updates
- [ ] Verify useProfile hook is fetching real data
- [ ] Confirm avatar/banner display correctly
- [ ] Check bio displays
- [ ] Verify referrals count
- [ ] Confirm recommendations load

### Testing
- [ ] Profile sidebar shows real data
- [ ] All links work
- [ ] Recommendations display

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
