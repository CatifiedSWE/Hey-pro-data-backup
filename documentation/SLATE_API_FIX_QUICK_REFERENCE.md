# Slate API 500 Error - Quick Reference

**TL;DR:** The slate API is trying to fetch user profile fields from `auth.users` table, but those fields are in `user_profiles` table.

---

## 🎯 Quick Diagnosis

```bash
# Check if issue exists
curl http://localhost:3000/api/slate?page=1&limit=5

# Expected error: 500 Internal Server Error
# Root cause: Foreign key JOIN mismatch
```

---

## ⚡ Quick Fix (Copy-Paste Ready)

### Main File: `/app/app/api/slate/route.ts`

**Find (around line 21-46):**
```typescript
author:user_id (
  id,
  alias_first_name,
  alias_surname,
  profile_photo_url
)
```

**Replace with:**
```typescript
user_profiles!inner (
  user_id,
  alias_first_name,
  alias_surname,
  profile_photo_url
)
```

**Then find (around line 107-111):**
```typescript
author: {
  id: post.author?.id,
  name: `${post.author?.alias_first_name || ''} ${post.author?.alias_surname || ''}`.trim(),
  avatar: post.author?.profile_photo_url || '',
},
```

**Replace with:**
```typescript
author: {
  id: post.user_profiles?.user_id,
  name: `${post.user_profiles?.alias_first_name || ''} ${post.user_profiles?.alias_surname || ''}`.trim(),
  avatar: post.user_profiles?.profile_photo_url || '',
},
```

---

## 🔧 Apply Fix

```bash
# 1. Backup
cp /app/app/api/slate/route.ts /app/app/api/slate/route.ts.backup

# 2. Edit the file (apply changes above)
nano /app/app/api/slate/route.ts

# 3. Restart
sudo supervisorctl restart backend

# 4. Test
curl http://localhost:3000/api/slate?page=1&limit=5

# Expected: 200 OK with posts
```

---

## 🔍 Files That Need Same Fix

- `/app/app/api/slate/route.ts` ← **START HERE**
- `/app/app/api/slate/my/route.ts`
- `/app/app/api/slate/saved/route.ts`
- `/app/app/api/slate/[id]/route.ts`
- `/app/app/api/slate/[id]/likes/route.ts`
- `/app/app/api/slate/[id]/comment/route.ts`

---

## 📊 Why This Happened

```
Database Schema:
slate_posts.user_id → auth.users.id ✅
user_profiles.user_id → auth.users.id ✅

Profile fields location:
✅ user_profiles table: alias_first_name, alias_surname, profile_photo_url
❌ auth.users table: id, email, created_at (NO profile fields)

Code was trying:
slate_posts.user_id → auth.users → fetch profile fields ❌

Should be:
slate_posts.user_id → auth.users.id = user_profiles.user_id → fetch profile fields ✅
```

---

## 🧪 Test Commands

```bash
# Test 1: Basic feed
curl http://localhost:3000/api/slate?page=1&limit=5

# Test 2: With search
curl "http://localhost:3000/api/slate?page=1&limit=5&search=test"

# Test 3: Sort by popular
curl "http://localhost:3000/api/slate?page=1&limit=5&sort=popular"

# Test 4: Check logs for errors
tail -50 /var/log/supervisor/backend.err.log | grep slate
```

---

## 🔙 Rollback

```bash
# Restore backup
cp /app/app/api/slate/route.ts.backup /app/app/api/slate/route.ts

# Restart
sudo supervisorctl restart backend
```

---

## 📚 Full Documentation

See: `/app/documentation/SLATE_API_500_ERROR_FIX_PLAN.md` for complete details.

---

**Status:** Analysis Complete  
**Time to Fix:** ~15 minutes  
**Risk:** Low  
**Testing Required:** Yes
