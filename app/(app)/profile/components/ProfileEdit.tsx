"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import apiCalling from "@/lib/apiCalling"
import type { ProfileData } from "@/hooks/useProfile"

interface EditProfileInfoProps {
    profile: ProfileData | null;
    trigger: React.ReactNode;
}

export default function ProfileEditor({ profile, trigger }: EditProfileInfoProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [firstName, setFirstName] = useState(profile?.first_name || '')
    const [surname, setSurname] = useState(profile?.surname || '')
    const [aliasFirstName, setAliasFirstName] = useState(profile?.alias_first_name || '')
    const [aliasSurname, setAliasSurname] = useState(profile?.alias_surname || '')
    const [bio, setBio] = useState(profile?.bio || '')
    const [city, setCity] = useState(profile?.city || '')
    const [country, setCountry] = useState(profile?.country || '')

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            const response = await apiCalling({
                method: 'post',
                route: '/profile',
                data: {
                    first_name: firstName,
                    surname: surname,
                    alias_first_name: aliasFirstName || null,
                    alias_surname: aliasSurname || null,
                    bio: bio,
                    city: city,
                    country: country
                }
            });

            if (response.status) {
                toast.success("Profile updated successfully!");
                setIsDialogOpen(false);
                // Refresh the page to show updated data
                window.location.reload();
            } else {
                toast.error(response.message || "Failed to update profile");
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    }

    const handleCancel = () => {
        // Reset state to initial values
        setFirstName(profile?.first_name || '');
        setSurname(profile?.surname || '');
        setAliasFirstName(profile?.alias_first_name || '');
        setAliasSurname(profile?.alias_surname || '');
        setBio(profile?.bio || '');
        setCity(profile?.city || '');
        setCountry(profile?.country || '');
        setIsDialogOpen(false);
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="w-[500px] mx-auto h-[90vh] flex flex-col">
                <DialogHeader className="p-2 sm:p-3 md:p-5 pb-1">
                    <DialogTitle className="text-2xl font-normal">Edit Profile info</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        You can write about your years of experience, industry, or skills. People also talk about their
                        achievements or previous job experiences.
                    </p>
                </DialogHeader>

                <div className="flex-1  overflow-y-auto px-6 sm:px-8 md:px-10">
                    <div className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2 flex flex-col">
                            <label className="text-base font-normal">Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 rounded-2xl border-gray-400 focus:border-none focus:outline-none focus:ring-none text-base"
                            />
                        </div>

                        {/* Alias name */}
                        <div className="space-y-2">
                            <label className="text-base font-normal">Alias name</label>
                            <Input
                                value={aliasName}
                                onChange={(e) => setAliasName(e.target.value)}
                                className="h-12 rounded-2xl border-gray-400 text-base"
                            />
                        </div>

                        {/* Short about */}
                        <div className="space-y-2">
                            <label className="text-base font-normal">Short about</label>
                            <Textarea
                                value={shortAbout}
                                onChange={(e) => setShortAbout(e.target.value)}
                                className="min-h-[100px] rounded-2xl border-gray-400 text-base resize-none"
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-base font-normal">Location</label>
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="h-12 rounded-2xl border-gray-400 text-base"
                            />
                        </div>

                        {/* Links */}
                        <div className="space-y-3">
                            <label className="text-base font-normal">Links</label>
                            {links.map((link, index) => (
                                <div key={index} className="space-y-2 pb-3 border-b last:border-b-0">
                                    <div className="flex items-center justify-between">
                                        <Input
                                            placeholder="Label (e.g., Website, Instagram)"
                                            value={link.label}
                                            defaultValue={link.label}
                                            onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                                            className="h-12 rounded-2xl border-gray-400 text-base"
                                        />
                                        {links.length > 0 && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleRemoveLink(index)}
                                                className="ml-2 h-10 w-10 rounded-full hover:bg-destructive/10"
                                            >
                                                <X className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        placeholder="URL"
                                        value={link.url}
                                        onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                                        className="h-12 rounded-2xl border-gray-400 text-base"
                                    />
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={handleAddLink}
                                className="w-full h-12 rounded-2xl border-gray-400 text-base bg-transparent"
                            >
                                Add Link
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 p-2 sm:p-3 md:p-4 pt-6 ">
                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="flex-1 py-3 h-15 text-lg border-2 border-[#FA6E80] text-[#FA6E80]  rounded-2xl bg-transparent"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveChanges}
                        className="flex-1 py-3 h-15 text-lg bg-[#FA6E80] text-white rounded-2xl"
                    >
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
