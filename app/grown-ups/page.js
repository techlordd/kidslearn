'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBar } from '@/components/Shell';
import { Bar, Block, Loading, Tile } from '@/components/Ui';
import { GRADES, orderedTopics } from '@/lib/curriculum';
import { summarise, useProgress } from '@/lib/progress';
import { useProfiles, AVATARS } from '@/lib/profiles';
import { getPin, setPin as savePin } from '@/lib/pin';
import { levelFor } from '@/lib/game';

export default function GrownUpsPage() {
  const { state, loaded, setProfile, resetEverything } = useProgress();
  const { profiles, activeId, activeProfile, updateProfile, deleteProfile, switchPlayer } = useProfiles();
  const router = useRouter();
  const topics = useMemo(() => orderedTopics('phonics', state.library), [state.library]);
  const stats = useMemo(() => summarise(state, topics), [state, topics]);
  const [confirmReset, setConfirmReset] = useState(false);

  const [pin, setPinState] = useState(null); // null = not loaded yet
  const [unlocked, setUnlocked] = useState(false);
  const [entry, setEntry] = useState('');
  const [pinError, setPinError] = useState(false);
  const [editingPin, setEditingPin] = useState(false);
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    setPinState(getPin());
  }, []);

  if (!loaded || pin === null) return <Loading />;

  if (pin && !unlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-3 text-xl font-bold">Grown-ups only</h1>
        <p className="mt-1 text-sm text-inkSoft">Enter the PIN to continue.</p>
        <input
          value={entry}
          onChange={(e) => {
            setEntry(e.target.value.replace(/\D/g, '').slice(0, 4));
            setPinError(false);
          }}
          inputMode="numeric"
          type="password"
          maxLength={4}
          autoFocus
          className="mt-5 w-32 rounded-2xl border-2 border-sand bg-paper px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-sky"
        />
        {pinError && <p className="mt-2 text-sm font-semibold text-coral">That&rsquo;s not it — try again.</p>}
        <Block
          tone="leaf"
          size="lg"
          className="mt-5 max-w-xs"
          disabled={entry.length !== 4}
          onClick={() => {
            if (entry === pin) setUnlocked(true);
            else setPinError(true);
          }}
        >
          Unlock
        </Block>
        <Link href="/" className="mt-6 text-sm font-semibold text-inkSoft underline underline-offset-4">
          Back to playing
        </Link>
      </main>
    );
  }

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
          <p className="mt-3 text-sm">Grade</p>
          <div className="mt-2 flex gap-2">
            {GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => activeId && updateProfile(activeId, { grade: g.id })}
                className={`flex-1 rounded-2xl border-2 px-3 py-2 text-sm font-semibold ${
                  (activeProfile?.grade || GRADES[0].id) === g.id
                    ? 'border-mango bg-mango/20'
                    : 'border-sand bg-white text-inkSoft'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </Tile>

        {profiles.length > 1 && (
          <Tile className="mt-4">
            <p className="font-semibold">Players on this device</p>
            <p className="mt-1 text-sm text-inkSoft">Switch who&rsquo;s playing, or remove a player.</p>
            <div className="mt-3 space-y-2">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-2xl border-2 border-sand bg-paper px-3 py-2"
                >
                  <span className="text-2xl">{p.avatar}</span>
                  <span className="flex-1 truncate text-sm font-semibold">
                    {p.name}
                    <span className="font-normal text-inkSoft">
                      {' '}
                      · {GRADES.find((g) => g.id === p.grade)?.name || GRADES[0].name}
                    </span>
                    {p.id === activeId && <span className="text-inkSoft"> (this one)</span>}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${p.name} and all their progress? This cannot be undone.`)) {
                        deleteProfile(p.id);
                        if (p.id === activeId) router.push('/');
                      }
                    }}
                    className="text-xs font-semibold text-coral underline underline-offset-4"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <Block
              tone="white"
              className="mt-3"
              onClick={() => {
                switchPlayer();
                router.push('/');
              }}
            >
              Switch player
            </Block>
          </Tile>
        )}

        <Tile className="mt-4">
          <p className="font-semibold">Grown-up PIN</p>
          <p className="mt-1 text-sm text-inkSoft">
            {pin
              ? 'A PIN keeps little fingers out of this page.'
              : 'Set a PIN so kids can’t change settings or clear progress.'}
          </p>
          {editingPin ? (
            <div className="mt-3 flex items-center gap-2">
              <input
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                type="password"
                maxLength={4}
                placeholder="4 digits"
                className="w-28 rounded-2xl border-2 border-sand bg-paper px-4 py-2 text-center tracking-[0.4em] outline-none focus:border-sky"
              />
              <Block
                tone="leaf"
                disabled={newPin.length !== 4}
                onClick={() => {
                  savePin(newPin);
                  setPinState(newPin);
                  setEditingPin(false);
                  setNewPin('');
                }}
              >
                Save
              </Block>
            </div>
          ) : (
            <div className="mt-3 flex gap-3">
              <Block tone="white" onClick={() => setEditingPin(true)} className="flex-1">
                {pin ? 'Change PIN' : 'Set a PIN'}
              </Block>
              {pin && (
                <Block
                  tone="white"
                  className="flex-1"
                  onClick={() => {
                    savePin('');
                    setPinState('');
                  }}
                >
                  Remove PIN
                </Block>
              )}
            </div>
          )}
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
