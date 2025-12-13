export const PREMIUM_PRICE_BRL = 89.90;
export const PREMIUM_PRICE_DISPLAY = 'R$ 89,90';

export const NEUMORPHIC_ELEVATED = {
  base: 'shadow-[8px_8px_16px_rgba(180,180,180,1),-8px_-8px_16px_rgba(255,255,255,1)] dark:shadow-[6px_6px_12px_#101012,-6px_-6px_12px_#4a4a55]',
  hover: 'hover:shadow-[10px_10px_20px_rgba(170,170,170,1),-10px_-10px_20px_rgba(255,255,255,1)] dark:hover:shadow-[8px_8px_16px_#0a0a0c,-8px_-8px_16px_#555560]',
  active: 'active:shadow-[inset_4px_4px_10px_rgba(180,180,180,1),inset_-4px_-4px_10px_rgba(255,255,255,1)] dark:active:shadow-[inset_4px_4px_10px_#101012,inset_-4px_-4px_10px_#4a4a55] active:scale-[0.98]',
} as const;

export const NEUMORPHIC_ELEVATED_SUBTLE = {
  base: 'shadow-[2px_2px_6px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.03)]',
  hover: 'hover:shadow-[3px_3px_8px_rgba(0,0,0,0.08),-3px_-3px_8px_rgba(255,255,255,0.9)] dark:hover:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-1px_-1px_4px_rgba(255,255,255,0.05)]',
  active: 'active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] dark:active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_2px_rgba(255,255,255,0.02)] active:scale-[0.97]',
} as const;

export const NEUMORPHIC_INSET = {
  base: 'shadow-[inset_6px_6px_12px_rgba(180,180,180,1),inset_-6px_-6px_12px_rgba(255,255,255,1)] dark:shadow-[inset_6px_6px_12px_#101012,inset_-6px_-6px_12px_#4a4a55]',
  focus: 'focus:shadow-[inset_6px_6px_12px_rgba(180,180,180,1),inset_-6px_-6px_12px_rgba(255,255,255,1),0_0_0_3px_rgba(16,185,129,0.15)] dark:focus:shadow-[inset_6px_6px_12px_#101012,inset_-6px_-6px_12px_#4a4a55,0_0_0_3px_rgba(52,211,153,0.2)]',
} as const;
