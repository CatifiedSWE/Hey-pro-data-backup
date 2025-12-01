import { NextRequest, NextResponse } from 'next/server';
import { validateAuthToken, successResponse, errorResponse } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// PATCH /api/chat/messages/[messageId]/read - Mark message as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: { messageId: string } }
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

    const { messageId } = params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('id, conversation_id, group_id, sender_id')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        errorResponse('Message not found'),
        { status: 404 }
      );
    }

    // Can't mark own message as read
    if (message.sender_id === user.id) {
      return NextResponse.json(
        errorResponse('Cannot mark your own message as read'),
        { status: 400 }
      );
    }

    // For 1-on-1 conversations
    if (message.conversation_id) {
      // Verify user is part of conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('id', message.conversation_id)
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

      // Update message status to read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (updateError) {
        return NextResponse.json(
          errorResponse('Failed to mark message as read', updateError.message),
          { status: 500 }
        );
      }

      return NextResponse.json(
        successResponse('Message marked as read', null)
      );
    }

    // For group messages
    if (message.group_id) {
      // Verify user is a member
      const { data: membership, error: memberError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', message.group_id)
        .eq('user_id', user.id)
        .single();

      if (memberError || !membership) {
        return NextResponse.json(
          errorResponse('Group not found or access denied'),
          { status: 404 }
        );
      }

      // Check if already read
      const { data: existing } = await supabase
        .from('message_read_status')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        return NextResponse.json(
          successResponse('Message already marked as read', null)
        );
      }

      // Insert read status
      const { error: insertError } = await supabase
        .from('message_read_status')
        .insert({
          message_id: messageId,
          user_id: user.id,
        });

      if (insertError) {
        return NextResponse.json(
          errorResponse('Failed to mark message as read', insertError.message),
          { status: 500 }
        );
      }

      return NextResponse.json(
        successResponse('Message marked as read', null)
      );
    }

    return NextResponse.json(
      errorResponse('Invalid message type'),
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      errorResponse('Internal server error', error.message),
      { status: 500 }
    );
  }
}
