'use client';

import React from 'react';
import { SuggestionFloatingButton } from './SuggestionFloatingButton';
import { SuggestionModal } from './SuggestionModal';
import { SuggestionNudge } from './SuggestionNudge';
import { useSuggestionNudge } from '@/hooks/useSuggestionNudge';

export function SuggestionWrapper() {
  // Initialize nudge triggers
  useSuggestionNudge();

  return (
    <>
      <SuggestionFloatingButton />
      <SuggestionModal />
      <SuggestionNudge />
    </>
  );
}
