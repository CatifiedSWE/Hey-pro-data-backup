# What's On - API Integration Checklist

**Quick Reference:** Track implementation progress for API integration

---

## 📦 Setup

- [x] Create `/lib/api/whatson.ts` - API service layer
- [x] Create `/lib/utils/whatson-transforms.ts` - Data transformers
- [x] Verify auth context is available
- [ ] Test API endpoints with curl

---

## 🔴 Phase 1: Event Listing (HIGH PRIORITY) ✅ COMPLETE

### Files to Modify:
- [x] `/app/(app)/(whatson)/whats-on/page.tsx`
- [x] `/app/(app)/(whatson)/components/main-content.tsx`

### Tasks:
- [x] Replace mock data import with API service
- [x] Add useState for events, loading, error
- [x] Add useEffect to fetch events on mount
- [x] Implement `fetchEvents()` function
- [x] Connect filter form to API query parameters
- [x] Implement `handleFilterSubmit()` handler
- [x] Transform API response to UI format
- [x] Add loading skeleton component
- [x] Add empty state component
- [x] Pass real data to EventListingPage
- [x] Test: Events load on page mount
- [x] Test: Filters work correctly
- [x] Test: Search functionality works

---

## 🔴 Phase 2: Event Details & RSVP (HIGH PRIORITY) ✅ COMPLETE

### Files to Modify:
- [x] `/app/(app)/(whatson)/whats-on/[slug]/page.tsx`
- [x] `/app/(app)/(whatson)/components/rsvp.tsx`

### Tasks:
- [x] Change page to dynamic (remove generateStaticParams)
- [x] Fetch event by ID from API
- [x] Transform schedule data for display
- [x] Add loading and error states
- [x] Build RSVP form with validation
- [x] Implement RSVP submission handler
- [x] Display ticket info on success
- [x] Handle payment flow if paid event
- [x] Disable RSVP if fully booked
- [x] Check for existing RSVP (prevent duplicates)
- [x] Test: Event details load correctly
- [x] Test: RSVP submission works
- [x] Test: Ticket numbers generate

---

## 🟡 Phase 3: Event Management (MEDIUM PRIORITY) ✅ COMPLETE

### Files to Modify:
- [x] `/app/(app)/(whatson)/whats-on/manage-whats-on/page.tsx`
- [x] `/app/(app)/(whatson)/components/data-table.tsx`

### Tasks:
- [x] Fetch user's events via `/api/whatson/my`
- [x] Display events with RSVP counts
- [x] Implement delete event handler
- [x] Add delete confirmation dialog
- [x] Fetch RSVP list per event
- [x] Display RSVP data table
- [x] Implement CSV export
- [x] Test: User's events load
- [x] Test: Delete removes event
- [x] Test: RSVP list displays
- [x] Test: CSV export downloads

---

## 🟡 Phase 4: Event Creation & Editing (MEDIUM PRIORITY)

### Files to Modify:
- [ ] `/app/(app)/(whatson)/whats-on/manage-whats-on/add-new/page.tsx`
- [ ] `/app/(app)/(whatson)/whats-on/manage-whats-on/[id]/page.tsx`
- [ ] `/app/(app)/(whatson)/components/EditWhatsOnForm.tsx`

### Create Form Tasks:
- [ ] Build form with all fields
- [ ] Add title validation (3-200 chars)
- [ ] Add description validation (max 10000 chars)
- [ ] Add location field (required if not online)
- [ ] Add online/in-person toggle
- [ ] Add paid/free toggle with price fields
- [ ] Add capacity settings (spots + unlimited toggle)
- [ ] Add schedule section (multi-date support)
- [ ] Add RSVP deadline field
- [ ] Add tags input (comma-separated)
- [ ] Add image upload (thumbnail + hero)
- [ ] Add terms & conditions field
- [ ] Add status selector (draft/published)
- [ ] Implement form submission handler
- [ ] Handle image upload helper function
- [ ] Test: Form validation works
- [ ] Test: Event creation succeeds
- [ ] Test: Images upload correctly

### Edit Form Tasks:
- [ ] Fetch event data by ID
- [ ] Pre-populate form with existing values
- [ ] Allow schedule slot editing
- [ ] Allow tag editing
- [ ] Allow image replacement
- [ ] Implement update handler (PATCH)
- [ ] Test: Form pre-populates
- [ ] Test: Updates save correctly

---

## ✅ Final Verification

- [ ] All pages load without console errors
- [ ] Authentication flow works end-to-end
- [ ] Images display from Supabase Storage
- [ ] Filters and search return correct results
- [ ] RSVP system generates unique tickets
- [ ] Creator can manage their events
- [ ] CSV export contains all data
- [ ] Mobile responsive on all pages
- [ ] Loading states display properly
- [ ] Error messages are user-friendly

---

## 📊 Progress Tracker

**Phase 1:** ✅✅✅✅✅ 5/5 COMPLETE 
**Phase 2:** ✅✅✅✅✅ 5/5 COMPLETE
**Phase 3:** ✅✅✅✅✅ 5/5 COMPLETE  
**Phase 4:** ⬜️⬜️⬜️⬜️⬜️ 0/5  

**Overall Progress:** 15/20 tasks complete (75%)

---

## 🚀 Quick Commands

```bash
# Test API endpoints
curl -X GET 'http://localhost:3000/api/whatson?status=published'

# View backend logs
tail -f /var/log/supervisor/backend.*.log

# Restart services
sudo supervisorctl restart all
```

---

**Estimated Time:** 11-15 hours total  
**Last Updated:** January 2025
