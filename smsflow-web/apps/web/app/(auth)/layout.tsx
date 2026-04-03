import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 relative overflow-hidden">
      {/* Green radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <div className="mb-8 flex items-center gap-2 z-10">
        <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shadow-green">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 5h18M3 10h12M3 15h8M17 14l3 3-3 3"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-xl font-extrabold">
          <span className="text-white">SMS</span>
          <span className="text-brand-400">Flow</span>
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md mx-auto px-4 z-10">
        <div className="bg-white rounded-xl shadow-xl p-8">{children}</div>
      </div>

      {/* Bottom tagline */}
      <p className="mt-8 text-dark-500 text-sm z-10">
        Your phone, your gateway. No carrier lock-in.
      </p>
    </div>
  );
}
