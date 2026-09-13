'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { sfx } from '@/lib/audio';

const TONES = {
  mango: { bg: 'bg-mango', edge: '#C97F00', text: 'text-ink' },
  coral: { bg: 'bg-coral', edge: '#C93A3A', text: 'text-white' },
  leaf: { bg: 'bg-leaf', edge: '#1E8B50', text: 'text-white' },
  sky: { bg: 'bg-sky', edge: '#2A6FA8', text: 'text-white' },
  grape: { bg: 'bg-grape', edge: '#6638CC', text: 'text-white' },
  white: { bg: 'bg-white', edge: '#EADBC2', text: 'text-ink' },
};

export function Block({
  as = 'button',
  tone = 'mango',
  size = 'md',
  className = '',
  onClick,
  href,
  quiet,
  ...rest
}) {
  const t = TONES[tone] || TONES.mango;
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg w-full',
    xl: 'px-6 py-5 text-xl w-full',
  };
  const cls = `block ${t.bg} ${t.text} ${sizes[size]} ${className}`;
  const style = { '--edge': t.edge };
  const handle = (e) => {
    if (!quiet) sfx.tap();
    onClick?.(e);
  };
  if (href) {
    return <Link href={href} className={cls} style={style} onClick={handle} {...rest} />;
  }
  const Tag = as;
  return <Tag className={cls} style={style} onClick={handle} {...rest} />;
}

export function Tile({ className = '', children, ...rest }) {
  return (
    <div className={`tile p-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Bar({ value, tone = 'mango', label }) {
  const fill = { mango: 'bg-mango', leaf: 'bg-leaf', sky: 'bg-sky', coral: 'bg-coral', grape: 'bg-grape' }[tone];
  return (
    <div>
      <div className="h-4 w-full rounded-full bg-sand overflow-hidden">
        <div
          className={`h-full ${fill} rounded-full transition-[width] duration-500`}
          style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }}
        />
      </div>
      {label ? <p className="mt-1 text-xs text-inkSoft">{label}</p> : null}
    </div>
  );
}

export function Stars({ count = 0, of = 3, size = 'text-xl' }) {
  return (
    <span className={`${size} tracking-tight`} aria-label={`${count} of ${of} stars`}>
      {Array.from({ length: of }).map((_, i) => (
        <span key={i} className={i < count ? '' : 'opacity-25 grayscale'}>
          ⭐
        </span>
      ))}
    </span>
  );
}

/** Pip the parrot — repeats sounds back, so a parrot fits the job. */
export function Pip({ mood = 'happy', size = 64, className = '' }) {
  const face = { happy: '🦜', cheer: '🎉', think: '🤔', wave: '👋' }[mood] || '🦜';
  return (
    <span
      className={`inline-block ${className}`}
      style={{ fontSize: size, lineHeight: 1 }}
      role="img"
      aria-label="Pip the parrot"
    >
      {face}
    </span>
  );
}

export function SpeechBubble({ children, tone = 'bg-white' }) {
  return (
    <div className={`relative ${tone} border-2 border-sand rounded-blob px-4 py-3 text-ink`}>
      <span className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-sand bg-inherit" />
      {children}
    </div>
  );
}

export function Confetti({ pieces = 40 }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.7,
        color: ['#FFB020', '#FF5D5D', '#2FBF71', '#3D9BE9', '#8B5CF6'][i % 5],
        size: 8 + Math.random() * 10,
      })),
    [pieces]
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {bits.map((b) => (
        <span
          key={b.id}
          className="absolute top-0 animate-fall rounded-sm"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size * 0.6,
            background: b.color,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function CelebrationOverlay({ celebration, onClose, badgeInfo }) {
  useEffect(() => {
    if (celebration) sfx.levelUp();
  }, [celebration]);
  if (!celebration) return null;
  const isLevel = celebration.type === 'level';
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4">
      <Confetti />
      <div className="w-full max-w-md rounded-blob bg-white p-6 text-center animate-pop">
        <div className="text-6xl">{isLevel ? celebration.level.emoji : badgeInfo(celebration.badges[0])?.emoji}</div>
        <h2 className="mt-3 text-2xl font-bold">
          {isLevel ? `Level ${celebration.level.number}!` : 'New badge!'}
        </h2>
        <p className="mt-1 text-inkSoft">
          {isLevel
            ? `You are now a ${celebration.level.name}.`
            : badgeInfo(celebration.badges[0])?.name}
        </p>
        {celebration.badges?.length > 0 && isLevel && (
          <p className="mt-2 text-sm text-inkSoft">
            Plus {celebration.badges.length} new badge{celebration.badges.length > 1 ? 's' : ''}.
          </p>
        )}
        <Block tone="leaf" size="lg" className="mt-5" onClick={onClose}>
          Keep going
        </Block>
      </div>
    </div>
  );
}

export function Loading({ text = 'Getting things ready…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-inkSoft">
      <Pip size={54} className="animate-wiggle" />
      <p className="mt-3">{text}</p>
    </div>
  );
}

export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
