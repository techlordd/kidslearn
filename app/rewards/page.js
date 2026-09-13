'use client';

import { useMemo } from 'react';
import { StatusBar } from '@/components/Shell';
import { Bar, Loading, Pip, Tile } from '@/components/Ui';
import { BADGES, LEVELS, levelFor } from '@/lib/game';
import { orderedTopics } from '@/lib/curriculum';
import { summarise, useProgress } from '@/lib/progress';

export default function RewardsPage() {
  const { state, loaded } = useProgress();
  const topics = useMemo(() => orderedTopics('phonics', state.library), [state.library]);
  const stats = useMemo(() => summarise(state, topics), [state, topics]);

  if (!loaded) return <Loading />;
  const lvl = levelFor(state.xp);
  const earned = new Set(state.badges);

  return (
    <main>
      <StatusBar />
      <div className="px-5 pb-10 pt-5">
        <div className="flex items-center gap-4 rounded-blob border-2 border-sand bg-white p-5">
          <div className="text-5xl">{lvl.emoji}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-inkSoft">Level {lvl.number}</p>
            <h1 className="truncate text-xl font-bold">{lvl.name}</h1>
            <div className="mt-2">
              <Bar
                value={lvl.progress}
                tone="mango"
                label={lvl.next ? `${lvl.toNext} XP to ${lvl.next.name}` : 'Top level reached!'}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Tile className="!p-3">
            <div className="text-2xl">⭐</div>
            <p className="text-lg font-bold">{stats.stars}</p>
            <p className="text-xs text-inkSoft">stars</p>
          </Tile>
          <Tile className="!p-3">
            <div className="text-2xl">🔤</div>
            <p className="text-lg font-bold">{stats.mastered}</p>
            <p className="text-xs text-inkSoft">sounds</p>
          </Tile>
          <Tile className="!p-3">
            <div className="text-2xl">🔥</div>
            <p className="text-lg font-bold">{state.streak.best}</p>
            <p className="text-xs text-inkSoft">best streak</p>
          </Tile>
        </div>

        <h2 className="mt-8 text-lg font-bold">Badge case</h2>
        <p className="text-sm text-inkSoft">
          {earned.size} of {BADGES.length} collected
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {BADGES.map((b) => {
            const got = earned.has(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-blob border-2 p-3 text-center ${
                  got ? 'border-mango bg-mango/15' : 'border-sand bg-white/60'
                }`}
              >
                <div className={`text-3xl ${got ? '' : 'opacity-25 grayscale'}`}>{b.emoji}</div>
                <p className="mt-1 text-xs font-bold leading-tight">{b.name}</p>
                <p className="mt-1 text-[10px] leading-tight text-inkSoft">{got ? 'Earned' : b.how}</p>
              </div>
            );
          })}
        </div>

        <h2 className="mt-8 text-lg font-bold">The road ahead</h2>
        <div className="mt-3 space-y-2">
          {LEVELS.map((l, i) => {
            const reached = state.xp >= l.at;
            return (
              <div
                key={l.name}
                className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-2 ${
                  reached ? 'border-leaf bg-leaf/10' : 'border-sand bg-white/60'
                }`}
              >
                <span className={`text-2xl ${reached ? '' : 'opacity-40 grayscale'}`}>{l.emoji}</span>
                <span className="flex-1 text-sm font-semibold">{l.name}</span>
                <span className="text-xs text-inkSoft">{l.at} XP</span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-inkSoft">
          <Pip size={36} />
          <p className="text-sm">Every quiz you finish fills the jar a little more.</p>
        </div>
      </div>
    </main>
  );
}
