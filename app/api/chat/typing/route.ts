import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// POST /api/chat/typing - Update typing status
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

    const body = await request.json();
    const { conversationId, groupId, isTyping } = body;

    // Validation
    if (!conversationId && !groupId) {
      return NextResponse.json(
        errorResponse('Either conversationId or groupId is required'),
        { status: 400 }
      );
    }

    if (conversationId && groupId) {
      return NextResponse.json(
        errorResponse('Cannot specify both conversationId and groupId'),
        { status: 400 }
      );
    }

    if (typeof isTyping !== 'boolean') {
      return NextResponse.json(
        errorResponse('isTyping must be a boolean'),
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify access
    if (conversationId) {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('id', conversationId)
        .single();

      if (convError || !conversation) {
        return NextResponse.json(
          errorResponse('Conversation not found'),
          { status: 404 }
        );
      }

      if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
        return NextResponse.json(
          errorResponse('Access denied'),
          { status: 403 }
        );
      }
    }

    if (groupId) {
      const { data: membership, error: memberError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !membership) {
        return NextResponse.json(
          errorResponse('Group not found or access denied'),
          { status: 404 }
        );
      }
    }

    // Upsert typing indicator
    const { error: upsertError } = await supabase
      .from('typing_indicators')
      .upsert(
        {
          conversation_id: conversationId || null,
          group_id: groupId || null,
          user_id: user.id,
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'conversation_id,group_id,user_id',
        }
      );

    if (upsertError) {
      return NextResponse.json(
        errorResponse('Failed to update typing status', upsertError.message),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse('Typing status updated', { isTyping })
    );

  } catch (error: any) {
    console.error('Error updating typing status:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}

// GET /api/chat/typing - Get typing users for a conversation/group
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const user = await validateAuthToken(authHeader);
    
    if (!user) {
      return NextResponse.json(
        errorResponse('Authentication required'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const groupId = searchParams.get('groupId');

    if (!conversationId && !groupId) {
      return NextResponse.json(
        errorResponse('Either conversationId or groupId is required'),
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get typing indicators (excluding current user)
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    
    let query = supabase
      .from('typing_indicators')
      .select('user_id, is_typing, updated_at')
      .eq('is_typing', true)
      .neq('user_id', user.id)
      .gte('updated_at', fiveSecondsAgo); // Only recent typing indicators

    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    } else if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data: typingUsers, error } = await query;

    if (error) {
      return NextResponse.json(
        errorResponse('Failed to fetch typing users', error.message),
        { status: 500 }
      );
    }

    // Get user profiles for typing users
    if (typingUsers && typingUsers.length > 0) {
      const userIds = typingUsers.map(t => t.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, surname')
        .in('user_id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      const enrichedTypingUsers = typingUsers.map(t => {
        const profile = profileMap.get(t.user_id);
        return {
          userId: t.user_id,
          name: profile ? `${profile.first_name || ''} ${profile.surname || ''}`.trim() : 'Unknown',
          updatedAt: t.updated_at,
        };
      });

      return NextResponse.json(
        successResponse('Typing users retrieved', { typingUsers: enrichedTypingUsers })
      );
    }

    return NextResponse.json(
      successResponse('No users currently typing', { typingUsers: [] })
    );

  } catch (error: any) {
    console.error('Error fetching typing users:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
