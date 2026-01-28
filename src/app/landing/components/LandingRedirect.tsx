'use client';

import { useEffect } from 'react';
import { markAsVisited } from '@/lib/utils/firstVisit';

export default function LandingRedirect() {
  useEffect(() => {
    markAsVisited();
  }, []);

  return null;
}
