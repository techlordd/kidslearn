'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { StatusBar } from '@/components/Shell';
import { Bar, Block, Loading, Tile } from '@/components/Ui';
import { orderedTopics } from '@/lib/curriculum';
import { summarise, useProgress } from '@/lib/progress';
import { levelFor } from '@/lib/game';

const AVATARS = ['🦜', '🦊', '🐼', '🐸', '🦖', '🐙', '🦄', '🐝'];

export default function GrownUpsPage() {
  const { state, loaded, setProfile, resetEverything } = useProgress();
  const topics = useMemo(() => orderedTopics('phonics', state.library), [state.library]);
  const stats = useMemo(() => summarise(state, topics), [state, topics]);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!loaded) return <Loading />;
  const lvl = levelFor(state.xp);

  return (
    <main>
      <StatusBar />
      <div className="px-5 pb-10 pt-5">
        <h1 className="text-2xl font-bold">For grown-ups</h1>
        <p className="mt-1 text-sm text-inkSoft">
          A quick look at how {state.name || 'your child'} is getting on. Everything is stored on
          this device only.
        </p>

        <Tile className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-inkSoft">Sounds mastered</p>
              <p className="text-3xl font-bold">
                {stats.mastered}
                <span className="text-base font-normal text-inkSoft"> / {stats.total}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-inkSoft">Quiz accuracy</p>
              <p className="text-3xl font-bold">{stats.accuracy}%</p>
            </div>
          </div>
          <div className="mt-4">
            <Bar
              value={stats.total ? stats.mastered / stats.total : 0}
              tone="leaf"
              label={`Level ${lvl.number} · ${lvl.name} · ${state.xp} XP`}
            />
          </div>
        </Tile>

        {stats.needsWork.length > 0 && (
          <Tile className="mt-4">
            <p className="font-semibold">Worth another go</p>
            <p className="mt-1 text-sm text-inkSoft">
              These sounds were tricky. A short practice round usually fixes it.
            </p>
            <div className="mt-3 space-y-2">
              {stats.needsWork.map((t) => (
                <Link
                  key={t.id}
                  href={`/topic/${t.id}/practice`}
                  className="flex items-center gap-3 rounded-2xl border-2 border-sand bg-paper px-3 py-2"
                >
                  <span className="letterface text-2xl font-bold">{t.display}</span>
                  <span className="flex-1 text-sm font-semibold">{t.name}</span>
                  <span className="text-xs text-inkSoft">
                    best {state.topics[t.id]?.best || 0}/5
                  </span>
                </Link>
              ))}
            </div>
          </Tile>
        )}

        <Tile className="mt-4">
          <p className="font-semibold">Recent quizzes</p>
          {state.history.length === 0 ? (
            <p className="mt-1 text-sm text-inkSoft">No quizzes yet.</p>
          ) : (
            <ul className="mt-2 divide-y divide-sand text-sm">
              {state.history.slice(0, 6).map((h, i) => {
                const t = topics.find((x) => x.id === h.topicId);
                return (
                  <li key={i} className="flex items-center justify-between py-2">
                    <span className="font-semibold">{t?.name || h.topicId}</span>
                    <span className="text-inkSoft">
                      {h.correct}/{h.total} · {h.day}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Tile>

        <Tile className="mt-4">
          <p className="font-semibold">Add your own lessons</p>
          <p className="mt-1 text-sm text-inkSoft">
            Use the Studio to write new topics and quizzes with AI — for phonics or any other
            subject.
          </p>
          <Block tone="grape" size="lg" className="mt-3" href="/grown-ups/studio">
            Open the Studio
          </Block>
          {state.library.length > 0 && (
            <p className="mt-2 text-center text-xs text-inkSoft">
              {state.library.length} topic{state.library.length > 1 ? 's' : ''} added so far
            </p>
          )}
        </Tile>

        <Tile className="mt-4">
          <p className="font-semibold">Learner</p>
          <label className="mt-3 block text-sm" htmlFor="edit-name">
            Name
          </label>
          <input
            id="edit-name"
            value={state.name}
            onChange={(e) => setProfile(e.target.value, null)}
            className="mt-1 w-full rounded-2xl border-2 border-sand bg-paper px-4 py-2 outline-none focus:border-sky"
            maxLength={16}
          />
          <p className="mt-3 text-sm">Buddy</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setProfile(null, a)}
                className={`rounded-xl border-2 p-2 text-2xl ${
                  state.avatar === a ? 'border-mango bg-mango/20' : 'border-sand bg-white'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </Tile>

        <Tile className="mt-4">
          <p className="font-semibold">How to help at home</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-inkSoft">
            <li>Say the sound, not the letter name: “mmm”, not “em”.</li>
            <li>Ten minutes a day beats an hour once a week.</li>
            <li>Let them tap the letters and say it out loud with you.</li>
            <li>Point out the sound on cereal boxes and shop signs.</li>
          </ul>
        </Tile>

        <div className="mt-6">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full text-sm font-semibold text-coral underline underline-offset-4"
            >
              Start over and clear all progress
            </button>
          ) : (
            <Tile className="border-coral">
              <p className="text-sm font-semibold">
                Clear all progress, badges and added lessons? This cannot be undone.
              </p>
              <div className="mt-3 flex gap-3">
                <Block tone="coral" onClick={resetEverything} className="flex-1">
                  Yes, clear it
                </Block>
                <Block tone="white" onClick={() => setConfirmReset(false)} className="flex-1">
                  Keep it
                </Block>
              </div>
            </Tile>
          )}
        </div>
      </div>
    </main>
  );
}
