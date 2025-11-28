"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import apiCalling from "@/lib/apiCalling";
import { Card, CardContent } from "@/components/ui/card";

interface RecommendationData {
    id: string;
    recommended_user_id: string;
    created_at?: string;
    user_profiles?: {
        user_id: string;
        first_name?: string;
        surname?: string;
        profile_photo_url?: string;
    };
}

interface RecommendationsComponentProps {
    recommendations?: RecommendationData[];
    onUpdate?: () => void;
}

export default function RecommendationsComponent({ 
    recommendations = [], 
    onUpdate 
}: RecommendationsComponentProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState('');

    const handleAddRecommendation = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!userId.trim()) {
            toast.error('Please enter a user ID');
            return;
        }

        setIsLoading(true);

        try {
            const response = await apiCalling({
                method: 'post',
                route: '/profile/recommendations',
                data: { recommended_user_id: userId.trim() }
            });

            if (response.status) {
                toast.success('Recommendation added successfully!');
                setIsAddDialogOpen(false);
                setUserId('');
                if (onUpdate) {
                    onUpdate();
                }
            } else {
                toast.error(response.message || 'Failed to add recommendation');
            }
        } catch (err) {
            console.error('Error adding recommendation:', err);
            toast.error('Failed to add recommendation');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteRecommendation = async (id: string) => {
        if (!confirm('Are you sure you want to remove this recommendation?')) {
            return;
        }

        try {
            const response = await apiCalling({
                method: 'delete',
                route: `/profile/recommendations?id=${id}`
            });

            if (response.status) {
                toast.success('Recommendation removed successfully!');
                if (onUpdate) {
                    onUpdate();
                }
            } else {
                toast.error(response.message || 'Failed to remove recommendation');
            }
        } catch (err) {
            console.error('Error deleting recommendation:', err);
            toast.error('Failed to remove recommendation');
        }
    };

    const getInitials = (firstName?: string, surname?: string) => {
        const first = firstName?.charAt(0) || '';
        const last = surname?.charAt(0) || '';
        return (first + last).toUpperCase() || '?';
    };

    const getFullName = (firstName?: string, surname?: string) => {
        return `${firstName || ''} ${surname || ''}`.trim() || 'Anonymous User';
    };

    return (
        <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)] sm:px-10 sm:py-9">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[22px] font-semibold leading-[33px] text-[#000]">
                    Recommendations
                </h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            size="icon" 
                            variant="default" 
                            className="rounded-full border border-[#31A7AC]/30 bg-[#FA6E80] text-[#ffffff] hover:bg-[#FA6E80]/90"
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleAddRecommendation}>
                            <DialogHeader>
                                <DialogTitle>Add Recommendation</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="user-id">User ID</Label>
                                    <Input
                                        id="user-id"
                                        placeholder="Enter user ID to recommend"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="rounded-[10px]"
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter the ID of the user you want to add as a recommendation.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="rounded-[16px]"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button 
                                    type="submit" 
                                    className="rounded-[16px] bg-[#FA6E80] hover:bg-[#FA6E80]/90"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Adding...' : 'Add'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 rounded-full bg-gray-100 p-6">
                        <svg 
                            className="h-12 w-12 text-gray-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        No recommendations yet
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                        Add recommendations to showcase professional connections.
                    </p>
                    <Button 
                        onClick={() => setIsAddDialogOpen(true)}
                        className="rounded-[12px] bg-[#FA6E80] hover:bg-[#FA6E80]/90"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Recommendation
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {recommendations.map((recommendation) => {
                        const profile = recommendation.user_profiles;
                        const fullName = getFullName(profile?.first_name, profile?.surname);
                        const initials = getInitials(profile?.first_name, profile?.surname);

                        return (
                            <Card key={recommendation.id} className="overflow-hidden border-0 shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-14 w-14">
                                            <AvatarImage 
                                                src={profile?.profile_photo_url} 
                                                alt={fullName}
                                            />
                                            <AvatarFallback className="bg-[#31A7AC] text-white">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-base text-[#000] truncate">
                                                {fullName}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                User ID: {recommendation.recommended_user_id}
                                            </p>
                                            {recommendation.created_at && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Added {new Date(recommendation.created_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDeleteRecommendation(recommendation.id)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
