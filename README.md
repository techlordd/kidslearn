# Sound Safari 🦜

A gamified, mobile-first phonics app for children aged roughly 4–8, built with Next.js and ready to deploy on Vercel.

Every sound gets the same three-part journey: **Lesson → Practice → Quiz**. Progress, stars, badges and streaks are saved on the device. Grown-ups can write brand new topics with AI from inside the app.

---

## What's in the box

**36 ready-made phonics topics**, grouped into five trails:

| Trail | Topics |
| --- | --- |
| Short Vowel Trail | short a, e, i, o, u |
| Consonant Camp: B–M | b c d f g h j k l m |
| Consonant Camp: N–Z | n p qu r s t v w x y z |
| Long Vowel Lagoon | long a, e, i, o, u |
| Two-Letter Team-Ups | sh, ch, th, ng, ck |

Each topic ships with:

- **Lesson** — a giant tappable letter that speaks, a mouth-movement tip, a word wall of six illustrated words, a blending exercise, and a rhyming chant.
- **Practice** — five relaxed rounds with retries and hints. No score.
- **Quiz** — five one-shot rounds, scored out of three stars.

Six question types are generated from the word data: hear-the-sound-pick-the-letter, hear-the-word-pick-the-word, which-sound-does-it-start-with, fill-the-missing-letter, odd-one-out, and a second listening round.

### Gamification

- **XP and levels** — nine levels from Little Listener to Sound Legend.
- **Stars** — 1–3 per topic, based on quiz score.
- **Badges** — twelve, from First Steps to Safari Complete.
- **Daily streak** — a flame counter with best-ever tracking.
- **Daily goal** — three activities a day, shown as a bar in the status bar.
- Confetti, a celebration overlay on level-up, and sound effects on every tap.

### Audio with zero assets

All speech comes from the browser's built-in `speechSynthesis`, and the sound effects are synthesised with the Web Audio API. There are no MP3s to host, so the whole app is about 110 kB of JavaScript.

Phonemes are fed to the voice as pronounceable spellings (`b` → "buh", short `o` → "awe") so the child hears the *sound*, not the letter name.

---

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Best viewed at phone width.

## Deploy to Vercel

```bash
npx vercel
```

Or push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new). No configuration needed — it is a stock Next.js App Router project.

Then add one environment variable in **Project Settings → Environment Variables**:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Optionally also `ANTHROPIC_MODEL` (defaults to `claude-sonnet-5`).

The key is only used by the Studio. Without it the app still works end to end — the Studio just hands back a blank starter topic instead of an AI-written one.

---

## Adding content

### With AI, from inside the app

**Grown-ups → Studio.** Pick a subject, describe the topic in plain words ("the oo sound as in moon", "first ten sight words"), and press *Write this lesson*. You see the full lesson and every quiz question before you press *Add to the map*. Added topics appear on the child's map immediately and can be removed at any time.

The request goes to `app/api/generate/route.js`, which asks Claude for strict JSON matching the app's question schema.

### By hand, in code

Open `lib/phonics-data.js` and add an entry to `SOUNDS`:

```js
{
  id: 'digraph-wh',
  trail: 'digraphs',
  display: 'wh',
  name: 'Wh Together',
  sound: '/wh/',
  say: 'wh',                        // spelling the voice can read as the sound
  mouth: 'Round your lips and blow gently: "wh".',
  chant: 'wh, wh, wh — a whale with a wheel!',
  position: 'start',                // or 'end'
  words: w('whale|🐋 wheel|🎡 white|⬜ whisper|🤫 wheat|🌾 whistle|📯'),
}
```

That is the whole job. Lesson, practice and quiz are generated from it automatically, and the topic appears on the map.

### New subjects

`SUBJECTS` in `lib/curriculum.js` already lists Sight Words, Early Numbers and World Around Us as placeholders. Flip `ready: true` once a subject has topics, or just generate topics into it from the Studio — a subject with AI-written topics shows up on its own.

---

## Project layout

```
app/
  page.js                          home, first-run name picker
  subject/[subjectId]/page.js      the trail map
  topic/[topicId]/lesson/page.js   4-step lesson
  topic/[topicId]/practice/page.js relaxed practice
  topic/[topicId]/quiz/page.js     scored quiz + results
  rewards/page.js                  badges, stars, level path
  grown-ups/page.js                progress dashboard
  grown-ups/studio/page.js         AI content generator
  api/generate/route.js            Claude call, JSON in / JSON out
components/
  Ui.js         buttons, tiles, bars, stars, Pip, confetti
  Question.js   one component renders every question type
  Shell.js      status bar, bottom nav, back bar, celebrations
lib/
  phonics-data.js  the raw sounds and word lists
  curriculum.js    turns sounds into lessons, practice and quizzes
  game.js          XP, levels, stars, badges
  audio.js         speech + synthesised sound effects
  progress.js      device-local save file
```

---

## Design notes

- **One interaction pattern.** Every tappable thing is a "block" with a thick bottom edge that presses down. Small fingers get a physical-feeling target of at least 44 px everywhere.
- **Feedback is instant.** A child does not wait until the end of a quiz to learn how they did. Practice allows retries; the quiz shows the right answer and moves on.
- **The grown-up view is plain English.** Percentages and "worth another go", not analytics dashboards.
- **Accessible by default.** Visible keyboard focus rings, `prefers-reduced-motion` respected, and colour never carries meaning on its own.

## Privacy

Everything lives in `localStorage` under the key `sound-safari:v1`. No accounts, no analytics, no network calls except when a grown-up presses *Write this lesson*.

If you later want progress to follow a child across devices, swap `lib/progress.js` for a small database — Vercel Postgres or KV both drop in without touching any screen, since every screen reads through the `useProgress()` hook.

## Ideas for next

- Multiple learner profiles on one device.
- Record-and-compare: let the child say the sound and play it back.
- A printable certificate when a trail is finished.
- Offline support with a service worker (the app is already asset-free enough for it).
