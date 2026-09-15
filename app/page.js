'use client';

import { useMemo, useState } from 'react';
import { StatusBar } from '@/components/Shell';
import { AreaCard } from '@/components/Curriculum';
import { Block, Loading, Pip, SpeechBubble, Tile } from '@/components/Ui';
import { SUBJECT_AREAS, GRADES, allTopics, getTopic } from '@/lib/curriculum';
import { useProgress, summarise } from '@/lib/progress';
import { useProfiles, AVATARS } from '@/lib/profiles';
import { DAILY_GOAL } from '@/lib/game';

export default function Home() {
  const { ready, profiles, activeId, selectProfile, createProfile } = useProfiles();
  const { state, loaded } = useProgress();

  const topics = useMemo(() => allTopics(state.library), [state.library]);
  const stats = useMemo(() => summarise(state, topics), [state, topics]);

  if (!ready) return <Loading />;

  /* No player picked yet on this device: a one-tap "who's playing" screen —
     no typing, no password, straight back into their own progress. */
  if (!activeId) {
    return <PlayerPicker profiles={profiles} onPick={selectProfile} onCreate={createProfile} />;
  }

  if (!loaded) return <Loading />;

  /* The most recent thing they actually did, whatever subject it was in —
     a brand new profile (especially an older grade) shouldn't be pushed
     straight into a Reception phonics lesson before they've even seen the
     subject picker. */
  const continueTopic = state.history[0] ? getTopic(state.history[0].topicId, state.library) : null;

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
                : continueTopic
                ? `Ready for ${continueTopic.name}, ${state.name}?`
                : `Let's find something fun to learn, ${state.name}!`}
            </p>
          </SpeechBubble>
        </div>

        {continueTopic && (
          <Tile className="mt-6 !p-0 overflow-hidden">
            <div className="flex items-center gap-4 bg-mango/25 px-5 py-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-blob bg-white border-2 border-sand letterface text-4xl font-bold">
                {continueTopic.display}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-inkSoft">
                  Continue
                </p>
                <h2 className="truncate text-2xl font-bold">{continueTopic.name}</h2>
                {continueTopic.sound && <p className="text-sm text-inkSoft">{continueTopic.sound}</p>}
              </div>
            </div>
            <div className="p-4">
              <Block tone="leaf" size="lg" href={`/topic/${continueTopic.id}/lesson`}>
                Keep learning
              </Block>
            </div>
          </Tile>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3">
          <MiniStat label="Topics" value={`${stats.mastered}/${stats.total}`} emoji="🏆" />
          <MiniStat label="Stars" value={stats.stars} emoji="⭐" />
          <MiniStat label="Streak" value={`${state.streak.count}d`} emoji="🔥" />
        </div>

        <h2 className="mt-8 text-lg font-bold">Choose a subject</h2>
        <div className="mt-3 space-y-3">
          {SUBJECT_AREAS.map((a) => (
            <AreaCard key={a.id} area={a} state={state} />
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

function PlayerPicker({ profiles, onPick, onCreate }) {
  const [adding, setAdding] = useState(profiles.length === 0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦜');
  const [grade, setGrade] = useState(GRADES[0].id);

  if (adding) {
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

          <p className="mt-5 text-sm font-semibold">Grade (a grown-up can change this later)</p>
          <div className="mt-2 flex gap-2">
            {GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => setGrade(g.id)}
                className={`flex-1 rounded-2xl border-2 px-3 py-2 text-sm font-semibold ${
                  grade === g.id ? 'border-mango bg-mango/20' : 'border-sand bg-white text-inkSoft'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>

          <Block
            tone="leaf"
            size="lg"
            className="mt-6"
            disabled={!name.trim()}
            onClick={() => onCreate(name.trim(), avatar, grade)}
          >
            Start exploring
          </Block>

          {profiles.length > 0 && (
            <button
              onClick={() => setAdding(false)}
              className="mt-4 w-full text-sm font-semibold text-inkSoft underline underline-offset-4"
            >
              Back to players
            </button>
          )}
        </Tile>

        <p className="mt-6 text-center text-xs text-inkSoft">
          Nothing is sent anywhere — progress is saved on this device only.
        </p>
      </main>
    );
  }

  return (
    <main className="px-5 pt-12">
      <div className="text-center">
        <Pip size={72} mood="wave" className="animate-wiggle" />
        <h1 className="mt-4 text-2xl font-bold">Who&rsquo;s playing?</h1>
        <p className="mt-1 text-inkSoft">Tap your buddy to jump back in.</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => onPick(p.id)}
            className="flex flex-col items-center gap-2 rounded-blob border-2 border-sand bg-white p-5"
            style={{ boxShadow: '0 6px 0 0 #EADBC2' }}
          >
            <span className="text-5xl">{p.avatar}</span>
            <span className="truncate font-bold">{p.name}</span>
          </button>
        ))}
        <button
          onClick={() => setAdding(true)}
          className="flex flex-col items-center justify-center gap-2 rounded-blob border-2 border-dashed border-sand bg-white/50 p-5 text-inkSoft"
        >
          <span className="text-4xl">➕</span>
          <span className="text-sm font-semibold">New buddy</span>
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-inkSoft">
        Nothing is sent anywhere — progress is saved on this device only.
      </p>
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
