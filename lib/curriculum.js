import { SOUNDS, TRAILS } from './phonics-data';

/* ── Deterministic randomness ────────────────────────────────────────────────
   Questions are built on both the server and the client, so the shuffle has to
   land the same way in both places. A seeded generator keeps it stable.        */

function hash(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, next) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const pick = (list, n, next) => shuffle(list, next).slice(0, n);

/* ── Grades ──────────────────────────────────────────────────────────────── */

// Early-years only for now — the actual content (phonics) only covers this
// range so far. Add more as real lessons get written for them.
export const GRADES = [
  { id: 'reception', name: 'Reception', tagline: 'Ages 4–5' },
  { id: 'year1', name: 'Year 1', tagline: 'Ages 5–6' },
];

export function gradeName(gradeId) {
  return GRADES.find((g) => g.id === gradeId)?.name || '';
}

/* ── Subjects & topics ───────────────────────────────────────────────────── */

// The big picture a child chooses from first: English, Mathematics, Science.
export const SUBJECT_AREAS = [
  { id: 'english', name: 'English', emoji: '📖', color: 'mango', tagline: 'Reading, phonics and words' },
  { id: 'maths', name: 'Mathematics', emoji: '🔢', color: 'leaf', tagline: 'Numbers, shapes and counting' },
  { id: 'science', name: 'Science', emoji: '🔬', color: 'grape', tagline: 'The world around us' },
];

// Topics live inside a subject — phonics and grammar both under English,
// counting and shapes both under Mathematics, and so on. Only phonics has
// real lessons written so far; the rest show as "coming soon" until they do.
export const SUBJECTS = [
  {
    id: 'phonics',
    name: 'Phonics',
    emoji: '🔤',
    tagline: 'Letter sounds, blending and first words',
    color: 'mango',
    area: 'english',
    ready: true,
  },
  {
    id: 'sight-words',
    name: 'Sight Words',
    emoji: '👀',
    tagline: 'Words we read in a snap',
    color: 'sky',
    area: 'english',
    ready: false,
  },
  {
    id: 'grammar',
    name: 'Grammar',
    emoji: '✏️',
    tagline: 'Building better sentences',
    color: 'coral',
    area: 'english',
    ready: false,
  },
  {
    id: 'comprehension',
    name: 'Comprehension',
    emoji: '📗',
    tagline: 'Understanding what we read',
    color: 'sky',
    area: 'english',
    ready: false,
  },
  {
    id: 'numbers',
    name: 'Counting & Numbers',
    emoji: '🔢',
    tagline: 'Counting, adding and more',
    color: 'leaf',
    area: 'maths',
    ready: false,
  },
  {
    id: 'shapes',
    name: 'Shapes & Patterns',
    emoji: '🔺',
    tagline: 'Spotting shapes everywhere',
    color: 'leaf',
    area: 'maths',
    ready: false,
  },
  {
    id: 'nature',
    name: 'World Around Us',
    emoji: '🌍',
    tagline: 'Animals, weather and plants',
    color: 'grape',
    area: 'science',
    ready: false,
  },
];

export function subjectsForArea(areaId) {
  return SUBJECTS.filter((s) => s.area === areaId);
}

/* ── Lesson / practice / quiz builders ───────────────────────────────────── */

// The letter(s) to hunt for inside a word: "a_e" → "a", "sh" → "sh"
const gapKey = (s) => s.display.replace('_e', '').replace('_', '');

const VOWEL_TILES = ['a', 'e', 'i', 'o', 'u'];

function letterChoices(sound, next) {
  const pool = SOUNDS.filter((s) => s.id !== sound.id).map((s) => s.display);
  const isVowel = sound.trail.includes('vowel');
  const near = isVowel
    ? VOWEL_TILES.filter((v) => v !== gapKey(sound))
    : pool.filter((p) => p.length === sound.display.length);
  const distractors = pick(near.length >= 3 ? near : pool, 3, next);
  return shuffle([sound.display, ...distractors], next);
}

function buildLesson(sound) {
  const next = rng(sound.id + ':lesson');
  return {
    hello: `This sound is ${sound.sound}. Tap the big letter and listen.`,
    mouth: sound.mouth,
    chant: sound.chant,
    words: sound.words,
    blend: sound.words[0],
    tip:
      sound.position === 'end'
        ? 'Listen right at the END of each word for this sound.'
        : 'Listen right at the START of each word for this sound.',
    seed: next(),
  };
}

function otherWords(sound, count, next, exclude = []) {
  const banned = new Set([
    ...sound.words.map((x) => x.word.toLowerCase()),
    ...exclude.map((x) => x.toLowerCase()),
  ]);
  const seen = new Set();
  const pool = SOUNDS.filter((s) => s.id !== sound.id && gapKey(s) !== gapKey(sound))
    .flatMap((s) => s.words)
    .filter((word) => {
      const key = word.word.toLowerCase();
      if (banned.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return pick(pool, count, next);
}

/**
 * Every activity in the app is the same shape, so one component can render
 * lessons, practice and quizzes — and so AI-written topics slot straight in.
 */
function buildQuestions(sound, { count, seed }) {
  const next = rng(sound.id + ':' + seed);
  const words = shuffle(sound.words, next);
  const where = sound.position === 'end' ? 'end with' : 'start with';
  const out = [];

  // 1. Hear the sound, find the letter
  out.push({
    id: 'q-letter',
    kind: 'letter',
    prompt: 'Which letter makes this sound?',
    listen: sound.say,
    listenLabel: 'Play the sound',
    options: letterChoices(sound, next).map((l) => ({ id: l, label: l, say: null })),
    answer: sound.display,
    hint: sound.mouth,
  });

  // 2. Hear a word, find the word
  const target = words[0];
  const wordOpts = shuffle(
    [target, ...otherWords(sound, 3, next)],
    next
  ).map((o) => ({ id: o.word, label: o.word, emoji: o.emoji, say: o.word }));
  out.push({
    id: 'q-word',
    kind: 'word',
    prompt: 'Tap the word you hear.',
    listen: target.word,
    listenLabel: 'Play the word',
    options: wordOpts,
    answer: target.word,
    hint: `It ${where}s ${sound.sound}.`,
  });

  // 3. Which sound does this word have?
  const show = words[1];
  out.push({
    id: 'q-startsound',
    kind: 'sound',
    prompt: `Which sound does "${show.word}" ${where}?`,
    show: show.emoji,
    showWord: show.word,
    listen: show.word,
    listenLabel: `Hear "${show.word}"`,
    options: letterChoices(sound, next).map((l) => ({ id: l, label: l, say: null })),
    answer: sound.display,
    hint: 'Say the word slowly and listen hard.',
  });

  // 4. Fill the missing letter
  const key = gapKey(sound);
  const gapWord = words.find((x) => x.word.toLowerCase().includes(key)) || words[2];
  const idx = gapWord.word.toLowerCase().indexOf(key);
  const masked =
    idx >= 0
      ? gapWord.word.slice(0, idx) + '_'.repeat(key.length) + gapWord.word.slice(idx + key.length)
      : gapWord.word;
  out.push({
    id: 'q-gap',
    kind: 'gap',
    prompt: 'Which letters are missing?',
    show: gapWord.emoji,
    showWord: masked,
    listen: gapWord.word,
    listenLabel: `Hear "${gapWord.word}"`,
    options: shuffle(
      [key, ...pick(VOWEL_TILES.concat(['s', 't', 'b', 'm', 'ch']).filter((v) => v !== key), 3, next)],
      next
    ).map((l) => ({ id: l, label: l })),
    answer: key,
    hint: `The word is "${gapWord.word}".`,
  });

  // 5. Odd one out
  const three = pick(sound.words, 3, next);
  const stranger = otherWords(sound, 1, next)[0];
  out.push({
    id: 'q-odd',
    kind: 'odd',
    prompt: `Which one does NOT have the ${sound.sound} sound?`,
    options: shuffle([...three, stranger], next).map((o) => ({
      id: o.word,
      label: o.word,
      emoji: o.emoji,
      say: o.word,
    })),
    answer: stranger.word,
    hint: 'Say each word out loud first.',
  });

  // 6. One more word round for practice sets
  const second = words[2] || words[0];
  out.push({
    id: 'q-word-2',
    kind: 'word',
    prompt: 'Tap the word you hear.',
    listen: second.word,
    listenLabel: 'Play the word',
    options: shuffle([second, ...otherWords(sound, 3, next)], next).map((o) => ({
      id: o.word,
      label: o.word,
      emoji: o.emoji,
      say: o.word,
    })),
    answer: second.word,
    hint: `It ${where}s ${sound.sound}.`,
  });

  return shuffle(out, next).slice(0, count);
}

function buildTopic(sound) {
  return {
    ...sound,
    subject: 'phonics',
    lesson: buildLesson(sound),
    practice: buildQuestions(sound, { count: 5, seed: 'practice' }),
    quiz: buildQuestions(sound, { count: 5, seed: 'quiz' }),
  };
}

/* ── Custom (AI-written) topics ──────────────────────────────────────────── */

/**
 * A topic saved from the Grown-up Studio. It can either carry its own
 * questions or, if it is sound-shaped, get them generated automatically.
 */
export function normaliseCustomTopic(raw) {
  const base = {
    id: raw.id,
    trail: raw.trail || 'custom',
    trailName: raw.trailName || 'Added by a grown-up',
    subject: raw.subject || 'phonics',
    display: raw.display || '★',
    name: raw.name,
    sound: raw.sound || '',
    say: raw.say || raw.name,
    mouth: raw.mouth || '',
    chant: raw.chant || '',
    position: raw.position || 'start',
    words: raw.words || [],
    custom: true,
  };

  if (Array.isArray(raw.questions) && raw.questions.length) {
    const qs = raw.questions.map((q, i) => ({
      id: `cq-${i}`,
      kind: q.kind || 'word',
      prompt: q.prompt,
      show: q.emoji || null,
      showWord: q.showWord || null,
      listen: q.listen || null,
      listenLabel: q.listen ? 'Listen' : null,
      options: (q.options || []).map((o) =>
        typeof o === 'string'
          ? { id: o, label: o, say: o }
          : { id: o.label, label: o.label, emoji: o.emoji, say: o.label }
      ),
      answer: typeof q.answer === 'string' ? q.answer : q.answer?.label,
      hint: q.hint || '',
    }));
    return {
      ...base,
      lesson: {
        hello: raw.lesson?.hello || `Let's learn ${raw.name}.`,
        mouth: raw.lesson?.mouth || base.mouth,
        chant: raw.lesson?.chant || base.chant,
        words: base.words,
        blend: base.words[0] || { word: raw.name, emoji: '⭐' },
        tip: raw.lesson?.tip || '',
      },
      practice: qs.slice(0, Math.max(3, Math.ceil(qs.length / 2))),
      quiz: qs,
    };
  }

  // No questions supplied — build them from the word list, same as a core sound.
  return {
    ...base,
    lesson: buildLesson(base),
    practice: buildQuestions(base, { count: 5, seed: 'practice' }),
    quiz: buildQuestions(base, { count: 5, seed: 'quiz' }),
  };
}

/* ── Public API ──────────────────────────────────────────────────────────── */

export const CORE_TOPICS = SOUNDS.map(buildTopic);

export function allTopics(customTopics = []) {
  const extras = customTopics.map((t) => {
    try {
      return normaliseCustomTopic(t);
    } catch {
      return null;
    }
  });
  return [...CORE_TOPICS, ...extras.filter(Boolean)];
}

export function getTopic(id, customTopics = []) {
  return allTopics(customTopics).find((t) => t.id === id) || null;
}

export function trailsForSubject(subjectId, customTopics = []) {
  const topics = allTopics(customTopics).filter((t) => t.subject === subjectId);
  const known = TRAILS.map((tr) => ({
    ...tr,
    topics: topics.filter((t) => t.trail === tr.id),
  })).filter((tr) => tr.topics.length);

  const extras = {};
  topics
    .filter((t) => !TRAILS.some((tr) => tr.id === t.trail))
    .forEach((t) => {
      const key = t.trail;
      extras[key] = extras[key] || {
        id: key,
        name: t.trailName || 'Added by a grown-up',
        blurb: 'New lessons made with AI',
        emoji: '✨',
        color: 'grape',
        topics: [],
      };
      extras[key].topics.push(t);
    });

  return [...known, ...Object.values(extras)];
}

export function orderedTopics(subjectId = 'phonics', customTopics = []) {
  return trailsForSubject(subjectId, customTopics).flatMap((t) => t.topics);
}

export function nextTopicAfter(topicId, customTopics = []) {
  const list = orderedTopics('phonics', customTopics);
  const i = list.findIndex((t) => t.id === topicId);
  return i >= 0 && i < list.length - 1 ? list[i + 1] : null;
}

export { TRAILS };
