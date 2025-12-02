"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, EyeOff, Trash2, Save, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    // Account Information State
    const [email, setEmail] = useState("user@heyprodata.com");
    const [phone, setPhone] = useState("+971 50 123 4567");
    const [isEditingAccount, setIsEditingAccount] = useState(false);

    // Password Reset State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Account Deletion State
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

    const handleSaveAccountInfo = () => {
        // Mock save functionality
        toast.success("Account information updated successfully!");
        setIsEditingAccount(false);
    };

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }
        
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        // Mock password reset
        toast.success("Password reset successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleAccountDeletion = () => {
        if (deleteConfirmation !== "DELETE") {
            toast.error('Please type "DELETE" to confirm');
            return;
        }

        // Mock account deletion
        toast.success("Account deletion request submitted");
        setDeleteConfirmation("");
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
            </div>

            <div className="space-y-6">
                {/* Account Information */}
                <Card className="p-6 border-gray-200 bg-white" data-testid="account-info-card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Account Information</h2>
                        {!isEditingAccount && (
                            <Button
                                onClick={() => setIsEditingAccount(true)}
                                variant="outline"
                                size="sm"
                                className="border-[#6A89BE] text-[#6A89BE] hover:bg-[#6A89BE] hover:text-white"
                                data-testid="edit-account-button"
                            >
                                Edit
                            </Button>
                        )}
                    </div>
                    <Separator className="mb-4" />
                    
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email Address
                            </Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={!isEditingAccount}
                                    className="pl-10 disabled:bg-[#F8F8F8] disabled:cursor-not-allowed"
                                    data-testid="email-input"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                Phone Number
                            </Label>
                            <div className="relative mt-1">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={!isEditingAccount}
                                    className="pl-10 disabled:bg-[#F8F8F8] disabled:cursor-not-allowed"
                                    data-testid="phone-input"
                                />
                            </div>
                        </div>

                        {isEditingAccount && (
                            <div className="flex gap-2 pt-2">
                                <Button
                                    onClick={handleSaveAccountInfo}
                                    className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] text-white hover:opacity-90"
                                    data-testid="save-account-button"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                                <Button
                                    onClick={() => setIsEditingAccount(false)}
                                    variant="outline"
                                    data-testid="cancel-edit-button"
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Password Reset */}
                <Card className="p-6 border-gray-200 bg-white" data-testid="password-reset-card">
                    <h2 className="text-xl font-semibold mb-4">Password Reset</h2>
                    <Separator className="mb-4" />
                    
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div>
                            <Label htmlFor="current-password" className="text-sm font-medium text-gray-700">
                                Current Password
                            </Label>
                            <div className="relative mt-1">
                                <Input
                                    id="current-password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    className="pr-10"
                                    data-testid="current-password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    data-testid="toggle-current-password"
                                >
                                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                                New Password
                            </Label>
                            <div className="relative mt-1">
                                <Input
                                    id="new-password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min. 8 characters)"
                                    className="pr-10"
                                    data-testid="new-password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    data-testid="toggle-new-password"
                                >
                                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                                Confirm New Password
                            </Label>
                            <div className="relative mt-1">
                                <Input
                                    id="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="pr-10"
                                    data-testid="confirm-password-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    data-testid="toggle-confirm-password"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] text-white hover:opacity-90"
                            data-testid="reset-password-button"
                        >
                            Reset Password
                        </Button>
                    </form>
                </Card>

                {/* Account Deletion */}
                <Card className="p-6 border-red-200 bg-red-50/50" data-testid="account-deletion-card">
                    <h2 className="text-xl font-semibold text-red-700 mb-4">Danger Zone</h2>
                    <Separator className="mb-4 bg-red-200" />
                    
                    <div className="space-y-3">
                        <p className="text-sm text-gray-700">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="bg-red-600 hover:bg-red-700"
                                    data-testid="delete-account-trigger"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Account
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent data-testid="delete-account-dialog">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="space-y-3">
                                        <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
                                        <div className="pt-2">
                                            <Label htmlFor="delete-confirm" className="text-sm font-medium text-gray-700">
                                                Type <span className="font-bold">DELETE</span> to confirm
                                            </Label>
                                            <Input
                                                id="delete-confirm"
                                                value={deleteConfirmation}
                                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                                placeholder="Type DELETE"
                                                className="mt-2"
                                                data-testid="delete-confirmation-input"
                                            />
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeleteConfirmation("")} data-testid="cancel-delete-button">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleAccountDeletion}
                                        className="bg-red-600 hover:bg-red-700"
                                        data-testid="confirm-delete-button"
                                    >
                                        Delete Account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </Card>
            </div>
        </div>
    );
}
