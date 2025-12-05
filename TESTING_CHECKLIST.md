# Reactive SAVE Button - Testing Checklist

## Prerequisites
1. ✅ Navigate to Applications page: `/gigs/manage-gigs`
2. ✅ Switch to "Application" tab
3. ✅ Ensure at least one gig is selected with applications

## Test Cases

### TC-1: Initial State Verification
**Steps:**
1. Load the manage-gigs page
2. Navigate to Application tab

**Expected Results:**
- [ ] SAVE button is displayed in the top-right corner
- [ ] SAVE button has grey background (`bg-gray-300`)
- [ ] SAVE button is disabled (cursor shows "not-allowed")
- [ ] SAVE button text shows "Save"

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

### TC-2: Release Action Activation
**Steps:**
1. Ensure SAVE button is grey (disabled)
2. Click "Release" button (X icon) for any applicant

**Expected Results:**
- [ ] Toast notification appears: "Status change pending. Click SAVE to apply."
- [ ] Release icon changes to filled/highlighted state
- [ ] SAVE button turns blue (`bg-[#21B2C4]`)
- [ ] SAVE button becomes clickable (no cursor-not-allowed)
- [ ] Hover shows darker blue (`bg-[#1AA5B8]`)

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

### TC-3: Shortlist Action Activation
**Steps:**
1. Reload page (SAVE button should be grey again)
2. Click "Shortlist" button (Plus icon) for any applicant

**Expected Results:**
- [ ] Toast notification appears: "Status change pending. Click SAVE to apply."
- [ ] Plus icon changes to filled green background
- [ ] SAVE button turns blue
- [ ] SAVE button becomes clickable

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

### TC-4: Confirm Action Activation
**Steps:**
1. Reload page (SAVE button should be grey again)
2. Click "Confirm" button (Check icon) for any applicant

**Expected Results:**
- [ ] Toast notification appears: "Status change pending. Click SAVE to apply."
- [ ] Check icon changes to filled/highlighted state
- [ ] SAVE button turns blue
- [ ] SAVE button becomes clickable

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

### TC-5: Multiple Actions Before Save
**Steps:**
1. Reload page
2. Click "Release" for applicant A
3. Click "Shortlist" for applicant B
4. Click "Confirm" for applicant C

**Expected Results:**
- [ ] All three actions show visual feedback
- [ ] SAVE button remains blue (doesn't toggle back to grey)
- [ ] Toast appears for each action

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

### TC-6: Successful Save Operation
**Steps:**
1. Perform at least one action (Release/Shortlist/Confirm)
2. SAVE button should be blue
3. Click SAVE button

**Expected Results:**
- [ ] SAVE button text changes to "Saving..."
- [ ] SAVE button remains disabled during save
- [ ] Success toast appears: "Successfully saved X change(s)"
- [ ] SAVE button returns to grey (disabled) state
- [ ] Button text returns to "Save"
- [ ] Application statuses are updated in the table

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

### TC-7: Save Without Changes
**Steps:**
1. Ensure no actions have been performed
2. Try to click SAVE button (should be grey/disabled)

**Expected Results:**
- [ ] SAVE button cannot be clicked
- [ ] Cursor shows "not-allowed" icon
- [ ] No API calls are made

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

### TC-8: Prevent Duplicate Saves
**Steps:**
1. Perform an action
2. Click SAVE button
3. Quickly try to click SAVE again while "Saving..." is showing

**Expected Results:**
- [ ] Button shows "Saving..." text
- [ ] Button is disabled during save operation
- [ ] Only one API call is made per application
- [ ] No duplicate updates occur

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

### TC-9: Visual State Persistence
**Steps:**
1. Click "Release" for an applicant
2. SAVE button should turn blue
3. Switch to another tab (e.g., "Gigs")
4. Return to "Application" tab

**Expected Results:**
- [ ] SAVE button should still be blue
- [ ] Pending changes should be preserved
- [ ] Visual indicators remain on the actions

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

### TC-10: Change Same Applicant Multiple Times
**Steps:**
1. Click "Release" for applicant A (SAVE should turn blue)
2. Click "Shortlist" for the same applicant A
3. Click "Confirm" for the same applicant A

**Expected Results:**
- [ ] Each action updates the visual state
- [ ] SAVE button remains blue
- [ ] Only the latest action (Confirm) is pending for that applicant
- [ ] Previous actions for same applicant are overwritten

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

## Accessibility Tests

### AT-1: Keyboard Navigation
**Steps:**
1. Use Tab key to navigate to SAVE button
2. Try pressing Enter when button is disabled (grey)
3. Perform an action (button turns blue)
4. Tab to SAVE button and press Enter

**Expected Results:**
- [ ] Button is focusable via keyboard
- [ ] Enter key does nothing when disabled
- [ ] Enter key triggers save when enabled

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

### AT-2: Screen Reader Testing
**Steps:**
1. Use screen reader to read SAVE button state

**Expected Results:**
- [ ] Button announces as "Save button"
- [ ] Disabled state is announced when grey
- [ ] Enabled state is announced when blue

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

## Error Handling Tests

### ET-1: API Failure During Save
**Steps:**
1. Perform an action
2. Disconnect network or mock API failure
3. Click SAVE button

**Expected Results:**
- [ ] Error toast appears: "Failed to save changes" or similar
- [ ] SAVE button returns to enabled state (remains blue)
- [ ] Pending changes are preserved
- [ ] User can retry the save

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

### ET-2: Partial Save Failure
**Steps:**
1. Perform multiple actions (3+ applicants)
2. Mock one API call to fail
3. Click SAVE

**Expected Results:**
- [ ] Warning toast: "Saved X changes, but Y failed"
- [ ] Successfully saved changes are persisted
- [ ] Failed changes remain in pending state
- [ ] SAVE button behavior depends on remaining pending changes

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

## Performance Tests

### PT-1: Large Batch Save
**Steps:**
1. Select multiple gigs (5+) with many applications
2. Perform actions on 10+ applicants
3. Click SAVE

**Expected Results:**
- [ ] All changes are processed
- [ ] UI remains responsive during save
- [ ] Progress is indicated ("Saving...")
- [ ] Success message shows correct count

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

## Browser Compatibility

### BC-1: Chrome
- [ ] All tests pass
- [ ] Styles render correctly
- [ ] Hover states work

### BC-2: Firefox
- [ ] All tests pass
- [ ] Styles render correctly
- [ ] Hover states work

### BC-3: Safari
- [ ] All tests pass
- [ ] Styles render correctly
- [ ] Hover states work

### BC-4: Edge
- [ ] All tests pass
- [ ] Styles render correctly
- [ ] Hover states work

---

## Regression Tests

### RT-1: Existing Functionality
**Steps:**
1. Verify other tabs (Gigs, Availability Check, Contact list) still work
2. Verify gig selection still works
3. Verify other features on the page are unaffected

**Expected Results:**
- [ ] No regressions in existing functionality
- [ ] Tab switching works correctly
- [ ] Gig selection/deselection works

**Actual Result:** _____________________
**Status:** ⬜ Pass / ⬜ Fail

---

## Test Summary

**Total Test Cases:** 18
**Passed:** ____
**Failed:** ____
**Blocked:** ____
**Not Tested:** ____

**Overall Status:** ⬜ Pass / ⬜ Fail

**Tested By:** _____________________
**Date:** _____________________
**Environment:** _____________________

## Notes & Issues
_____________________________________________
_____________________________________________
_____________________________________________
