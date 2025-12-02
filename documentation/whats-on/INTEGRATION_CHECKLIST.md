# What's On - API Integration Checklist

**Quick Reference:** Track implementation progress for API integration

---

## 📦 Setup

- [ ] Create `/lib/api/whatson.ts` - API service layer
- [ ] Create `/lib/utils/whatson-transforms.ts` - Data transformers
- [ ] Verify auth context is available
- [ ] Test API endpoints with curl

---

## 🔴 Phase 1: Event Listing (HIGH PRIORITY)

### Files to Modify:
- [ ] `/app/(app)/(whatson)/whats-on/page.tsx`
- [ ] `/app/(app)/(whatson)/components/main-content.tsx`

### Tasks:
- [ ] Replace mock data import with API service
- [ ] Add useState for events, loading, error
- [ ] Add useEffect to fetch events on mount
- [ ] Implement `fetchEvents()` function
- [ ] Connect filter form to API query parameters
- [ ] Implement `handleFilterSubmit()` handler
- [ ] Transform API response to UI format
- [ ] Add loading skeleton component
- [ ] Add empty state component
- [ ] Pass real data to EventListingPage
- [ ] Test: Events load on page mount
- [ ] Test: Filters work correctly
- [ ] Test: Search functionality works

---

## 🔴 Phase 2: Event Details & RSVP (HIGH PRIORITY)

### Files to Modify:
- [ ] `/app/(app)/(whatson)/whats-on/[slug]/page.tsx`
- [ ] `/app/(app)/(whatson)/components/rsvp.tsx`

### Tasks:
- [ ] Change page to dynamic (remove generateStaticParams)
- [ ] Fetch event by ID from API
- [ ] Transform schedule data for display
- [ ] Add loading and error states
- [ ] Build RSVP form with validation
- [ ] Implement RSVP submission handler
- [ ] Display ticket info on success
- [ ] Handle payment flow if paid event
- [ ] Disable RSVP if fully booked
- [ ] Check for existing RSVP (prevent duplicates)
- [ ] Test: Event details load correctly
- [ ] Test: RSVP submission works
- [ ] Test: Ticket numbers generate

---

## 🟡 Phase 3: Event Management (MEDIUM PRIORITY)

### Files to Modify:
- [ ] `/app/(app)/(whatson)/whats-on/manage-whats-on/page.tsx`
- [ ] `/app/(app)/(whatson)/components/data-table.tsx`

### Tasks:
- [ ] Fetch user's events via `/api/whatson/my`
- [ ] Display events with RSVP counts
- [ ] Implement delete event handler
- [ ] Add delete confirmation dialog
- [ ] Fetch RSVP list per event
- [ ] Display RSVP data table
- [ ] Implement CSV export
- [ ] Test: User's events load
- [ ] Test: Delete removes event
- [ ] Test: RSVP list displays
- [ ] Test: CSV export downloads

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

**Phase 1:** ⬜️⬜️⬜️⬜️⬜️ 0/5  
**Phase 2:** ⬜️⬜️⬜️⬜️⬜️ 0/5  
**Phase 3:** ⬜️⬜️⬜️⬜️⬜️ 0/5  
**Phase 4:** ⬜️⬜️⬜️⬜️⬜️ 0/5  

**Overall Progress:** 0/20 tasks complete

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
