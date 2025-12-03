# HeyProData - Issue Tracker

**Purpose:** Track and document all identified issues, their analysis, and resolution plans.

---

## 📋 Active Issues

### Issue #1: Slate API 500 Error

**Status:** 🔴 **CRITICAL - Analysis Complete, Fix Pending**  
**Reported:** January 2025  
**Endpoint:** `GET /api/slate?page=1&limit=20&sort=latest`  
**Impact:** Main social feed completely broken

**Root Cause:**
- Foreign key relationship mismatch in Supabase query
- Code tries to fetch user profile fields from `auth.users` (wrong table)
- Profile fields actually exist in `user_profiles` table
- Results in 500 error when executing query

**Documentation:**
- 📘 **Full Plan:** [SLATE_API_500_ERROR_FIX_PLAN.md](./SLATE_API_500_ERROR_FIX_PLAN.md)
- ⚡ **Quick Fix:** [SLATE_API_FIX_QUICK_REFERENCE.md](./SLATE_API_FIX_QUICK_REFERENCE.md)

**Affected Files:**
- `/app/app/api/slate/route.ts` (main feed) - **Priority 1**
- `/app/app/api/slate/my/route.ts` (user posts)
- `/app/app/api/slate/saved/route.ts` (saved posts)
- `/app/app/api/slate/[id]/route.ts` (single post)
- `/app/app/api/slate/[id]/likes/route.ts` (likes list)
- `/app/app/api/slate/[id]/comment/route.ts` (comments)

**Estimated Fix Time:** 80 minutes  
**Assigned To:** _Pending_  
**Next Steps:**
1. Review fix plan document
2. Verify database schema
3. Implement fixes following step-by-step plan
4. Run all tests
5. Deploy to production

---

## 🔍 Potential Issues (Needs Investigation)

### Issue #2: Similar Pattern in Collab API

**Status:** 🟡 **Investigation Needed**  
**Risk:** Medium  
**Description:** Collab API may have similar foreign key JOIN pattern

**Investigation Steps:**
```bash
grep -n "author:user_id" /app/app/api/collab/route.ts
grep -n "creator:" /app/app/api/collab/route.ts
```

**If Found:** Apply same fix pattern as Slate API

---

### Issue #3: Similar Pattern in What's On API

**Status:** 🟡 **Investigation Needed**  
**Risk:** Medium  
**Description:** What's On (events) API may have similar pattern

**Investigation Steps:**
```bash
grep -n "author:created_by" /app/app/api/whatson/route.ts
grep -n "creator:created_by" /app/app/api/whatson/route.ts
```

**If Found:** Apply same fix pattern as Slate API

---

### Issue #4: Similar Pattern in Gigs API

**Status:** 🟡 **Investigation Needed**  
**Risk:** Medium  
**Description:** Gigs API may have similar pattern

**Investigation Steps:**
```bash
grep -n "postedBy:created_by" /app/app/api/gigs/route.ts
grep -n "author:created_by" /app/app/api/gigs/route.ts
```

**If Found:** Apply same fix pattern as Slate API

---

## ✅ Resolved Issues

_No resolved issues yet_

---

## 📊 Issue Statistics

| Status | Count | Severity |
|--------|-------|----------|
| Critical | 1 | High |
| Investigation Needed | 3 | Medium |
| Resolved | 0 | - |

---

## 🔧 Common Patterns

### Pattern 1: Foreign Key JOIN Mismatch

**Symptom:** 500 error when fetching related data  
**Cause:** Query tries to fetch columns from wrong table via FK  
**Solution:** Explicitly join with correct table using `table_name!inner` syntax

**Example Fix:**
```typescript
// ❌ Wrong - tries to fetch from auth.users
author:user_id (
  alias_first_name,
  profile_photo_url
)

// ✅ Correct - explicitly joins with user_profiles
user_profiles!inner (
  alias_first_name,
  profile_photo_url
)
```

---

## 📚 Documentation References

### Architecture Documents
- [UPDATED_BACKEND_ARCHITECTURE.md](./backend-documentation-and-commands/UPDATED_BACKEND_ARCHITECTURE.md) - Complete database schema
- [API_DOC.md](./API-Docs/API_DOC.md) - API endpoint documentation

### Issue-Specific Documents
- [SLATE_API_500_ERROR_FIX_PLAN.md](./SLATE_API_500_ERROR_FIX_PLAN.md) - Detailed fix plan
- [SLATE_API_FIX_QUICK_REFERENCE.md](./SLATE_API_FIX_QUICK_REFERENCE.md) - Quick reference

---

## 🔔 Notifications

### High Priority Issues
- **Slate API 500 Error** - Immediate attention required
- Blocks main social feed functionality
- Users cannot view or interact with posts

### Medium Priority
- Investigate other APIs for similar pattern
- Prevents potential future issues

---

## 📝 Issue Reporting Template

When adding new issues to this tracker, use this format:

```markdown
### Issue #X: [Brief Title]

**Status:** 🔴/🟡/🟢 **[Status Description]**  
**Reported:** [Date]  
**Endpoint/Feature:** [Affected endpoint or feature]  
**Impact:** [User impact description]

**Root Cause:**
- [Detailed explanation]

**Documentation:**
- 📘 **Full Plan:** [Link to detailed doc]
- ⚡ **Quick Fix:** [Link to quick reference]

**Affected Files:**
- [List of files]

**Estimated Fix Time:** [Time estimate]  
**Assigned To:** [Name or Pending]  
**Next Steps:**
1. [Step 1]
2. [Step 2]
```

---

## 🎯 Priority Levels

| Icon | Status | Description |
|------|--------|-------------|
| 🔴 | Critical | Immediate attention required, blocks core functionality |
| 🟡 | Medium | Should be investigated/fixed soon, potential impact |
| 🟢 | Low | Nice to have, minimal impact |
| ✅ | Resolved | Issue fixed and verified |
| 🔍 | Investigating | Analysis in progress |

---

**Last Updated:** January 2025  
**Maintained By:** Development Team  
**Review Frequency:** Daily for critical issues, weekly for others
