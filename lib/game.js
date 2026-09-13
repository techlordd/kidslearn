/* Everything that turns learning into a game lives here, so the rules can be
   tuned in one place without digging through screens. */

export const XP = {
  lessonFinished: 10,
  practiceCorrect: 3,
  quizCorrect: 6,
  quizPerfect: 20,
  firstTimeMastery: 25,
  dailyVisit: 5,
};

export const LEVELS = [
  { at: 0, name: 'Little Listener', emoji: '🌱' },
  { at: 60, name: 'Sound Spotter', emoji: '🔍' },
  { at: 160, name: 'Word Builder', emoji: '🧱' },
  { at: 320, name: 'Blending Buddy', emoji: '🪄' },
  { at: 540, name: 'Story Scout', emoji: '🧭' },
  { at: 820, name: 'Reading Ranger', emoji: '🎒' },
  { at: 1200, name: 'Word Wizard', emoji: '🧙' },
  { at: 1700, name: 'Safari Champion', emoji: '🏆' },
  { at: 2400, name: 'Sound Legend', emoji: '👑' },
];

export function levelFor(xp) {
  let i = 0;
  for (let k = 0; k < LEVELS.length; k++) if (xp >= LEVELS[k].at) i = k;
  const current = LEVELS[i];
  const next = LEVELS[i + 1] || null;
  const span = next ? next.at - current.at : 1;
  const into = xp - current.at;
  return {
    index: i,
    number: i + 1,
    name: current.name,
    emoji: current.emoji,
    next,
    progress: next ? Math.min(1, into / span) : 1,
    toNext: next ? next.at - xp : 0,
  };
}

export function starsFor(correct, total) {
  if (!total) return 0;
  const pct = correct / total;
  if (pct === 1) return 3;
  if (pct >= 0.8) return 2;
  if (pct >= 0.6) return 1;
  return 0;
}

export const BADGES = [
  {
    id: 'first-steps',
    name: 'First Steps',
    emoji: '👣',
    how: 'Finish your first lesson',
    earned: (p) => Object.values(p.topics).some((t) => t.lessonDone),
  },
  {
    id: 'quiz-rookie',
    name: 'Quiz Rookie',
    emoji: '🎯',
    how: 'Finish your first quiz',
    earned: (p) => Object.values(p.topics).some((t) => t.attempts > 0),
  },
  {
    id: 'perfect-score',
    name: 'Perfect Round',
    emoji: '💯',
    how: 'Get every quiz question right',
    earned: (p) => Object.values(p.topics).some((t) => t.stars === 3),
  },
  {
    id: 'vowel-voyager',
    name: 'Vowel Voyager',
    emoji: '🌿',
    how: 'Master all five short vowels',
    earned: (p) =>
      ['short-a', 'short-e', 'short-i', 'short-o', 'short-u'].every(
        (id) => (p.topics[id]?.stars || 0) > 0
      ),
  },
  {
    id: 'five-sounds',
    name: 'High Five',
    emoji: '🖐️',
    how: 'Master 5 sounds',
    earned: (p) => Object.values(p.topics).filter((t) => t.stars > 0).length >= 5,
  },
  {
    id: 'ten-sounds',
    name: 'Sound Collector',
    emoji: '🎒',
    how: 'Master 10 sounds',
    earned: (p) => Object.values(p.topics).filter((t) => t.stars > 0).length >= 10,
  },
  {
    id: 'streak-3',
    name: 'Three in a Row',
    emoji: '🔥',
    how: 'Practise 3 days in a row',
    earned: (p) => p.streak.best >= 3,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    emoji: '⚡',
    how: 'Practise 7 days in a row',
    earned: (p) => p.streak.best >= 7,
  },
  {
    id: 'digraph-duo',
    name: 'Team Player',
    emoji: '🤝',
    how: 'Master a two-letter team sound',
    earned: (p) =>
      ['digraph-sh', 'digraph-ch', 'digraph-th', 'digraph-ng', 'digraph-ck'].some(
        (id) => (p.topics[id]?.stars || 0) > 0
      ),
  },
  {
    id: 'star-25',
    name: 'Star Jar',
    emoji: '⭐',
    how: 'Collect 25 stars',
    earned: (p) => Object.values(p.topics).reduce((n, t) => n + (t.stars || 0), 0) >= 25,
  },
  {
    id: 'level-5',
    name: 'Story Scout',
    emoji: '🧭',
    how: 'Reach level 5',
    earned: (p) => levelFor(p.xp).number >= 5,
  },
  {
    id: 'safari-complete',
    name: 'Safari Complete',
    emoji: '🏆',
    how: 'Master every sound on the map',
    earned: (p, total) =>
      total > 0 && Object.values(p.topics).filter((t) => t.stars > 0).length >= total,
  },
];

export const DAILY_GOAL = 3; // activities per day

export function praise(correctStreak) {
  const list = [
    'Nice!',
    'Yes!',
    'Great listening!',
    'You got it!',
    'Brilliant!',
    'Super ears!',
    'Spot on!',
  ];
  if (correctStreak >= 4) return 'On fire! 🔥';
  if (correctStreak === 3) return 'Three in a row! 🎉';
  return list[correctStreak % list.length];
}

export function encourage() {
  const list = [
    'Almost — try again.',
    'Good try. Listen once more.',
    'Not quite. You can do this.',
    'Close! Have another go.',
  ];
  return list[Math.floor(Math.random() * list.length)];
}
