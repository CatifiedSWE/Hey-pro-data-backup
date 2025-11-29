import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * POST /api/upload/profile-photo
 * Upload profile photo or banner
 * Bucket: profile-photos/ (Public)
 * Max Size: 2 MB
 * Allowed Types: JPEG, PNG, WebP
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
    const type = formData.get('type') as string; // 'profile' or 'banner'
    
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
        errorResponse('Invalid file type. Allowed: JPEG, PNG, WebP'),
        { status: 415 }
      );
    }

    // Validate file size (2 MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        errorResponse('File too large. Maximum size is 2MB'),
        { status: 413 }
      );
    }

    const supabase = createServerClient();

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Build file path
    const photoType = type === 'banner' ? 'banner' : 'profile';
    const filePath = `${user.id}/${photoType}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('profile-photos')
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
      .from('profile-photos')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Update user profile in database
    // CORRECTED: banner_photo_url -> banner_url based on schema error
    const updateField = type === 'banner' ? 'banner_url' : 'profile_photo_url';
    
    const { error: dbError } = await supabase
      .from('user_profiles')
      .update({ 
        [updateField]: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json(
        errorResponse('File uploaded but failed to update profile', dbError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(
        {
          url: publicUrl,
          path: filePath,
          size: file.size,
          mimeType: file.type,
          type: photoType
        },
        'Profile photo uploaded and updated successfully'
      ),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
