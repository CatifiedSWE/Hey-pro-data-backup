# Setup Instructions - HeyProData Auth Fix

## Issue Fixed
The JSON parse error was caused by missing environment variables and inadequate error handling in the form submission flow.

## Changes Made

### 1. Enhanced Error Handling in Form Page
- Added proper response validation before parsing JSON
- Check for response.ok status
- Verify content-type is application/json
- Added detailed error messages
- Better console logging for debugging

### 2. Enhanced API Error Handling
- Added JSON parse error handling in API route
- Added environment variable validation
- Improved error logging
- Ensured all responses are proper JSON

### 3. Created .env.local Template
A `.env.local` file has been created with required variables.

## Required Setup Steps

### Step 1: Configure Supabase Environment Variables

You need to add your Supabase credentials to `.env.local`:

```bash
# Edit /app/.env.local with your Supabase credentials
```

**Get these values from your Supabase Dashboard:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy the following:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Ensure Database Table Exists

The auth flow requires a `user_profiles` table in Supabase. Run this SQL in your Supabase SQL Editor:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_first_name TEXT NOT NULL,
  legal_surname TEXT NOT NULL,
  alias_first_name TEXT,
  alias_surname TEXT,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
```

### Step 3: Configure Google OAuth (Optional)

If using Google OAuth:

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Add your OAuth credentials from Google Cloud Console
4. Add authorized redirect URIs:
   - `http://localhost:3000/callback` (development)
   - `https://your-domain.com/callback` (production)

### Step 4: Install Dependencies & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Testing the Fix

1. Navigate to http://localhost:3000
2. Click "Sign up" to create a new account
3. After email verification (if enabled), you'll be redirected to the form page
4. Fill in the profile form:
   - First name
   - Surname
   - Country (required)
   - City (required)
   - Alias (optional)
5. Click "Create your profile"
6. Should redirect to `/slate` on success

## Common Errors & Solutions

### Error: "JSON.parse: unexpected character"
**Cause:** Missing Supabase environment variables
**Solution:** Configure `.env.local` with proper Supabase credentials

### Error: "Authentication required"
**Cause:** Token not being passed or invalid
**Solution:** 
- Clear browser cookies/localStorage
- Try logging in again
- Check browser console for token-related errors

### Error: "Failed to create profile"
**Cause:** Database table doesn't exist or RLS policies blocking
**Solution:** 
- Run the SQL schema from Step 2 above
- Check Supabase logs for detailed error messages

### Error: "relation 'user_profiles' does not exist"
**Cause:** Database table not created
**Solution:** Run the SQL schema from Step 2

## Environment Variables Reference

Required variables in `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ Yes | Your Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ Yes | Public anon key for client |
| SUPABASE_SERVICE_ROLE_KEY | ⚠️ Recommended | Service role key for server operations |
| NEXT_PUBLIC_SERVER_URL | Optional | App URL (defaults to localhost:3000) |
| GOOGLE_ANALYTICS_ID | Optional | Google Analytics tracking ID |

## File Changes Summary

### Modified Files:
1. `/app/app/(auth)/form/page.tsx` - Enhanced error handling
2. `/app/api/profile/route.ts` - Added error validation and logging

### Created Files:
1. `/app/.env.local` - Environment variables template
2. `/app/SETUP_INSTRUCTIONS.md` - This file

## Auth Flow Overview

```
Root (/) → Check session
  ↓
  No session → /login
  ↓
  Login/Signup → Supabase Auth
  ↓
  Has session → Check profile (GET /api/profile)
  ↓
  No profile → /form (create profile)
  ↓
  Submit form → PATCH /api/profile
  ↓
  Success → /slate (main app)
```

## Need Help?

If you continue to experience issues:
1. Check browser console for detailed error messages
2. Check Next.js terminal output for server-side errors
3. Check Supabase Dashboard → Logs for database/auth errors
4. Verify all environment variables are set correctly
5. Ensure database table and RLS policies are created

## Testing Checklist

- [ ] Environment variables configured in `.env.local`
- [ ] Supabase database table created
- [ ] RLS policies enabled
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Can access login page at http://localhost:3000/login
- [ ] Can sign up successfully
- [ ] Can complete profile form
- [ ] Redirects to /slate after profile creation
- [ ] Can log in with existing account
