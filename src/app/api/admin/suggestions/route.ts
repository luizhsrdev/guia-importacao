import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// Helper to check admin status
async function isAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;

  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('clerk_id', userId)
    .single();

  return data?.is_admin === true;
}

// GET - List all suggestions (admin only)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!await isAdmin(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'all', 'unread', 'read'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filter === 'unread') {
      query = query.eq('is_read', false);
    } else if (filter === 'read') {
      query = query.eq('is_read', true);
    }

    const { data: suggestions, error } = await query;

    if (error) {
      console.error('[ADMIN SUGGESTIONS] Error fetching:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get counts
    const { count: totalCount } = await supabase
      .from('suggestions')
      .select('*', { count: 'exact', head: true });

    const { count: unreadCount } = await supabase
      .from('suggestions')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    return NextResponse.json({
      suggestions,
      total: totalCount || 0,
      unread: unreadCount || 0,
    });

  } catch (error) {
    console.error('[ADMIN SUGGESTIONS] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Mark suggestion as read/unread
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!await isAdmin(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { suggestion_id, is_read } = body;

    if (!suggestion_id) {
      return NextResponse.json({ error: 'suggestion_id is required' }, { status: 400 });
    }

    const updateData: { is_read: boolean; read_at?: string | null } = {
      is_read: is_read === true,
    };

    if (is_read) {
      updateData.read_at = new Date().toISOString();
    } else {
      updateData.read_at = null;
    }

    const { error } = await supabase
      .from('suggestions')
      .update(updateData)
      .eq('id', suggestion_id);

    if (error) {
      console.error('[ADMIN SUGGESTIONS] Error updating:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[ADMIN SUGGESTIONS] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a suggestion
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!await isAdmin(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const suggestionId = searchParams.get('id');

    if (!suggestionId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('suggestions')
      .delete()
      .eq('id', suggestionId);

    if (error) {
      console.error('[ADMIN SUGGESTIONS] Error deleting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[ADMIN SUGGESTIONS] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
