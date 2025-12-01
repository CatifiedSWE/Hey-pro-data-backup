import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// DELETE /api/chat/groups/[groupId]/members/[userId] - Remove member from group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string; userId: string } }
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

    const { groupId, userId } = params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user is removing themselves or is an admin
    const isSelf = userId === user.id;

    if (!isSelf) {
      // Verify current user is an admin
      const { data: membership, error: memberError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !membership || membership.role !== 'admin') {
        return NextResponse.json(
          errorResponse('Only group admins can remove other members'),
          { status: 403 }
        );
      }
    }

    // Check if target user is a member
    const { data: targetMembership, error: targetError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (targetError || !targetMembership) {
      return NextResponse.json(
        errorResponse('User is not a member of this group'),
        { status: 404 }
      );
    }

    // Prevent removing the last admin (unless they're removing themselves)
    if (targetMembership.role === 'admin') {
      const { count: adminCount } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('role', 'admin');

      if (adminCount === 1 && !isSelf) {
        return NextResponse.json(
          errorResponse('Cannot remove the last admin from the group'),
          { status: 400 }
        );
      }
    }

    // Remove member
    const { error: deleteError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (deleteError) {
      return NextResponse.json(
        errorResponse('Failed to remove member', deleteError.message),
        { status: 500 }
      );
    }

    // Create notification if it's not self-removal
    if (!isSelf) {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          actor_id: user.id,
          type: 'group_removed',
          message: 'You have been removed from a group',
          metadata: {
            group_id: groupId,
          },
        });
    }

    return NextResponse.json(
      successResponse(isSelf ? 'Left group successfully' : 'Member removed successfully', null)
    );

  } catch (error: any) {
    console.error('Error removing group member:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
