'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { StatusBar } from '@/components/Shell';
import { Block, Loading, Pip, SpeechBubble, Stars, Tile } from '@/components/Ui';
import { SUBJECTS, orderedTopics } from '@/lib/curriculum';
import { useProgress, summarise } from '@/lib/progress';
import { DAILY_GOAL } from '@/lib/game';

const AVATARS = ['🦜', '🦊', '🐼', '🐸', '🦖', '🐙', '🦄', '🐝'];

export default function Home() {
  const { state, loaded, setProfile } = useProgress();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦜');

  const topics = useMemo(() => orderedTopics('phonics', state.library), [state.library]);
  const stats = useMemo(() => summarise(state, topics), [state, topics]);

  if (!loaded) return <Loading />;

  /* First run: ask for a name once, then never again. */
  if (!state.name) {
    return (
      <main className="px-5 pt-12">
        <div className="text-center">
          <Pip size={80} mood="wave" className="animate-wiggle" />
          <h1 className="mt-4 text-3xl font-bold">Sound Safari</h1>
          <p className="mt-2 text-inkSoft">
            Hi! I am Pip. I repeat every sound you learn. What shall I call you?
          </p>
        </div>

        <Tile className="mt-8">
          <label className="text-sm font-semibold" htmlFor="learner-name">
            Your name
          </label>
          <input
            id="learner-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ada"
            maxLength={16}
            className="mt-2 w-full rounded-2xl border-2 border-sand bg-paper px-4 py-3 text-lg outline-none focus:border-sky"
          />

          <p className="mt-5 text-sm font-semibold">Pick your buddy</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`rounded-2xl border-2 p-3 text-3xl ${
                  avatar === a ? 'border-mango bg-mango/20' : 'border-sand bg-white'
                }`}
                aria-label={`Choose ${a}`}
              >
                {a}
              </button>
            ))}
          </div>

          <Block
            tone="leaf"
            size="lg"
            className="mt-6"
            disabled={!name.trim()}
            onClick={() => setProfile(name.trim(), avatar)}
          >
            Start exploring
          </Block>
        </Tile>

        <p className="mt-6 text-center text-xs text-inkSoft">
          Nothing is sent anywhere — progress is saved on this device only.
        </p>
      </main>
    );
  }

  const nextUp = topics.find((t) => (state.topics[t.id]?.stars || 0) === 0) || topics[0];
  const started = topics.some((t) => state.topics[t.id]?.lessonDone);

  return (
    <main>
      <StatusBar />
      <div className="px-5 pt-5">
        <div className="flex items-end gap-3">
          <Pip size={56} />
          <SpeechBubble>
            <p className="text-sm">
              {stats.goalMet
                ? `Today's goal is done, ${state.name}. Want to keep playing?`
                : started
                ? `Ready for ${nextUp.name}, ${state.name}?`
                : `Let's start with our very first sound, ${state.name}.`}
            </p>
          </SpeechBubble>
        </div>

        <Tile className="mt-6 !p-0 overflow-hidden">
          <div className="flex items-center gap-4 bg-mango/25 px-5 py-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-blob bg-white border-2 border-sand letterface text-4xl font-bold">
              {nextUp.display}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft">
                {started ? 'Next up' : 'Start here'}
              </p>
              <h2 className="truncate text-2xl font-bold">{nextUp.name}</h2>
              <p className="text-sm text-inkSoft">
                {nextUp.sound} · {nextUp.words.length} words
              </p>
            </div>
          </div>
          <div className="p-4">
            <Block tone="leaf" size="lg" href={`/topic/${nextUp.id}/lesson`}>
              {state.topics[nextUp.id]?.lessonDone ? 'Keep learning' : 'Start the lesson'}
            </Block>
          </div>
        </Tile>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <MiniStat label="Sounds" value={`${stats.mastered}/${stats.total}`} emoji="🔤" />
          <MiniStat label="Stars" value={stats.stars} emoji="⭐" />
          <MiniStat label="Streak" value={`${state.streak.count}d`} emoji="🔥" />
        </div>

        <h2 className="mt-8 text-lg font-bold">Choose a subject</h2>
        <div className="mt-3 space-y-3">
          {SUBJECTS.map((s) => (
            <SubjectRow key={s.id} subject={s} topics={topics} state={state} />
          ))}
        </div>

        <Tile className="mt-6 bg-white/70">
          <p className="text-sm font-semibold">Daily goal</p>
          <p className="mt-1 text-sm text-inkSoft">
            {stats.todayCount} of {DAILY_GOAL} activities today.{' '}
            {stats.goalMet ? 'Done — nice work! 🎉' : 'A lesson, a practice and a quiz does it.'}
          </p>
        </Tile>
      </div>
    </main>
  );
}

function MiniStat({ label, value, emoji }) {
  return (
    <div className="rounded-blob border-2 border-sand bg-white px-2 py-3 text-center">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-1 text-lg font-bold leading-none">{value}</div>
      <div className="text-xs text-inkSoft">{label}</div>
    </div>
  );
}

function SubjectRow({ subject, topics, state }) {
  const mine = subject.id === 'phonics' ? topics : [];
  const done = mine.filter((t) => (state.topics[t.id]?.stars || 0) > 0).length;

  if (!subject.ready) {
    return (
      <div className="flex items-center gap-4 rounded-blob border-2 border-dashed border-sand bg-white/50 p-4">
        <div className="text-3xl opacity-60">{subject.emoji}</div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-inkSoft">{subject.name}</p>
          <p className="text-xs text-inkSoft">{subject.tagline}</p>
        </div>
        <Link href="/grown-ups/studio" className="chip bg-sand text-xs">
          Add with AI
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={`/subject/${subject.id}`}
      className="flex items-center gap-4 rounded-blob border-2 border-sand bg-white p-4"
      style={{ boxShadow: '0 6px 0 0 #EADBC2' }}
    >
      <div className="text-4xl">{subject.emoji}</div>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{subject.name}</p>
        <p className="text-xs text-inkSoft">{subject.tagline}</p>
        <p className="mt-1 text-xs font-semibold text-leaf">
          {done} of {mine.length} sounds mastered
        </p>
      </div>
      <Stars count={Math.min(3, Math.floor((done / Math.max(1, mine.length)) * 3))} size="text-sm" />
    </Link>
  );
}
