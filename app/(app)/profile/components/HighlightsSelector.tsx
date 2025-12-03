"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HighlightSelectCard } from "./HighlightSelectCard";
import { apiCalling } from "@/lib/apiCalling";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface HighlightsSelectorProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  currentHighlights: Array<{
    id: string;
    source_type?: string;
    source_id?: string;
  }>;
}

interface SelectedItem {
  source_type: 'credit' | 'slate_post';
  source_id: string;
  sort_order: number;
}

export function HighlightsSelector({ 
  open,
  onClose, 
  onSave, 
  currentHighlights 
}: HighlightsSelectorProps) {
  const [credits, setCredits] = useState<any[]>([]);
  const [slatePosts, setSlatePosts] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'credits' | 'slate'>('credits');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
      
      // Initialize selected items from current highlights
      const initialSelected = currentHighlights
        .filter(h => h.source_type && h.source_id)
        .map((h, index) => ({
          source_type: h.source_type as 'credit' | 'slate_post',
          source_id: h.source_id!,
          sort_order: index
        }));
      setSelectedItems(initialSelected);
    }
  }, [open, currentHighlights]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch credits
      const creditsResponse = await apiCalling.get('/api/profile/credits', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (creditsResponse.data.success) {
        setCredits(creditsResponse.data.data || []);
      }

      // Fetch slate posts
      const slateResponse = await apiCalling.get('/api/slate/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (slateResponse.data.success) {
        setSlatePosts(slateResponse.data.data?.posts || []);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (type: 'credit' | 'slate_post', id: string): boolean => {
    return selectedItems.some(
      item => item.source_type === type && item.source_id === id
    );
  };

  const handleToggleSelect = (type: 'credit' | 'slate_post', id: string) => {
    const alreadySelected = isSelected(type, id);
    
    if (alreadySelected) {
      // Remove from selection
      setSelectedItems(prev => 
        prev.filter(item => !(item.source_type === type && item.source_id === id))
      );
    } else {
      // Check if we've reached the limit
      if (selectedItems.length >= 3) {
        toast.error('You can only select up to 3 highlights');
        return;
      }
      
      // Add to selection
      setSelectedItems(prev => [
        ...prev,
        {
          source_type: type,
          source_id: id,
          sort_order: prev.length
        }
      ]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Delete all existing highlights
      for (const highlight of currentHighlights) {
        await apiCalling.delete(`/api/profile/highlights?id=${highlight.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Create new highlights from selected items
      for (const item of selectedItems) {
        await apiCalling.post('/api/profile/highlights', 
          {
            source_type: item.source_type,
            source_id: item.source_id,
            sort_order: item.sort_order
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      toast.success('Highlights updated successfully');
      onSave();
    } catch (error: any) {
      console.error('Error saving highlights:', error);
      toast.error(error.response?.data?.error || 'Failed to save highlights');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Highlights</DialogTitle>
          <p className="text-sm text-gray-600">
            Choose up to 3 items to showcase on your profile (from credits or slate posts)
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#FA6E80]" />
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'credits' | 'slate')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="credits">
                  Credits ({credits.length})
                </TabsTrigger>
                <TabsTrigger value="slate">
                  Slate Posts ({slatePosts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="credits">
                <ScrollArea className="h-[400px] pr-4">
                  {credits.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No credits found.</p>
                      <p className="text-sm mt-2">Add credits to your profile to feature them as highlights.</p>
                    </div>
                  ) : (
                    credits.map(credit => (
                      <HighlightSelectCard
                        key={credit.id}
                        type="credit"
                        item={credit}
                        isSelected={isSelected('credit', credit.id)}
                        onToggle={() => handleToggleSelect('credit', credit.id)}
                        disabled={selectedItems.length >= 3 && !isSelected('credit', credit.id)}
                      />
                    ))
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="slate">
                <ScrollArea className="h-[400px] pr-4">
                  {slatePosts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No slate posts found.</p>
                      <p className="text-sm mt-2">Create slate posts to feature them as highlights.</p>
                    </div>
                  ) : (
                    slatePosts.map(post => (
                      <HighlightSelectCard
                        key={post.id}
                        type="slate_post"
                        item={post}
                        isSelected={isSelected('slate_post', post.id)}
                        onToggle={() => handleToggleSelect('slate_post', post.id)}
                        disabled={selectedItems.length >= 3 && !isSelected('slate_post', post.id)}
                      />
                    ))
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>

            {/* Selected count indicator */}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-gray-600">
                Selected: <span className="font-semibold">{selectedItems.length} / 3</span>
              </span>
              {selectedItems.length === 3 && (
                <span className="text-xs text-amber-600">Maximum highlights reached</span>
              )}
            </div>
          </>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-[#FA6E80] hover:bg-[#FA596E]"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Highlights'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
