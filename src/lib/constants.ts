export const PREMIUM_PRICE_BRL = 89.90;
export const PREMIUM_PRICE_DISPLAY = 'R$ 89,90';

export const NEUMORPHIC_ELEVATED = {
  base: 'shadow-[3px_3px_8px_rgba(0,0,0,0.12),-3px_-3px_8px_rgba(255,255,255,0.9)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.04)]',
  hover: 'hover:shadow-[4px_4px_10px_rgba(0,0,0,0.15),-4px_-4px_10px_rgba(255,255,255,1)] dark:hover:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-1px_-1px_4px_rgba(255,255,255,0.05)]',
  active: 'active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.12),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] dark:active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)] active:scale-[0.97]',
} as const;

export const NEUMORPHIC_ELEVATED_SUBTLE = {
  base: 'shadow-[2px_2px_6px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.03)]',
  hover: 'hover:shadow-[3px_3px_8px_rgba(0,0,0,0.08),-3px_-3px_8px_rgba(255,255,255,0.9)] dark:hover:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-1px_-1px_4px_rgba(255,255,255,0.05)]',
  active: 'active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.02)] active:scale-[0.97]',
} as const;

export const NEUMORPHIC_INSET = {
  base: 'shadow-[inset_2px_2px_6px_rgba(0,0,0,0.08),inset_-2px_-2px_6px_rgba(255,255,255,0.7)] dark:shadow-[inset_1px_1px_4px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.06)]',
  focus: 'focus:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.8),0_0_10px_rgba(16,185,129,0.2)] dark:focus:shadow-[inset_1px_1px_4px_rgba(0,0,0,0.3),0_0_10px_rgba(52,211,153,0.2)]',
} as const;
