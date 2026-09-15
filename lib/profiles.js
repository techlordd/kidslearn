'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GRADES } from './curriculum';

const PROFILES_KEY = 'sound-safari:profiles';
const ACTIVE_KEY = 'sound-safari:activeProfileId';
const LEGACY_KEY = 'sound-safari:v1';

export const AVATARS = ['🦜', '🦊', '🐼', '🐸', '🦖', '🐙', '🦄', '🐝'];

const makeId = () => Math.random().toString(36).slice(2, 10);

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveProfiles(list) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
  } catch {}
}

/* A single-profile save from before profiles existed becomes profile one,
   so nobody loses progress when this ships. */
function migrateLegacySave() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const legacy = JSON.parse(raw);
    if (!legacy?.name) return null;
    const id = makeId();
    localStorage.setItem(`sound-safari:v1:${id}`, raw);
    localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem(ACTIVE_KEY, id);
    return [{ id, name: legacy.name, avatar: legacy.avatar || '🦜', grade: GRADES[0].id }];
  } catch {
    return null;
  }
}

const Ctx = createContext(null);

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const list = loadProfiles() ?? migrateLegacySave() ?? [];
    if (!loadProfiles()) saveProfiles(list);
    setProfiles(list);

    try {
      const active = localStorage.getItem(ACTIVE_KEY);
      if (active && list.some((p) => p.id === active)) setActiveId(active);
    } catch {}

    setReady(true);
  }, []);

  const api = useMemo(
    () => ({
      ready,
      profiles,
      activeId,
      activeProfile: profiles.find((p) => p.id === activeId) || null,

      selectProfile: (id) => {
        setActiveId(id);
        try {
          localStorage.setItem(ACTIVE_KEY, id);
        } catch {}
      },

      createProfile: (name, avatar, grade) => {
        const id = makeId();
        const next = [...profiles, { id, name, avatar, grade: grade || GRADES[0].id }];
        setProfiles(next);
        saveProfiles(next);
        setActiveId(id);
        try {
          localStorage.setItem(ACTIVE_KEY, id);
        } catch {}
        return id;
      },

      updateProfile: (id, patch) => {
        setProfiles((prev) => {
          const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
          saveProfiles(next);
          return next;
        });
      },

      deleteProfile: (id) => {
        setProfiles((prev) => {
          const next = prev.filter((p) => p.id !== id);
          saveProfiles(next);
          return next;
        });
        try {
          localStorage.removeItem(`sound-safari:v1:${id}`);
        } catch {}
        setActiveId((prev) => {
          if (prev !== id) return prev;
          try {
            localStorage.removeItem(ACTIVE_KEY);
          } catch {}
          return null;
        });
      },

      switchPlayer: () => {
        setActiveId(null);
        try {
          localStorage.removeItem(ACTIVE_KEY);
        } catch {}
      },
    }),
    [profiles, activeId, ready]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProfiles() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProfiles must be used inside ProfileProvider');
  return ctx;
}
