import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * GET /api/contacts/gig/[gigId]
 * Get all contacts for a gig
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { gigId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);

    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const gigId = params.gigId;

    // Verify user is the gig creator
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .select('created_by')
      .eq('id', gigId)
      .maybeSingle();

    if (gigError) {
      console.error('Gig fetch error:', gigError);
      return NextResponse.json(
        errorResponse('Failed to fetch gig', gigError.message),
        { status: 500 }
      );
    }

    if (!gig) {
      return NextResponse.json(
        errorResponse('Gig not found'),
        { status: 404 }
      );
    }

    if (gig.created_by !== user.id) {
      return NextResponse.json(
        errorResponse('Only the gig creator can view contacts'),
        { status: 403 }
      );
    }

    // Fetch contacts for the gig
    const { data: contacts, error: contactsError } = await supabase
      .from('crew_contacts')
      .select('*')
      .eq('gig_id', gigId)
      .order('created_at', { ascending: false });

    if (contactsError) {
      console.error('Contacts fetch error:', contactsError);
      return NextResponse.json(
        errorResponse('Failed to fetch contacts', contactsError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(contacts || [], 'Contacts retrieved successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in GET /api/contacts/gig/[gigId]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
