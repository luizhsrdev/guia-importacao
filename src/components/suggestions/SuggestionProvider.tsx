'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SuggestionContextType {
  isModalOpen: boolean;
  openModal: (trigger: TriggerType, searchQuery?: string) => void;
  closeModal: () => void;
  triggerType: TriggerType;
  searchQuery: string | null;
  isNudgeVisible: boolean;
  showNudge: (trigger: TriggerType, searchQuery?: string) => void;
  hideNudge: () => void;
  nudgeTrigger: TriggerType | null;
  nudgeSearchQuery: string | null;
}

export type TriggerType = 'floating_button' | 'nudge_time' | 'nudge_visit' | 'nudge_zero_results';

const SuggestionContext = createContext<SuggestionContextType | undefined>(undefined);

interface SuggestionProviderProps {
  children: ReactNode;
}

export function SuggestionProvider({ children }: SuggestionProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [triggerType, setTriggerType] = useState<TriggerType>('floating_button');
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const [isNudgeVisible, setIsNudgeVisible] = useState(false);
  const [nudgeTrigger, setNudgeTrigger] = useState<TriggerType | null>(null);
  const [nudgeSearchQuery, setNudgeSearchQuery] = useState<string | null>(null);

  const openModal = useCallback((trigger: TriggerType, query?: string) => {
    setTriggerType(trigger);
    setSearchQuery(query || null);
    setIsModalOpen(true);
    setIsNudgeVisible(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const showNudge = useCallback((trigger: TriggerType, query?: string) => {
    setNudgeTrigger(trigger);
    setNudgeSearchQuery(query || null);
    setIsNudgeVisible(true);
  }, []);

  const hideNudge = useCallback(() => {
    setIsNudgeVisible(false);
  }, []);

  return (
    <SuggestionContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal,
        triggerType,
        searchQuery,
        isNudgeVisible,
        showNudge,
        hideNudge,
        nudgeTrigger,
        nudgeSearchQuery,
      }}
    >
      {children}
    </SuggestionContext.Provider>
  );
}

export function useSuggestion() {
  const context = useContext(SuggestionContext);
  if (context === undefined) {
    throw new Error('useSuggestion must be used within a SuggestionProvider');
  }
  return context;
}
