'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSuggestion, TriggerType } from '@/components/suggestions/SuggestionProvider';

// Cooldown constants (in milliseconds)
const COOLDOWN_DISMISSED = 7 * 24 * 60 * 60 * 1000; // 7 days
const COOLDOWN_SUBMITTED = 14 * 24 * 60 * 60 * 1000; // 14 days

// Trigger timing constants
const TIME_TRIGGER_DELAY = 90 * 1000; // 90 seconds
const VISIT_TRIGGER_DELAY = 30 * 1000; // 30 seconds after 3rd visit
const VISIT_THRESHOLD = 3;

// localStorage keys
const KEYS = {
  DISMISSED_AT: 'suggestion_nudge_dismissed_at',
  SUBMITTED_AT: 'suggestion_nudge_submitted_at',
  VISIT_COUNT: 'suggestion_visit_count',
  SESSION_SHOWN: 'suggestion_session_shown',
};

function isOnCooldown(): boolean {
  if (typeof window === 'undefined') return true;

  const dismissedAt = localStorage.getItem(KEYS.DISMISSED_AT);
  const submittedAt = localStorage.getItem(KEYS.SUBMITTED_AT);
  const now = Date.now();

  if (submittedAt) {
    const submittedTime = parseInt(submittedAt, 10);
    if (now - submittedTime < COOLDOWN_SUBMITTED) {
      return true;
    }
  }

  if (dismissedAt) {
    const dismissedTime = parseInt(dismissedAt, 10);
    if (now - dismissedTime < COOLDOWN_DISMISSED) {
      return true;
    }
  }

  return false;
}

function hasShownThisSession(): boolean {
  if (typeof window === 'undefined') return true;
  return sessionStorage.getItem(KEYS.SESSION_SHOWN) === 'true';
}

function markSessionShown(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(KEYS.SESSION_SHOWN, 'true');
  }
}

function getVisitCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem(KEYS.VISIT_COUNT);
  return count ? parseInt(count, 10) : 0;
}

function incrementVisitCount(): number {
  if (typeof window === 'undefined') return 0;
  const current = getVisitCount();
  const newCount = current + 1;
  localStorage.setItem(KEYS.VISIT_COUNT, newCount.toString());
  return newCount;
}

export function useSuggestionNudge() {
  const { showNudge, isModalOpen, isNudgeVisible } = useSuggestion();
  const timeOnPageRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeTriggeredRef = useRef(false);
  const visitTriggeredRef = useRef(false);

  const triggerNudge = useCallback(
    (type: TriggerType, searchQuery?: string) => {
      // Don't show if already showing something
      if (isModalOpen || isNudgeVisible) return;

      // Check cooldowns
      if (isOnCooldown()) return;

      // Check if already shown this session
      if (hasShownThisSession()) return;

      markSessionShown();
      showNudge(type, searchQuery);
    },
    [isModalOpen, isNudgeVisible, showNudge]
  );

  // Time-based nudge (90s on page)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track time only when tab is visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        if (!intervalRef.current && !timeTriggeredRef.current) {
          intervalRef.current = setInterval(() => {
            timeOnPageRef.current += 1000;

            if (timeOnPageRef.current >= TIME_TRIGGER_DELAY && !timeTriggeredRef.current) {
              timeTriggeredRef.current = true;
              triggerNudge('nudge_time');
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
            }
          }, 1000);
        }
      }
    };

    // Start tracking if tab is visible
    if (!document.hidden) {
      intervalRef.current = setInterval(() => {
        timeOnPageRef.current += 1000;

        if (timeOnPageRef.current >= TIME_TRIGGER_DELAY && !timeTriggeredRef.current) {
          timeTriggeredRef.current = true;
          triggerNudge('nudge_time');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }, 1000);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [triggerNudge]);

  // Visit-based nudge (3rd visit + 30s)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Increment visit count on mount
    const visitCount = incrementVisitCount();

    // Check if this is 3rd+ visit
    if (visitCount >= VISIT_THRESHOLD && !visitTriggeredRef.current) {
      const timer = setTimeout(() => {
        if (!visitTriggeredRef.current) {
          visitTriggeredRef.current = true;
          triggerNudge('nudge_visit');
        }
      }, VISIT_TRIGGER_DELAY);

      return () => clearTimeout(timer);
    }
  }, [triggerNudge]);

  // Function to manually trigger zero results nudge
  const triggerZeroResultsNudge = useCallback(
    (searchQuery: string) => {
      triggerNudge('nudge_zero_results', searchQuery);
    },
    [triggerNudge]
  );

  return {
    triggerZeroResultsNudge,
  };
}
