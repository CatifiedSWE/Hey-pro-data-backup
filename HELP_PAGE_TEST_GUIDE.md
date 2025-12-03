# Help Page AI - Testing Guide

## Quick Test Steps

### 1. Access the Help Page
```
URL: http://localhost:3000/help
```

### 2. Test the Chat Interface

#### What You Should See:
- Welcome message from the HeyProData Help Bot
- List of help topics (account settings, profile, features, etc.)
- Four quick action buttons with pre-defined questions
- Chat input field at the bottom
- Send button with gradient styling

#### Test Interactions:

**Test 1: Send a Question**
1. Type: "How do I update my profile?"
2. Click Send or press Enter
3. **Expected behavior**:
   - Your message appears on the right (gradient background)
   - Typing indicator appears (three animated dots)
   - Bot response appears on the left

**Test 2: Quick Actions**
1. Click any quick action button (e.g., "What are collabs?")
2. Question is auto-filled in input
3. Can modify before sending or send as-is

**Test 3: Multiple Messages**
1. Send multiple questions in sequence
2. **Expected behavior**:
   - Chat scrolls automatically to show latest message
   - Timestamps show for each message
   - Previous messages remain in chat history

### 3. Technical Verification

#### Check Network Requests (Browser DevTools)
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Send a question
4. Look for GET request to: `n8n.srv882974.hstgr.cloud/webhook/...`
5. **Verify parameters**:
   ```
   ?question=YOUR_QUESTION&section_id=RANDOM_10_CHARS
   ```

#### Example Request:
```
https://n8n.srv882974.hstgr.cloud/webhook/3e37b379-3432-43ea-b3e3-abe9d5c2d18f?question=How%20do%20I%20update%20my%20profile%3F&section_id=7tvua7qeit
```

### 4. Expected Response Format

#### When n8n is Configured:
```json
[
  {
    "output": "To update your profile:\n\n**Step 1**: Navigate to your profile page\n**Step 2**: Click Edit Profile\n\n## Important\nMake sure all fields are complete!"
  }
]
```

#### How It Will Render:
```
To update your profile:

Step 1: Navigate to your profile page  [bold]
Step 2: Click Edit Profile  [bold]

Important  [heading 2]
Make sure all fields are complete!
```

### 5. Error Handling Tests

**Test 1: Network Error**
- Disconnect internet
- Send a message
- **Expected**: "I'm sorry, I'm having trouble connecting..."

**Test 2: Timeout**
- If webhook takes >30s
- **Expected**: Connection timeout message

**Test 3: Malformed Response**
- If webhook returns unexpected format
- **Expected**: "I couldn't process your request..."

### 6. UI/UX Checks

✅ **Responsive Design**
- Test on different screen sizes
- Chat should adapt to mobile/tablet/desktop

✅ **Accessibility**
- All interactive elements have proper data-testid attributes
- Keyboard navigation works (Tab, Enter)
- Screen reader friendly

✅ **Visual Polish**
- Gradient colors match brand (pink, blue, teal)
- Smooth animations (typing indicator, scroll)
- Clear visual distinction between user and bot messages

### 7. Console Checks

#### No Errors (if n8n configured):
```javascript
✅ No errors in console
✅ API call succeeds
✅ Response renders correctly
```

#### Current State (n8n not yet configured):
```javascript
⚠️ Empty response from webhook (expected)
ℹ️ Console log: "Error calling n8n webhook: ..."
✅ Fallback error message displays correctly
```

### 8. Section ID Verification

Each chat session should generate unique section IDs:

**Test**: Send 3 messages, check network requests
```
Message 1: section_id=abc1234567
Message 2: section_id=xyz9876543
Message 3: section_id=qwe5432167
```

✅ Each ID should be different (10 random characters)

### 9. Markdown Rendering Test

Once n8n returns markdown:

**Test Input** (from n8n):
```markdown
# Welcome

Here's how to **reset your password**:

## Steps:
1. Go to Settings
2. Click **Password Reset**
3. Enter new password

### Note
Make sure it's at least 8 characters!
```

**Expected Output** (in chat):
- "Welcome" as large heading
- "reset your password" in bold
- "Steps:" as medium heading
- Numbered list properly formatted
- "Note" as small heading
- Proper spacing between elements

### 10. Performance Check

#### Metrics:
- [ ] Page load: < 2 seconds
- [ ] Message send: Instant UI update
- [ ] API response: < 5 seconds (depends on n8n)
- [ ] Scroll animation: Smooth 60fps
- [ ] Typing indicator: No lag

### 11. Cross-Browser Testing

Test on:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Android)

### 12. Production Readiness Checklist

- [x] Code implemented and tested
- [x] Error handling in place
- [x] Loading states implemented
- [x] Markdown rendering configured
- [x] Responsive design
- [x] Accessibility features
- [x] Documentation complete
- [ ] n8n webhook configured (pending)
- [ ] End-to-end testing with real AI responses (pending n8n)

## Known Issues / Pending

1. **n8n Webhook**: Currently returns empty response
   - **Impact**: Bot shows error message instead of AI response
   - **Fix Required**: Configure n8n workflow to return proper format
   - **ETA**: Waiting on n8n team/configuration

2. **Rate Limiting**: Not yet implemented
   - **Recommendation**: Add rate limiting in production

3. **Analytics**: No tracking yet
   - **Recommendation**: Add question tracking for insights

## Quick Debug Commands

### Test webhook manually:
```bash
curl "https://n8n.srv882974.hstgr.cloud/webhook/3e37b379-3432-43ea-b3e3-abe9d5c2d18f?question=test&section_id=abc123"
```

### Test with Node.js:
```bash
node /app/test-help-ai.js
```

### Check server logs:
```bash
tail -f /tmp/nextjs.log
```

### Restart dev server:
```bash
cd /app
pkill -f "next dev"
npm run dev
```

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify network requests in DevTools
3. Test webhook directly with curl
4. Review `/app/HELP_AI_IMPLEMENTATION.md`
5. Check Next.js server logs

## Success Criteria

✅ **Phase 1 (COMPLETE)**:
- Help page loads
- Chat UI functional
- Messages send and display
- Typing indicator works
- Markdown rendering ready
- Error handling works

⏳ **Phase 2 (PENDING n8n)**:
- Webhook returns AI responses
- Markdown renders beautifully
- Context awareness
- Production deployment

---

**Status**: Implementation Complete - Ready for n8n Configuration  
**Last Updated**: December 3, 2024
