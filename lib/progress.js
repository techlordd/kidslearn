'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BADGES, DAILY_GOAL, XP, levelFor, starsFor } from './game';

const KEY = 'sound-safari:v1';

const blank = () => ({
  v: 1,
  name: '',
  avatar: '🦜',
  xp: 0,
  topics: {}, // id -> { lessonDone, practiceDone, best, stars, attempts, wrong }
  badges: [],
  streak: { count: 0, best: 0, last: null },
  today: { date: null, activities: 0 },
  history: [], // { day, topicId, correct, total }
  library: [], // AI-written topics added by a grown-up
});

const today = () => new Date().toISOString().slice(0, 10);

function dayGap(a, b) {
  if (!a) return Infinity;
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

const Ctx = createContext(null);

export function ProgressProvider({ children }) {
  const [state, setState] = useState(blank);
  const [loaded, setLoaded] = useState(false);
  const [celebration, setCelebration] = useState(null); // { type, ... }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setState({ ...blank(), ...saved, topics: saved.topics || {}, streak: saved.streak || blank().streak });
      }
    } catch {
      /* a corrupted save should never block a child from playing */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, loaded]);

  /* Touch the streak once per day, on the first activity. */
  const touchDay = useCallback((draft) => {
    const d = today();
    if (draft.today.date === d) {
      draft.today.activities += 1;
      return draft;
    }
    const gap = dayGap(draft.streak.last, d);
    draft.streak.count = gap === 1 ? draft.streak.count + 1 : 1;
    draft.streak.best = Math.max(draft.streak.best, draft.streak.count);
    draft.streak.last = d;
    draft.today = { date: d, activities: 1 };
    draft.xp += XP.dailyVisit;
    return draft;
  }, []);

  const commit = useCallback(
    (mutate) => {
      setState((prev) => {
        const draft = JSON.parse(JSON.stringify(prev));
        const beforeLevel = levelFor(draft.xp).number;
        const beforeBadges = new Set(draft.badges);

        touchDay(draft);
        mutate(draft);

        const totalTopics = 36; // core map size, used for the completion badge
        BADGES.forEach((b) => {
          if (!draft.badges.includes(b.id) && b.earned(draft, totalTopics)) {
            draft.badges.push(b.id);
          }
        });

        const afterLevel = levelFor(draft.xp).number;
        const fresh = draft.badges.filter((b) => !beforeBadges.has(b));
        if (afterLevel > beforeLevel) {
          setCelebration({ type: 'level', level: levelFor(draft.xp), badges: fresh });
        } else if (fresh.length) {
          setCelebration({ type: 'badge', badges: fresh });
        }
        return draft;
      });
    },
    [touchDay]
  );

  const topicEntry = (draft, id) => {
    draft.topics[id] = draft.topics[id] || {
      lessonDone: false,
      practiceDone: false,
      best: 0,
      stars: 0,
      attempts: 0,
      wrong: [],
    };
    return draft.topics[id];
  };

  const api = useMemo(
    () => ({
      state,
      loaded,
      celebration,
      clearCelebration: () => setCelebration(null),

      setProfile: (name, avatar) =>
        setState((p) => ({ ...p, name: name ?? p.name, avatar: avatar ?? p.avatar })),

      finishLesson: (topicId) =>
        commit((d) => {
          const t = topicEntry(d, topicId);
          if (!t.lessonDone) {
            t.lessonDone = true;
            d.xp += XP.lessonFinished;
          } else {
            d.xp += 2;
          }
        }),

      finishPractice: (topicId, correct) =>
        commit((d) => {
          const t = topicEntry(d, topicId);
          t.practiceDone = true;
          d.xp += correct * XP.practiceCorrect;
        }),

      finishQuiz: (topicId, correct, total, wrongIds = []) =>
        commit((d) => {
          const t = topicEntry(d, topicId);
          const stars = starsFor(correct, total);
          const firstMastery = stars > 0 && t.stars === 0;
          t.attempts += 1;
          t.best = Math.max(t.best, correct);
          t.stars = Math.max(t.stars, stars);
          t.wrong = wrongIds;
          d.xp += correct * XP.quizCorrect;
          if (correct === total) d.xp += XP.quizPerfect;
          if (firstMastery) d.xp += XP.firstTimeMastery;
          d.history.unshift({ day: today(), topicId, correct, total });
          d.history = d.history.slice(0, 60);
        }),

      addLibraryTopic: (topic) =>
        setState((p) => ({
          ...p,
          library: [...p.library.filter((t) => t.id !== topic.id), topic],
        })),

      removeLibraryTopic: (id) =>
        setState((p) => ({ ...p, library: p.library.filter((t) => t.id !== id) })),

      resetEverything: () => {
        setState(blank());
        try {
          localStorage.removeItem(KEY);
        } catch {}
      },
    }),
    [state, loaded, celebration, commit]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}

/* Small helpers shared by several screens */

export function summarise(state, topics) {
  const done = topics.filter((t) => (state.topics[t.id]?.stars || 0) > 0);
  const stars = Object.values(state.topics).reduce((n, t) => n + (t.stars || 0), 0);
  const attempts = state.history.length;
  const accuracy = attempts
    ? Math.round(
        (state.history.reduce((n, h) => n + h.correct, 0) /
          state.history.reduce((n, h) => n + h.total, 0)) *
          100
      )
    : 0;
  const needsWork = topics
    .filter((t) => {
      const e = state.topics[t.id];
      return e && e.attempts > 0 && e.stars < 2;
    })
    .slice(0, 4);
  return {
    mastered: done.length,
    total: topics.length,
    stars,
    accuracy,
    needsWork,
    goalMet: (state.today?.activities || 0) >= DAILY_GOAL,
    todayCount: state.today?.date === today() ? state.today.activities : 0,
  };
}
