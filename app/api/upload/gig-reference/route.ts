import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/upload/gig-reference
 * Upload gig reference file
 * Bucket: portfolios/ (Private)
 * Max Size: 10 MB
 * Allowed Types: PDF, Images, Videos
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        errorResponse('No file provided'),
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      // PDF
      'application/pdf',
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      // Videos
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/mpeg'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        errorResponse('Invalid file type. Allowed: PDF, JPEG, PNG, GIF, WebP, MP4, MOV, AVI, MPEG'),
        { status: 415 }
      );
    }

    // Validate file size (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        errorResponse('File too large. Maximum size is 10MB'),
        { status: 413 }
      );
    }

    const supabase = createServerClient();

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'file';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Build file path
    const filePath = `${user.id}/gig-references/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage (using portfolios bucket)
    const { data, error: uploadError } = await supabase.storage
      .from('portfolios')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        errorResponse('Failed to upload file', uploadError.message),
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('portfolios')
      .getPublicUrl(filePath);

    // Determine media type
    let mediaType = 'file';
    if (file.type.startsWith('image/')) {
      mediaType = 'image';
    } else if (file.type.startsWith('video/')) {
      mediaType = 'video';
    } else if (file.type === 'application/pdf') {
      mediaType = 'pdf';
    }

    return NextResponse.json(
      successResponse(
        {
          url: publicUrlData.publicUrl,
          path: filePath,
          size: file.size,
          mimeType: file.type,
          fileName: file.name,
          mediaType
        },
        'File uploaded successfully'
      ),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/upload/gig-reference error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
