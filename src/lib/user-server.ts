'use server';

import { auth } from '@clerk/nextjs/server';
import { supabase } from './supabase';
import { cache } from 'react';

// Cache da função durante a renderização (React 18+)
export const getCurrentUserStatus = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return {
      isAuthenticated: false,
      isPremium: false,
      isAdmin: false,
      userId: null,
    };
  }

  const { data: user } = await supabase
    .from('users')
    .select('is_premium, is_admin')
    .eq('clerk_id', userId)
    .single();

  return {
    isAuthenticated: true,
    isPremium: user?.is_premium || false,
    isAdmin: user?.is_admin || false,
    userId,
  };
});
