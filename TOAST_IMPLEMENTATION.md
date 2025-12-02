# Custom Toast Notifications Implementation

## Overview
This document describes the custom toast notification styling implemented for HeyProData using the brand colors.

## Brand Colors
- **Pink/Coral**: `#FA6E80`
- **Teal**: `#31A7AC`

## Implementation Details

### Modified Files
1. **`/app/components/ui/sonner.tsx`** - Updated toast styling configuration

### Toast Types & Styling

#### 1. Success Toasts
- **Background**: Solid `#31A7AC` (Teal)
- **Text**: White
- **Usage**: `toast.success("Profile updated successfully!")`
- **Examples in app**:
  - Profile updates
  - File uploads
  - Form submissions
  - Settings changes

#### 2. Error Toasts
- **Background**: Solid `#FA6E80` (Pink)
- **Text**: White
- **Usage**: `toast.error("Failed to upload file")`
- **Examples in app**:
  - File size errors
  - Validation errors
  - API failures
  - Authentication errors

#### 3. Info Toasts
- **Background**: Gradient from `#31A7AC` to `#FA6E80` (Teal → Pink)
- **Text**: White
- **Usage**: `toast.info("No changes were made")`
- **Examples in app**:
  - Informational messages
  - Status updates
  - Neutral notifications

#### 4. Warning Toasts
- **Background**: Gradient from `#FA6E80` to `#31A7AC` (Pink → Teal)
- **Text**: White
- **Usage**: `toast.warning("Some changes may have failed")`
- **Examples in app**:
  - Partial success scenarios
  - Cautionary messages
  - Important notices

#### 5. Loading Toasts
- **Background**: Solid `#31A7AC` (Teal)
- **Text**: White
- **Usage**: `toast.loading("Uploading file...")`
- **Examples in app**:
  - File uploads
  - API requests
  - Long-running operations

#### 6. Default Toasts
- **Background**: Gradient from `#FA6E80` to `#31A7AC` (Pink → Teal)
- **Text**: White
- **Usage**: `toast("This is a notification")`
- **Examples in app**:
  - General notifications
  - System messages

### Action Buttons
- **Primary Action Button**: White background with pink text (`#FA6E80`)
- **Cancel Button**: Semi-transparent white background with white text

### Description Text
- **Color**: White with 90% opacity
- **Used for**: Additional context or details in toasts

## Toast Features Supported

### Basic Usage
```typescript
import { toast } from "sonner";

// Success
toast.success("Operation completed!");

// Error
toast.error("Something went wrong!");

// Info
toast.info("Here's some information");

// Warning
toast.warning("Please be careful");

// Loading
const toastId = toast.loading("Processing...");
// Later dismiss it
toast.dismiss(toastId);

// Default
toast("Simple message");
```

### With Description
```typescript
toast.success("Profile updated!", {
  description: "Your changes have been saved successfully."
});
```

### With Action Buttons
```typescript
toast.success("File uploaded!", {
  action: {
    label: "View",
    onClick: () => console.log("View clicked")
  }
});
```

### With Cancel and Action
```typescript
toast("Delete this item?", {
  cancel: {
    label: "Cancel",
    onClick: () => console.log("Cancelled")
  },
  action: {
    label: "Delete",
    onClick: () => toast.success("Deleted!")
  }
});
```

## Demo Page
A comprehensive demo page has been created at `/toast-demo` that showcases all toast types and features:
- All 6 toast variants
- Action buttons
- Descriptions
- Loading states
- Brand color reference

## Files Where Toasts Are Used

### Profile Components
- `/app/(app)/profile/components/*.tsx`
  - SkillEditor.tsx
  - Avalable.tsx
  - ShortProfiel.tsx
  - ProfileEdit.tsx
  - About.tsx
  - Language.tsx
  - CreditsEditor.tsx
  - WhatAppNumber.tsx
  - WorkStatus.tsx
  - etc.

### Settings
- `/app/(app)/settings/page.tsx`
  - Account updates
  - Password changes
  - Account deletion

### Authentication
- `/app/(auth)/login/page.tsx`
- `/app/(auth)/signup/page.tsx`
- `/app/(auth)/otp/page.tsx`
- `/app/(auth)/forget-password/page.tsx`
- `/app/(auth)/reset-password/page.tsx`

### Gigs
- `/app/(app)/(gigs)/components/manage-gigs/*.tsx`

### Slate (Posts)
- `/app/components/modules/slate/CreateSlateDialog.tsx`

## Technical Implementation

### Sonner Library
- Uses the `sonner` library (v2.0.7)
- Configured via `Toaster` component from `/app/components/ui/sonner.tsx`
- Wrapped in app providers at `/app/components/Providers/index.tsx`

### Styling Approach
- Uses Tailwind CSS classes for styling
- Leverages `group-[.toaster]` selector for toast-specific styles
- Border removed for cleaner look
- Shadow added for depth

### Theme Support
- Integrates with `next-themes` for dark/light mode support
- Custom colors override default theme colors

## Benefits

1. **Brand Consistency**: All toasts use HeyProData's brand colors
2. **Visual Hierarchy**: Different colors for different message types
3. **User Experience**: Clear, visible notifications that match the app design
4. **Accessibility**: High contrast white text on colored backgrounds
5. **Comprehensive**: Covers all toast types used in the application

## Testing

To test the toasts:
1. Navigate to `/toast-demo` page
2. Click each button to see the different toast styles
3. Verify colors match brand guidelines:
   - Success: #31A7AC (Teal)
   - Error: #FA6E80 (Pink)
   - Info: Gradient (Teal → Pink)
   - Warning: Gradient (Pink → Teal)
   - Loading: #31A7AC (Teal)
   - Default: Gradient (Pink → Teal)

## Notes

- All toasts automatically dismiss after a few seconds
- Loading toasts must be manually dismissed using `toast.dismiss(toastId)`
- Toasts stack vertically and slide in from the top
- Position can be adjusted via the `Toaster` component props if needed
