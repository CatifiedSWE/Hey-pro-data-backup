# Collab Feature - Setup & Testing Instructions

## ⚠️ IMPORTANT: Database Setup Required First

Before testing the features, you **MUST** run the SQL migration to create the necessary database tables.

### Step 1: Create Database Tables

1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of this file:
   ```
   /app/documentation/backend-documentation-and-commands/collab/08_ADDITIONAL_FEATURES_TABLES.sql
   ```
4. Click **Run** to execute the SQL
5. Verify success - you should see "Success. No rows returned"

### Step 2: Verify Tables Created

Run this query in Supabase SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'collab_%'
ORDER BY table_name;
```

**Expected Output:** You should see 7 tables:
- collab_collaborators
- collab_comments ← NEW
- collab_interests
- collab_posts
- collab_saves ← NEW
- collab_shares ← NEW
- collab_tags

If you see all 7 tables, the database setup is complete! ✅

---

## Running the Application

### Start Development Server

```bash
cd /app
npm run dev
```

The application will start on `http://localhost:3000`

### Navigate to Collab Page

Once the server is running, go to:
```
http://localhost:3000/collab
```

---

## Testing Guide

### 1. Test Banner Image Layout ✅

**What to check:**
- All banner images should have the same size (360x220px)
- Images should maintain consistent aspect ratio
- No irregular or stretched images
- Layout should look clean on both desktop and mobile

**Expected Result:** All collab post banners are uniform and properly displayed.

---

### 2. Test Save/Bookmark Feature (Heart Button) ✅

**Steps:**
1. Click the heart icon on any collab post
2. Heart should fill with color (indicating saved)
3. Refresh the page
4. Heart should still be filled
5. Click the filled heart again
6. Heart should become empty (indicating unsaved)

**What to check:**
- Loading spinner appears briefly during save/unsave
- Error message appears if not authenticated
- Saved state persists across page refreshes
- Multiple collabs can be saved independently

**Database Verification:**
```sql
SELECT * FROM collab_saves;
```
You should see records when collabs are saved.

---

### 3. Test Share Functionality ✅

**Steps:**
1. Click the share button (arrow icon) on any collab post
2. A modal should open with share options

**Test Copy Link:**
1. Click the "Copy" button
2. Button should show "Copied!" briefly
3. Paste the link in a new tab - it should work

**Test Social Media Sharing:**
1. Click "Twitter" button
   - Should open Twitter share dialog in new window
2. Click "LinkedIn" button
   - Should open LinkedIn share dialog in new window
3. Click "Facebook" button
   - Should open Facebook share dialog in new window

**Database Verification:**
```sql
SELECT * FROM collab_shares ORDER BY created_at DESC;
```
You should see records for each share action with the correct `share_type`.

---

### 4. Test Comments System ✅

**Test Viewing Comments:**
1. Click the comment icon (speech bubble) on any collab post
2. A modal should open showing existing comments
3. If no comments exist, you should see "No comments yet"

**Test Adding Comments:**
1. Type a message in the comment textarea
2. Click the send button (paper plane icon)
3. Comment should appear immediately in the list
4. Your avatar and name should display correctly
5. Timestamp should show "just now" or similar

**Test Replying to Comments:**
1. Click "Reply" button on any comment
2. The textarea should show "Replying to @[name]"
3. Type your reply and send
4. Reply should appear nested under the original comment
5. Indentation should show the reply relationship

**Test Nested Replies (Threading):**
1. Reply to a reply (create a 3rd level comment)
2. The indentation should increase
3. All replies should be properly nested

**Test Deleting Comments:**
1. Find a comment you created
2. Click the trash icon next to it
3. Confirm deletion
4. Comment and all its replies should be removed

**What to check:**
- Comment count updates correctly in modal title
- User avatars display correctly
- Timestamps are accurate
- Only your own comments show delete button
- Loading states work properly
- Error messages show for failures

**Database Verification:**
```sql
SELECT * FROM collab_comments ORDER BY created_at DESC;
```
You should see all comments with proper `parent_id` relationships.

---

## Common Issues & Solutions

### Issue: "Authentication required" error
**Solution:** Make sure you're logged in to the application

### Issue: Tables not found errors in console
**Solution:** Run the database migration SQL (Step 1 above)

### Issue: Comments not loading
**Solution:** 
1. Check browser console for errors
2. Verify `collab_comments` table exists in database
3. Check RLS policies are enabled

### Issue: Share modal doesn't open
**Solution:** 
1. Check browser console for errors
2. Verify the modal component is imported correctly

### Issue: Images still irregular
**Solution:**
1. Clear browser cache
2. Reload the page
3. Check that the CSS is loading properly

---

## API Testing (Optional)

You can test the API endpoints directly using curl:

### Test Save Collab
```bash
# Get your auth token first (from browser dev tools)
TOKEN="your-jwt-token"
COLLAB_ID="collab-uuid"

# Save collab
curl -X POST "http://localhost:3000/api/collab/$COLLAB_ID/save" \
  -H "Authorization: Bearer $TOKEN"

# Unsave collab
curl -X DELETE "http://localhost:3000/api/collab/$COLLAB_ID/save" \
  -H "Authorization: Bearer $TOKEN"
```

### Test Share Collab
```bash
curl -X POST "http://localhost:3000/api/collab/$COLLAB_ID/share" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"share_type": "link"}'
```

### Test Get Comments
```bash
curl "http://localhost:3000/api/collab/$COLLAB_ID/comments"
```

### Test Add Comment
```bash
curl -X POST "http://localhost:3000/api/collab/$COLLAB_ID/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a test comment"}'
```

### Test Add Reply
```bash
PARENT_ID="comment-uuid"
curl -X POST "http://localhost:3000/api/collab/$COLLAB_ID/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "This is a reply", "parent_id": "'$PARENT_ID'"}'
```

---

## Browser Console Debugging

Open browser dev tools (F12) and check for:

1. **Network Tab**: Check API requests/responses
2. **Console Tab**: Look for JavaScript errors
3. **Application Tab**: Verify session/authentication

Common error patterns:
- `401 Unauthorized` → Need to log in
- `404 Not Found` → Check API endpoint exists
- `500 Internal Server Error` → Check server logs and database

---

## Success Criteria

✅ All banner images are uniform and properly sized
✅ Heart button saves/unsaves collabs
✅ Share modal opens and all options work
✅ Comments load and display correctly
✅ New comments can be added
✅ Replies create proper nested structure
✅ Comment deletion works for own comments
✅ All loading states display correctly
✅ Error handling works as expected

---

## Next Steps After Testing

Once everything works:
1. Test on different screen sizes (mobile, tablet, desktop)
2. Test with multiple users to verify sharing and comments
3. Monitor database for any performance issues
4. Consider adding more features (see Future Enhancements in main summary)

---

## Support

If you encounter issues:
1. Check the main summary: `/app/COLLAB_FEATURE_IMPLEMENTATION_SUMMARY.md`
2. Review API documentation: `/app/documentation/backend-documentation-and-commands/collab/`
3. Check browser console for specific error messages
4. Verify database tables and RLS policies are set up correctly
