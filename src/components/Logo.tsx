'use client';

import { useRouter } from 'next/navigation';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Logo({ size = 'md', onClick }: LogoProps) {
  const router = useRouter();

  const sizes = {
    sm: { wrapper: 'gap-2', text: 'text-base', icon: 'w-7 h-7', iconInner: 'w-4 h-4' },
    md: { wrapper: 'gap-2.5', text: 'text-lg', icon: 'w-8 h-8', iconInner: 'w-[18px] h-[18px]' },
    lg: { wrapper: 'gap-3', text: 'text-xl', icon: 'w-10 h-10', iconInner: 'w-6 h-6' },
  };

  const s = sizes[size];

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    router.push('/');
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center ${s.wrapper} cursor-pointer hover:opacity-80 transition-opacity duration-200`}
    >
      <div
        className={`${s.icon} rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25`}
      >
        <svg
          className={`${s.iconInner} text-white`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
          <path d="M12 22V12" />
          <path d="M3.29 7 12 12l8.71-5" />
          <path d="M7.5 4.27l9 5.15" />
        </svg>
      </div>

      <span className={`${s.text} font-bold font-logo tracking-tight text-text-primary`}>
        Planilha do Sena
      </span>
    </button>
  );
}
