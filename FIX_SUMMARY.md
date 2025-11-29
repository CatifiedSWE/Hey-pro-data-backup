# Fix Summary: User Profiles Name Column Error

## Problem Statement
Error encountered when fetching explore profiles:
```
Error fetching explore profiles: {
  code: '42703',
  details: null,
  hint: null,
  message: 'column user_profiles.name does not exist'
}
```

## Root Cause
The code was trying to SELECT and use a `name` column from the `user_profiles` table, but this column doesn't exist in the database schema. 

According to the database schema, the correct columns are:
1. **Priority 1**: `alias_first_name` + `alias_surname`
2. **Priority 2**: `first_name` + `surname`

## Files Modified

### 1. `/app/app/api/explore/route.ts`
**Changes:**
- **Line 35-56**: Removed `name` from SELECT query, added `first_name` and `surname`
- **Line 59-60**: Updated keyword search to use all four name columns: `alias_first_name`, `alias_surname`, `first_name`, `surname`, and `bio`
- **Line 124-133**: Updated display name construction logic with proper priority fallback:
  ```typescript
  const aliasName = `${profile.alias_first_name || ''} ${profile.alias_surname || ''}`.trim();
  const realName = `${profile.first_name || ''} ${profile.surname || ''}`.trim();
  const displayName = aliasName || realName || 'Anonymous';
  ```

### 2. `/app/app/api/explore/[userId]/route.ts`
**Changes:**
- **Line 94-99**: Updated display name construction to use priority fallback:
  ```typescript
  const aliasName = `${profile.alias_first_name || ''} ${profile.alias_surname || ''}`.trim();
  const realName = `${profile.first_name || ''} ${profile.surname || ''}`.trim();
  const displayName = aliasName || realName || 'Anonymous';
  ```
- Both `name` and `displayName` fields in the response now use the computed `displayName`

### 3. `/app/app/(app)/(explore)/explore/page.tsx`
**Changes:**
- **Line 18-32**: Removed `name` from SELECT query, added `first_name` and `surname`
- **Line 37-38**: Updated keyword search to use all four name columns
- **Line 73-77**: Updated display name construction with proper priority fallback:
  ```typescript
  const aliasName = `${profile.alias_first_name || ''} ${profile.alias_surname || ''}`.trim();
  const realName = `${profile.first_name || ''} ${profile.surname || ''}`.trim();
  const displayName = aliasName || realName || 'Anonymous';
  ```

## Solution Summary

### Display Name Priority Logic
The fix implements a two-tier fallback system for user display names:

```
1. Try: alias_first_name + alias_surname (trimmed)
2. If empty, try: first_name + surname (trimmed)
3. If still empty: use "Anonymous"
```

### Database Queries Updated
All queries now:
- SELECT the correct columns: `alias_first_name`, `alias_surname`, `first_name`, `surname`
- Search across all four name columns when keyword filtering is applied
- Build display names using the priority fallback logic

## Testing Recommendations
1. Test explore page with users who have:
   - Only alias names set
   - Only real names set
   - Both alias and real names set
   - Neither name set (should show "Anonymous")
2. Test keyword search to ensure it searches across all name fields
3. Test individual profile view to ensure names display correctly

## Impact
- ✅ Resolves the "column user_profiles.name does not exist" error
- ✅ Implements proper name priority fallback as specified
- ✅ Maintains backward compatibility with existing display name logic
- ✅ Improves search functionality to cover all name fields
