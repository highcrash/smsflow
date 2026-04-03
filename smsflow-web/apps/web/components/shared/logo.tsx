import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  dark?: boolean;
}

export function Logo({ size = 'md', href = '/', dark = false }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-xl' },
    lg: { icon: 52, text: 'text-4xl' },
  };
  const s = sizes[size];
  return (
    <Link href={href} className="flex items-center gap-2.5 no-underline">
      <div
        className="flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg shadow-green flex-shrink-0"
        style={{ width: s.icon, height: s.icon, borderRadius: 10 }}
      >
        <svg
          width={s.icon * 0.55}
          height={s.icon * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </div>
      <span
        className={`${s.text} font-black tracking-tight ${dark ? 'text-white' : 'text-dark-900'}`}
      >
        SMS<span className={dark ? 'text-brand-400' : 'text-brand-600'}>Flow</span>
      </span>
    </Link>
  );
}
