'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BADGES, DAILY_GOAL, levelFor } from '@/lib/game';
import { useProgress } from '@/lib/progress';
import { Bar, CelebrationOverlay } from './Ui';
import { stopSpeaking } from '@/lib/audio';

const TABS = [
  { href: '/', label: 'Play', emoji: '🎒' },
  { href: '/rewards', label: 'Rewards', emoji: '🏅' },
  { href: '/grown-ups', label: 'Grown-ups', emoji: '👨‍👩‍👧' },
];

export function StatusBar() {
  const { state, loaded } = useProgress();
  if (!loaded) return null;
  const lvl = levelFor(state.xp);
  const goal = Math.min(1, (state.today?.activities || 0) / DAILY_GOAL);

  return (
    <header className="sticky top-0 z-30 border-b-2 border-sand bg-paper/95 backdrop-blur px-4 py-3">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <Link
          href="/grown-ups"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white border-2 border-sand text-2xl"
          aria-label="Learner profile"
        >
          {state.avatar}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold">
              {state.name ? state.name : 'Explorer'} · {lvl.name}
            </p>
            <p className="shrink-0 text-xs text-inkSoft">{state.xp} XP</p>
          </div>
          <div className="mt-1">
            <Bar value={lvl.progress} tone="mango" />
          </div>
        </div>
        <div className="shrink-0 text-center">
          <div className="text-xl leading-none">{state.streak.count > 0 ? '🔥' : '🌙'}</div>
          <div className="text-xs font-bold">{state.streak.count}</div>
        </div>
      </div>
      {goal < 1 && (
        <div className="mx-auto mt-2 max-w-md">
          <Bar
            value={goal}
            tone="leaf"
            label={`Today's goal: ${state.today?.activities || 0} of ${DAILY_GOAL} activities`}
          />
        </div>
      )}
    </header>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-sand bg-white/95 backdrop-blur"
         style={{ paddingBottom: 'var(--safe-bottom)' }}>
      <div className="mx-auto flex max-w-md">
        {TABS.map((t) => {
          const active = t.href === '/' ? path === '/' : path.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              onClick={stopSpeaking}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-semibold ${
                active ? 'text-ink' : 'text-inkSoft'
              }`}
            >
              <span className={`text-2xl ${active ? 'scale-110' : 'opacity-70'} transition`}>{t.emoji}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function BackBar({ title, subtitle, to = '/subject/phonics' }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-sand bg-paper/95 px-4 py-3 backdrop-blur">
      <button
        onClick={() => {
          stopSpeaking();
          router.push(to);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-sand bg-white text-xl"
        aria-label="Go back"
      >
        ←
      </button>
      <div className="min-w-0">
        <p className="truncate font-bold leading-tight">{title}</p>
        {subtitle && <p className="truncate text-xs text-inkSoft">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Celebrations() {
  const { celebration, clearCelebration } = useProgress();
  return (
    <CelebrationOverlay
      celebration={celebration}
      onClose={clearCelebration}
      badgeInfo={(id) => BADGES.find((b) => b.id === id)}
    />
  );
}
