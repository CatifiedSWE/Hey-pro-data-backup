import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, createServerClient, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/upload/whatson-image
 * Upload What's On event images (thumbnail and hero)
 * Bucket: whatson-images/ (Public)
 * Max Size: 10 MB
 * Allowed Types: JPEG, JPG, PNG, WebP
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
    const eventId = formData.get('event_id') as string | null;
    const imageType = formData.get('type') as string | null; // 'thumbnail' or 'hero'

    if (!file) {
      return NextResponse.json(
        errorResponse('No file provided'),
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        errorResponse('Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed.'),
        { status: 415 }
      );
    }

    // Validate file size (10 MB max)
    const maxSize = 10 * 1024 * 1024; // 10 MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        errorResponse('File too large. Maximum size is 10 MB.'),
        { status: 413 }
      );
    }

    const supabase = createServerClient();

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const typePrefix = imageType === 'thumbnail' ? 'thumb' : 'hero';
    const fileName = `${typePrefix}-${timestamp}-${randomString}.${fileExtension}`;

    // Build file path: user_id/event_id/filename or user_id/filename
    const filePath = eventId 
      ? `${user.id}/${eventId}/${fileName}`
      : `${user.id}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('whatson-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        errorResponse('Failed to upload file', uploadError.message),
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('whatson-images')
      .getPublicUrl(filePath);

    return NextResponse.json(
      successResponse(
        {
          url: publicUrlData.publicUrl,
          path: filePath,
          size: file.size,
          mimeType: file.type,
          type: imageType
        },
        'Image uploaded successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/upload/whatson-image:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
