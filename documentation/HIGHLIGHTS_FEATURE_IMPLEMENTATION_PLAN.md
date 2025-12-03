# Highlights Feature Implementation Plan

## 🎯 Goal
Replace hard-coded placeholder highlights with dynamic selection system allowing users to choose up to 3 items (slate posts or credits) to feature on their profile page.

---

## 📋 Current State Analysis

### Existing Components
- **Profile Page**: `/app/app/(app)/profile/page.tsx`
- **Highlights Component**: `/app/app/(app)/profile/components/Highlights.tsx`
- **API Endpoint**: `/app/app/api/profile/highlights/route.ts` (GET, POST, PATCH, DELETE)
- **Database Table**: `user_highlights` (stores title, description, image_url, sort_order)

### Current Implementation
- Highlights component shows 3 hard-coded items from `/app/data/profile.ts`
- "Edit Highlights" button exists but is not functional
- API structure already exists for highlights but uses generic title/description format
- ProfileContext has `highlights` state and methods (`fetchHighlights`, `addHighlight`, `updateHighlight`, `deleteHighlight`)

### Available Data Sources
1. **Credits**: `/app/app/api/profile/credits/route.ts`
   - Fields: `id`, `credit_title`, `description`, `image_url`, `production_type`, `role`, `project_title`, `awards`, etc.
   
2. **Slate Posts**: `/app/app/api/slate/my/route.ts`
   - Fields: `id`, `content`, `slug`, `media[]`, `likes_count`, `comments_count`, `created_at`

---

## 🎨 Feature Requirements

### User Flow
1. User clicks "Edit Highlights" button on profile page
2. Modal/dialog opens showing:
   - User's credits (from `/api/profile/credits`)
   - User's slate posts (from `/api/slate/my`)
3. User can select up to 3 items total (from both sources combined)
4. Selected items are saved to `user_highlights` table with reference to source
5. Profile page displays selected highlights dynamically

### Data Structure Enhancement
Modify `user_highlights` table to store reference to source:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "source_type": "credit" | "slate_post",
  "source_id": "uuid (reference to credit_id or slate_post_id)",
  "sort_order": 0-2,
  "created_at": "timestamp"
}
```

---

## 🔧 Implementation Steps

### ✅ STEP 1: Update Database Schema (if needed) - COMPLETE
**File**: Database migration or check existing schema

**Actions**:
- Verify if `user_highlights` table has `source_type` and `source_id` columns
- If not present, add migration to add these columns:
  - `source_type` TEXT (values: 'credit', 'slate_post')
  - `source_id` UUID (foreign key reference)
- Remove or make optional: `title`, `description`, `image_url` (these will be derived from source)

**SQL Example**:
```sql
ALTER TABLE user_highlights 
ADD COLUMN source_type TEXT,
ADD COLUMN source_id UUID;

-- Add check constraint
ALTER TABLE user_highlights
ADD CONSTRAINT valid_source_type 
CHECK (source_type IN ('credit', 'slate_post'));
```

---

### ✅ STEP 2: Update API Endpoint - COMPLETE
**File**: `/app/app/api/profile/highlights/route.ts`

**Actions**:

#### GET Endpoint Enhancement
- Keep existing GET but enhance response to include full source data
- Join with `user_credits` or `slate_posts` based on `source_type`
- Return enriched data with credit/slate post details

**Enhanced Response Format**:
```typescript
{
  "success": true,
  "data": [
    {
      "id": "highlight-uuid",
      "source_type": "credit",
      "source_id": "credit-uuid",
      "sort_order": 0,
      "source_data": {
        "credit_title": "City of Echoes",
        "description": "...",
        "image_url": "...",
        "production_type": "Feature Film",
        "role": "Director of Photography",
        // ... other credit fields
      }
    },
    {
      "id": "highlight-uuid",
      "source_type": "slate_post",
      "source_id": "slate-uuid",
      "sort_order": 1,
      "source_data": {
        "id": "slate-uuid",
        "content": "Post content...",
        "media": [{...}],
        "likes_count": 42,
        // ... other slate fields
      }
    }
  ]
}
```

#### POST Endpoint Update
- Change request body to accept `source_type` and `source_id`
- Validate maximum 3 highlights per user
- Validate that source_id exists in respective table

**New Request Body**:
```json
{
  "source_type": "credit",
  "source_id": "uuid",
  "sort_order": 0
}
```

#### DELETE Endpoint
- Keep as is (delete by highlight id)

**Validation Logic**:
```typescript
// Check max 3 highlights
const { count } = await supabase
  .from('user_highlights')
  .select('id', { count: 'exact' })
  .eq('user_id', user.id);

if (count >= 3) {
  return errorResponse('Maximum 3 highlights allowed');
}

// Validate source exists
if (source_type === 'credit') {
  const { data: credit } = await supabase
    .from('user_credits')
    .select('id')
    .eq('id', source_id)
    .eq('user_id', user.id)
    .single();
  
  if (!credit) {
    return errorResponse('Credit not found');
  }
}
```

---

### ✅ STEP 3: Create Highlights Selection Dialog Component - COMPLETE
**New File**: `/app/app/(app)/profile/components/HighlightsSelector.tsx`

**Purpose**: Modal/dialog for selecting highlights

**Component Structure**:
```tsx
interface HighlightsSelectorProps {
  onClose: () => void;
  onSave: () => void;
  currentHighlights: Array<{id: string, source_type: string, source_id: string}>;
}

export function HighlightsSelector({ onClose, onSave, currentHighlights }: HighlightsSelectorProps) {
  // State
  const [credits, setCredits] = useState([]);
  const [slatePosts, setSlatePosts] = useState([]);
  const [selectedItems, setSelectedItems] = useState(currentHighlights);
  const [activeTab, setActiveTab] = useState<'credits' | 'slate'>('credits');

  // Fetch user's credits and slate posts
  useEffect(() => {
    fetchCredits();
    fetchSlatePosts();
  }, []);

  // Handle item selection (max 3)
  const handleToggleSelect = (type: string, id: string) => {
    // Logic to add/remove from selectedItems
    // Enforce max 3 limit
  };

  // Save highlights
  const handleSave = async () => {
    // Delete existing highlights
    // Create new highlights with selected items
    // Call API for each selected item
  };

  return (
    <Dialog>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Highlights</DialogTitle>
          <p>Choose up to 3 items to showcase (max 3 total)</p>
        </DialogHeader>

        {/* Tab switcher */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="slate">Slate Posts</TabsTrigger>
          </TabsList>

          {/* Credits Tab */}
          <TabsContent value="credits">
            <ScrollArea className="h-[400px]">
              {credits.map(credit => (
                <HighlightSelectCard
                  key={credit.id}
                  type="credit"
                  item={credit}
                  isSelected={isSelected('credit', credit.id)}
                  onToggle={() => handleToggleSelect('credit', credit.id)}
                  disabled={selectedItems.length >= 3 && !isSelected('credit', credit.id)}
                />
              ))}
            </ScrollArea>
          </TabsContent>

          {/* Slate Posts Tab */}
          <TabsContent value="slate">
            <ScrollArea className="h-[400px]">
              {slatePosts.map(post => (
                <HighlightSelectCard
                  key={post.id}
                  type="slate_post"
                  item={post}
                  isSelected={isSelected('slate_post', post.id)}
                  onToggle={() => handleToggleSelect('slate_post', post.id)}
                  disabled={selectedItems.length >= 3 && !isSelected('slate_post', post.id)}
                />
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Selected count indicator */}
        <div className="text-sm text-gray-600">
          Selected: {selectedItems.length} / 3
        </div>

        {/* Action buttons */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Highlights</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### ✅ STEP 4: Create Selection Card Component - COMPLETE
**New File**: `/app/app/(app)/profile/components/HighlightSelectCard.tsx`

**Purpose**: Individual card for each credit/slate post in selector

```tsx
interface HighlightSelectCardProps {
  type: 'credit' | 'slate_post';
  item: any;
  isSelected: boolean;
  onToggle: () => void;
  disabled: boolean;
}

export function HighlightSelectCard({ type, item, isSelected, onToggle, disabled }: HighlightSelectCardProps) {
  // Render different layouts based on type
  
  if (type === 'credit') {
    return (
      <div 
        className={`p-4 border rounded-lg mb-3 cursor-pointer ${
          isSelected ? 'border-[#FA6E80] bg-pink-50' : 'border-gray-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={!disabled ? onToggle : undefined}
      >
        <div className="flex gap-4">
          {item.image_url && (
            <img src={item.image_url} className="w-20 h-20 object-cover rounded" />
          )}
          <div className="flex-1">
            <h3 className="font-semibold">{item.credit_title}</h3>
            <p className="text-sm text-gray-600">{item.production_type} • {item.role}</p>
            <p className="text-xs text-gray-500 mt-1">{item.release_year}</p>
          </div>
          <Checkbox checked={isSelected} disabled={disabled} />
        </div>
      </div>
    );
  }
  
  // Similar for slate_post
  return (
    <div className="...">
      {/* Slate post layout */}
    </div>
  );
}
```

---

### ✅ STEP 5: Update Highlights Display Component - COMPLETE
**File**: `/app/app/(app)/profile/components/Highlights.tsx`

**Actions**:
- Update to fetch and display dynamic highlights from API
- Transform highlight data based on source_type
- Render credit-based or slate-based highlights appropriately

**Key Changes**:
```tsx
export default function Highlights({ highlights: propHighlights }: HighlightsProps) {
  const { highlights: apiHighlights, fetchHighlights } = useProfile();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  
  // Use API highlights with enriched source data
  const displayHighlights = apiHighlights.length > 0 
    ? apiHighlights.map(h => transformHighlight(h))
    : propHighlights || [];

  // Transform highlight based on source type
  const transformHighlight = (highlight: any) => {
    if (highlight.source_type === 'credit') {
      const credit = highlight.source_data;
      return {
        id: highlight.id,
        title: credit.credit_title,
        description: credit.description,
        images: credit.image_url || '/credit.png',
        type: 'credit'
      };
    } else if (highlight.source_type === 'slate_post') {
      const post = highlight.source_data;
      return {
        id: highlight.id,
        title: 'Slate Post',
        description: post.content,
        images: post.media?.[0]?.media_url || '/slate.png',
        type: 'slate'
      };
    }
  };

  return (
    <section className="w-full">
      <div className="hidden lg:flex gap-6">
        <aside className="...">
          <Button
            variant="outline"
            onClick={() => setIsSelectorOpen(true)}
          >
            Edit Highlights
          </Button>
          
          {/* Display highlights */}
          <div className="space-y-6">
            {displayHighlights.map((highlight) => (
              <HighlightCard key={highlight.id} highlight={highlight} />
            ))}
          </div>
        </aside>
        
        {/* Vertical line */}
      </div>

      {/* Highlights Selector Dialog */}
      {isSelectorOpen && (
        <HighlightsSelector 
          onClose={() => setIsSelectorOpen(false)}
          onSave={() => {
            setIsSelectorOpen(false);
            fetchHighlights();
          }}
          currentHighlights={apiHighlights}
        />
      )}
    </section>
  );
}
```

---

### ✅ STEP 6: Update ProfileContext & Hook - COMPLETE
**File**: `/app/hooks/useProfile.ts`

**Actions**:
- Ensure `fetchHighlights()` calls the enhanced API endpoint
- Parse and return enriched highlight data with source information

**Update**:
```typescript
const fetchHighlights = useCallback(async () => {
  try {
    const token = await getAccessToken();
    const response = await apiCalling.get('/api/profile/highlights', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      setHighlights(response.data.data); // This now includes source_data
    }
  } catch (error) {
    console.error('Error fetching highlights:', error);
  }
}, []);
```

---

### ✅ STEP 7: Add API Methods for Highlights Management - COMPLETE
**File**: `/app/lib/apiCalling.ts` or component-level

**Helper Functions**:
```typescript
// Fetch user's credits
export async function fetchUserCredits(token: string) {
  return apiCalling.get('/api/profile/credits', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Fetch user's slate posts
export async function fetchUserSlatePosts(token: string) {
  return apiCalling.get('/api/slate/my', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Add highlight
export async function addHighlight(token: string, data: { source_type: string, source_id: string, sort_order: number }) {
  return apiCalling.post('/api/profile/highlights', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Delete highlight
export async function deleteHighlight(token: string, highlightId: string) {
  return apiCalling.delete(`/api/profile/highlights?id=${highlightId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
```

---

## 🧪 Testing Checklist

### Unit Tests
- [x] API endpoint validates max 3 highlights
- [x] API endpoint validates source_type and source_id
- [x] API returns enriched data with source information
- [x] Selection dialog enforces max 3 limit

### Integration Tests
- [x] User can open highlights selector dialog
- [x] User can view their credits in selector
- [x] User can view their slate posts in selector
- [x] User can select/deselect items
- [x] Selected items are saved correctly
- [x] Profile page displays selected highlights
- [x] Highlights display correct information (title, description, image)

### Edge Cases
- [x] User has no credits - show empty state
- [x] User has no slate posts - show empty state
- [x] User tries to select more than 3 items - prevent with UI feedback
- [x] User deletes a credit/slate post that's featured - handle gracefully
- [ ] Concurrent edits from multiple sessions (Not Implemented - Future Enhancement)

---

## 🎨 UI/UX Considerations

### Design Consistency
- Use existing button styles (`border-[#31A7AC]`, `bg-[#FA6E80]`)
- Match card styling from existing HighlightCard component
- Use Radix UI Dialog for modal
- Add loading states during API calls
- Show success toast on save

### User Feedback
- Visual indicator when max 3 reached
- Disable non-selected items when limit reached
- Show selected count (e.g., "2 / 3 selected")
- Confirmation message on successful save
- Error messages for API failures

### Mobile Responsiveness
- Dialog should be full-screen on mobile
- Cards should stack vertically
- Ensure touch targets are adequate size

---

## 📝 Database Migration Script

```sql
-- Step 1: Add new columns to user_highlights
ALTER TABLE user_highlights 
ADD COLUMN IF NOT EXISTS source_type TEXT,
ADD COLUMN IF NOT EXISTS source_id UUID;

-- Step 2: Add constraint for valid source types
ALTER TABLE user_highlights
DROP CONSTRAINT IF EXISTS valid_source_type;

ALTER TABLE user_highlights
ADD CONSTRAINT valid_source_type 
CHECK (source_type IN ('credit', 'slate_post') OR source_type IS NULL);

-- Step 3: Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_highlights_source 
ON user_highlights(user_id, source_type, source_id);

-- Step 4: Make old columns nullable (for backward compatibility)
ALTER TABLE user_highlights 
ALTER COLUMN title DROP NOT NULL,
ALTER COLUMN description DROP NOT NULL;

-- Step 5: Add comment
COMMENT ON COLUMN user_highlights.source_type IS 'Type of content: credit or slate_post';
COMMENT ON COLUMN user_highlights.source_id IS 'Reference to user_credits.id or slate_posts.id';
```

---

## 🚀 Deployment Steps

1. **Database Migration**: Run the SQL migration script on Supabase
2. **API Update**: Deploy updated `/api/profile/highlights` endpoint
3. **Component Creation**: Create new components (HighlightsSelector, HighlightSelectCard)
4. **Component Update**: Update Highlights.tsx to use new selector
5. **Testing**: Run through testing checklist
6. **Rollout**: Deploy to production

---

## 🔄 Future Enhancements

- [ ] Drag-and-drop reordering of highlights
- [ ] Preview mode before saving
- [ ] Analytics on which highlights get most views
- [ ] Support for other content types (projects, collaborations)
- [ ] Bulk operations (select all, clear all)

---

## 📚 Related Files Reference

### Components
- `/app/app/(app)/profile/page.tsx` - Main profile page
- `/app/app/(app)/profile/components/Highlights.tsx` - Highlights display
- `/app/app/(app)/profile/components/CreditView.tsx` - Credits section
- `/app/app/(app)/profile/components/slate.tsx` - Slate posts section

### API Endpoints
- `/app/app/api/profile/highlights/route.ts` - Highlights CRUD
- `/app/app/api/profile/credits/route.ts` - Credits API
- `/app/app/api/slate/my/route.ts` - User's slate posts

### Context & Hooks
- `/app/contexts/ProfileContext.tsx` - Profile context provider
- `/app/hooks/useProfile.ts` - Profile data hook

### Utilities
- `/app/lib/apiCalling.ts` - API helper functions
- `/app/lib/supabase/server.ts` - Supabase server utilities

---

## 💡 Implementation Tips

1. **Start with API**: Get the backend working first with proper data structure
2. **Test Data Flow**: Ensure enriched data flows correctly from API to UI
3. **Build UI Incrementally**: Start with basic selector, then add enhancements
4. **Handle Loading States**: Show skeletons/spinners during data fetches
5. **Error Handling**: Gracefully handle missing images, deleted sources, API errors
6. **Validation**: Frontend and backend validation for max 3 limit
7. **Accessibility**: Ensure keyboard navigation works in selector dialog

---

**End of Implementation Plan**

This plan provides a complete roadmap for transforming the highlights feature from static mock data to a dynamic, user-controlled system that showcases their best work (credits or slate posts) on their profile.
