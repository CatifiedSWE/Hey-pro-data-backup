-- =====================================================
-- CHAT MODULE - ROW LEVEL SECURITY POLICIES
-- =====================================================
-- Description: Implements security policies for chat tables
-- Dependencies: All chat tables and indexes must exist
-- Version: 1.0.0
-- Last Updated: January 2025
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CONVERSATIONS POLICIES
-- =====================================================

-- Users can view conversations they are part of
CREATE POLICY "Users can view their own conversations"
    ON conversations
    FOR SELECT
    USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Users can create conversations with other users
CREATE POLICY "Users can create conversations"
    ON conversations
    FOR INSERT
    WITH CHECK (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Users can update conversations they are part of (for last_message updates)
CREATE POLICY "Users can update their own conversations"
    ON conversations
    FOR UPDATE
    USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    )
    WITH CHECK (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Users cannot delete conversations (soft delete messages instead)
CREATE POLICY "Users cannot delete conversations"
    ON conversations
    FOR DELETE
    USING (FALSE);

-- =====================================================
-- GROUP CHATS POLICIES
-- =====================================================

-- Users can view groups they are members of
CREATE POLICY "Users can view groups they are members of"
    ON group_chats
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = group_chats.id
                AND group_members.user_id = auth.uid()
        )
    );

-- Any authenticated user can create a group
CREATE POLICY "Authenticated users can create groups"
    ON group_chats
    FOR INSERT
    WITH CHECK (
        auth.uid() = created_by
    );

-- Only group admins can update group details
CREATE POLICY "Group admins can update group details"
    ON group_chats
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = group_chats.id
                AND group_members.user_id = auth.uid()
                AND group_members.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = group_chats.id
                AND group_members.user_id = auth.uid()
                AND group_members.role = 'admin'
        )
    );

-- Only group admins can delete groups
CREATE POLICY "Group admins can delete groups"
    ON group_chats
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = group_chats.id
                AND group_members.user_id = auth.uid()
                AND group_members.role = 'admin'
        )
    );

-- =====================================================
-- GROUP MEMBERS POLICIES
-- =====================================================

-- Users can view members of groups they belong to
CREATE POLICY "Users can view group members"
    ON group_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM group_members gm
            WHERE gm.group_id = group_members.group_id
                AND gm.user_id = auth.uid()
        )
    );

-- Group admins and group creators can add members
CREATE POLICY "Group admins can add members"
    ON group_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM group_members
            WHERE group_members.group_id = group_members.group_id
                AND group_members.user_id = auth.uid()
                AND group_members.role = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM group_chats
            WHERE group_chats.id = group_members.group_id
                AND group_chats.created_by = auth.uid()
        )
    );

-- Users can remove themselves from groups
-- Admins can remove other members
CREATE POLICY "Users can leave groups, admins can remove members"
    ON group_members
    FOR DELETE
    USING (
        group_members.user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM group_members gm
            WHERE gm.group_id = group_members.group_id
                AND gm.user_id = auth.uid()
                AND gm.role = 'admin'
        )
    );

-- Only group admins can update member roles
CREATE POLICY "Group admins can update member roles"
    ON group_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM group_members gm
            WHERE gm.group_id = group_members.group_id
                AND gm.user_id = auth.uid()
                AND gm.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM group_members gm
            WHERE gm.group_id = group_members.group_id
                AND gm.user_id = auth.uid()
                AND gm.role = 'admin'
        )
    );

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

-- Users can view messages in conversations they are part of
CREATE POLICY "Users can view conversation messages"
    ON messages
    FOR SELECT
    USING (
        deleted_at IS NULL
        AND
        (
            -- For conversation messages
            (conversation_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM conversations
                WHERE conversations.id = messages.conversation_id
                    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
            ))
            OR
            -- For group messages
            (group_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM group_members
                WHERE group_members.group_id = messages.group_id
                    AND group_members.user_id = auth.uid()
            ))
        )
    );

-- Users can send messages in conversations they are part of
CREATE POLICY "Users can send conversation messages"
    ON messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND
        (
            -- For conversation messages
            (conversation_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM conversations
                WHERE conversations.id = messages.conversation_id
                    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
            ))
            OR
            -- For group messages
            (group_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM group_members
                WHERE group_members.group_id = messages.group_id
                    AND group_members.user_id = auth.uid()
            ))
        )
    );

-- Users can update their own messages (for status updates or edits)
CREATE POLICY "Users can update their own messages"
    ON messages
    FOR UPDATE
    USING (
        sender_id = auth.uid()
        OR
        -- Recipients can update message status (delivered, read)
        (
            conversation_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM conversations
                WHERE conversations.id = messages.conversation_id
                    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
            )
        )
    )
    WITH CHECK (
        sender_id = auth.uid()
        OR
        (
            conversation_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM conversations
                WHERE conversations.id = messages.conversation_id
                    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
            )
        )
    );

-- Users can soft-delete their own messages
CREATE POLICY "Users can delete their own messages"
    ON messages
    FOR UPDATE
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- =====================================================
-- MESSAGE READ STATUS POLICIES
-- =====================================================

-- Users can view read status for messages in their groups
CREATE POLICY "Users can view message read status"
    ON message_read_status
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages
            WHERE messages.id = message_read_status.message_id
                AND messages.group_id IS NOT NULL
                AND EXISTS (
                    SELECT 1 FROM group_members
                    WHERE group_members.group_id = messages.group_id
                        AND group_members.user_id = auth.uid()
                )
        )
    );

-- Users can mark messages as read
CREATE POLICY "Users can mark messages as read"
    ON message_read_status
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM messages
            WHERE messages.id = message_read_status.message_id
                AND messages.group_id IS NOT NULL
                AND EXISTS (
                    SELECT 1 FROM group_members
                    WHERE group_members.group_id = messages.group_id
                        AND group_members.user_id = auth.uid()
                )
        )
    );

-- Users can update their own read status
CREATE POLICY "Users can update their read status"
    ON message_read_status
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- TYPING INDICATORS POLICIES
-- =====================================================

-- Users can view typing indicators in conversations/groups they are part of
CREATE POLICY "Users can view typing indicators"
    ON typing_indicators
    FOR SELECT
    USING (
        (
            -- For conversation typing
            conversation_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM conversations
                WHERE conversations.id = typing_indicators.conversation_id
                    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
            )
        )
        OR
        (
            -- For group typing
            group_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM group_members
                WHERE group_members.group_id = typing_indicators.group_id
                    AND group_members.user_id = auth.uid()
            )
        )
    );

-- Users can set their own typing status
CREATE POLICY "Users can set their typing status"
    ON typing_indicators
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND
        (
            -- For conversation typing
            (conversation_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM conversations
                WHERE conversations.id = typing_indicators.conversation_id
                    AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
            ))
            OR
            -- For group typing
            (group_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM group_members
                WHERE group_members.group_id = typing_indicators.group_id
                    AND group_members.user_id = auth.uid()
            ))
        )
    );

-- Users can update their own typing status
CREATE POLICY "Users can update their typing status"
    ON typing_indicators
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own typing status
CREATE POLICY "Users can delete their typing status"
    ON typing_indicators
    FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify all RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'conversations',
        'group_chats',
        'group_members',
        'messages',
        'message_read_status',
        'typing_indicators'
    )
ORDER BY tablename, policyname;
