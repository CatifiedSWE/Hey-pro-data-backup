"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, Download, Trash2, File } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FileUpload {
    id: string;
    name: string;
    url: string;
    type: 'resume' | 'portfolio';
    uploadedAt: string;
    size?: number;
}

interface ResumePortfolioProps {
    resumeUrl?: string;
    portfolioUrl?: string;
    onUpdate?: () => void;
}

export default function ResumePortfolio({ 
    resumeUrl, 
    portfolioUrl, 
    onUpdate 
}: ResumePortfolioProps) {
    const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
    const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileUpload = async (
        file: File, 
        type: 'resume' | 'portfolio'
    ) => {
        if (!file) {
            toast.error('Please select a file');
            return;
        }

        // Validate file size
        const maxSize = type === 'resume' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for resume, 10MB for portfolio
        if (file.size > maxSize) {
            toast.error(`File size must be less than ${type === 'resume' ? '5' : '10'}MB`);
            return;
        }

        // Validate file type
        const resumeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const portfolioTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];
        
        const allowedTypes = type === 'resume' ? resumeTypes : portfolioTypes;
        if (!allowedTypes.includes(file.type)) {
            toast.error(`Invalid file type for ${type}`);
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Get the access token from Supabase session
            const token = await getAccessToken();
            
            if (!token) {
                toast.error('Not authenticated. Please log in again.');
                return;
            }

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await fetch(`/api/upload/${type}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const data = await response.json();

            if (data.success) {
                toast.success(`${type === 'resume' ? 'Resume' : 'Portfolio'} uploaded successfully!`);
                if (type === 'resume') {
                    setIsResumeDialogOpen(false);
                } else {
                    setIsPortfolioDialogOpen(false);
                }
                if (onUpdate) {
                    onUpdate();
                }
            } else {
                toast.error(data.error || `Failed to upload ${type}`);
            }
        } catch (err) {
            console.error(`Error uploading ${type}:`, err);
            toast.error(`Failed to upload ${type}`);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleFileSelect = (
        e: React.ChangeEvent<HTMLInputElement>, 
        type: 'resume' | 'portfolio'
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file, type);
        }
    };

    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'Unknown size';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)] sm:px-10 sm:py-9">
            <div className="mb-6">
                <h2 className="text-[22px] font-semibold leading-[33px] text-[#000]">
                    Resume & Portfolio
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Upload your resume and portfolio files to showcase your work
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Resume Card */}
                <Card className="overflow-hidden border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="rounded-full bg-[#FA6E80]/10 p-3">
                                <FileText className="h-6 w-6 text-[#FA6E80]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base text-[#000] mb-1">
                                    Resume
                                </h3>
                                {resumeUrl ? (
                                    <>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Resume uploaded
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownload(resumeUrl, 'resume.pdf')}
                                                className="rounded-[10px]"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
                                            </Button>
                                            <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="rounded-[10px] bg-[#FA6E80] hover:bg-[#FA6E80]/90"
                                                    >
                                                        <Upload className="h-4 w-4 mr-1" />
                                                        Replace
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Upload Resume</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="resume-file">Select File</Label>
                                                            <Input
                                                                id="resume-file"
                                                                type="file"
                                                                accept=".pdf,.doc,.docx"
                                                                onChange={(e) => handleFileSelect(e, 'resume')}
                                                                disabled={isUploading}
                                                                className="rounded-[10px]"
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                Accepted formats: PDF, DOC, DOCX (Max 5MB)
                                                            </p>
                                                            {isUploading && (
                                                                <div className="mt-2">
                                                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                                                        <div
                                                                            className="h-2 rounded-full bg-[#FA6E80] transition-all duration-300"
                                                                            style={{ width: `${uploadProgress}%` }}
                                                                        />
                                                                    </div>
                                                                    <p className="text-xs text-center mt-1 text-gray-600">
                                                                        Uploading... {uploadProgress}%
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline" className="rounded-[16px]" disabled={isUploading}>
                                                                Cancel
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600 mb-3">
                                            No resume uploaded yet
                                        </p>
                                        <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="rounded-[10px] bg-[#FA6E80] hover:bg-[#FA6E80]/90"
                                                >
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Upload Resume
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Upload Resume</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="resume-file">Select File</Label>
                                                        <Input
                                                            id="resume-file"
                                                            type="file"
                                                            accept=".pdf,.doc,.docx"
                                                            onChange={(e) => handleFileSelect(e, 'resume')}
                                                            disabled={isUploading}
                                                            className="rounded-[10px]"
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Accepted formats: PDF, DOC, DOCX (Max 5MB)
                                                        </p>
                                                        {isUploading && (
                                                            <div className="mt-2">
                                                                <div className="h-2 w-full rounded-full bg-gray-200">
                                                                    <div
                                                                        className="h-2 rounded-full bg-[#FA6E80] transition-all duration-300"
                                                                        style={{ width: `${uploadProgress}%` }}
                                                                    />
                                                                </div>
                                                                <p className="text-xs text-center mt-1 text-gray-600">
                                                                    Uploading... {uploadProgress}%
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline" className="rounded-[16px]" disabled={isUploading}>
                                                            Cancel
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Portfolio Card */}
                <Card className="overflow-hidden border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="rounded-full bg-[#31A7AC]/10 p-3">
                                <File className="h-6 w-6 text-[#31A7AC]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base text-[#000] mb-1">
                                    Portfolio
                                </h3>
                                {portfolioUrl ? (
                                    <>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Portfolio uploaded
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDownload(portfolioUrl, 'portfolio.pdf')}
                                                className="rounded-[10px]"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
                                            </Button>
                                            <Dialog open={isPortfolioDialogOpen} onOpenChange={setIsPortfolioDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="rounded-[10px] bg-[#31A7AC] hover:bg-[#31A7AC]/90"
                                                    >
                                                        <Upload className="h-4 w-4 mr-1" />
                                                        Replace
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                    <DialogHeader>
                                                        <DialogTitle>Upload Portfolio</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="portfolio-file">Select File</Label>
                                                            <Input
                                                                id="portfolio-file"
                                                                type="file"
                                                                accept=".pdf,image/*,video/*"
                                                                onChange={(e) => handleFileSelect(e, 'portfolio')}
                                                                disabled={isUploading}
                                                                className="rounded-[10px]"
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                Accepted formats: PDF, Images, Videos (Max 10MB)
                                                            </p>
                                                            {isUploading && (
                                                                <div className="mt-2">
                                                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                                                        <div
                                                                            className="h-2 rounded-full bg-[#31A7AC] transition-all duration-300"
                                                                            style={{ width: `${uploadProgress}%` }}
                                                                        />
                                                                    </div>
                                                                    <p className="text-xs text-center mt-1 text-gray-600">
                                                                        Uploading... {uploadProgress}%
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline" className="rounded-[16px]" disabled={isUploading}>
                                                                Cancel
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600 mb-3">
                                            No portfolio uploaded yet
                                        </p>
                                        <Dialog open={isPortfolioDialogOpen} onOpenChange={setIsPortfolioDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="rounded-[10px] bg-[#31A7AC] hover:bg-[#31A7AC]/90"
                                                >
                                                    <Upload className="h-4 w-4 mr-1" />
                                                    Upload Portfolio
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Upload Portfolio</DialogTitle>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="portfolio-file">Select File</Label>
                                                        <Input
                                                            id="portfolio-file"
                                                            type="file"
                                                            accept=".pdf,image/*,video/*"
                                                            onChange={(e) => handleFileSelect(e, 'portfolio')}
                                                            disabled={isUploading}
                                                            className="rounded-[10px]"
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Accepted formats: PDF, Images, Videos (Max 10MB)
                                                        </p>
                                                        {isUploading && (
                                                            <div className="mt-2">
                                                                <div className="h-2 w-full rounded-full bg-gray-200">
                                                                    <div
                                                                        className="h-2 rounded-full bg-[#31A7AC] transition-all duration-300"
                                                                        style={{ width: `${uploadProgress}%` }}
                                                                    />
                                                                </div>
                                                                <p className="text-xs text-center mt-1 text-gray-600">
                                                                    Uploading... {uploadProgress}%
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline" className="rounded-[16px]" disabled={isUploading}>
                                                            Cancel
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
