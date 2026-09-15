'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Block, Loading } from './Ui';
import { getPin } from '@/lib/pin';

const SESSION_KEY = 'sound-safari:pinUnlocked';

function sessionUnlocked() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markSessionUnlocked() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {}
}

/**
 * Wraps any grown-up-only page. Every page that uses this shares one PIN
 * unlock for the browsing session (sessionStorage, not localStorage) — a
 * grown-up who unlocks Settings shouldn't be asked again a moment later
 * tapping through to the Studio, but a fresh visit after closing the tab
 * still asks. Without this, "Add with AI" chips (reachable straight from
 * Play, no PIN screen in between) were a wide open door into the Studio.
 */
export default function PinGate({ children }) {
  const [pin, setPin] = useState(null); // null = not loaded yet
  const [unlocked, setUnlocked] = useState(false);
  const [entry, setEntry] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setPin(getPin());
    setUnlocked(sessionUnlocked());
  }, []);

  if (pin === null) return <Loading />;
  if (!pin || unlocked) return children;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5">
      <p className="text-5xl">🔒</p>
      <h1 className="mt-3 text-xl font-bold">Grown-ups only</h1>
      <p className="mt-1 text-sm text-inkSoft">Enter the PIN to continue.</p>
      <input
        value={entry}
        onChange={(e) => {
          setEntry(e.target.value.replace(/\D/g, '').slice(0, 4));
          setError(false);
        }}
        inputMode="numeric"
        type="password"
        maxLength={4}
        autoFocus
        className="mt-5 w-32 rounded-2xl border-2 border-sand bg-paper px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-sky"
      />
      {error && <p className="mt-2 text-sm font-semibold text-coral">That&rsquo;s not it — try again.</p>}
      <Block
        tone="leaf"
        size="lg"
        className="mt-5 max-w-xs"
        disabled={entry.length !== 4}
        onClick={() => {
          if (entry === pin) {
            markSessionUnlocked();
            setUnlocked(true);
          } else {
            setError(true);
          }
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
