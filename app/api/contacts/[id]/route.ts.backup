import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';

/**
 * DELETE /api/contacts/[id]
 * Delete a contact
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const contactId = params.id;

    // Fetch contact to verify ownership
    const { data: contact, error: contactError } = await supabase
      .from('crew_contacts')
      .select('gig_id, gigs!inner(creator_user_id)')
      .eq('id', contactId)
      .maybeSingle();

    if (contactError) {
      console.error('Contact fetch error:', contactError);
      return NextResponse.json(
        errorResponse('Failed to fetch contact', contactError.message),
        { status: 500 }
      );
    }

    if (!contact) {
      return NextResponse.json(
        errorResponse('Contact not found'),
        { status: 404 }
      );
    }

    // Verify user is the gig creator
    const gigCreatorId = (contact.gigs as any).creator_user_id;
    if (gigCreatorId !== user.id) {
      return NextResponse.json(
        errorResponse('Only the gig creator can delete contacts'),
        { status: 403 }
      );
    }

    // Delete contact
    const { error: deleteError } = await supabase
      .from('crew_contacts')
      .delete()
      .eq('id', contactId);

    if (deleteError) {
      console.error('Contact deletion error:', deleteError);
      return NextResponse.json(
        errorResponse('Failed to delete contact', deleteError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(null, 'Contact deleted successfully'),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in DELETE /api/contacts/[id]:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
