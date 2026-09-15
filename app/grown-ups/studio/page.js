'use client';

import { useState } from 'react';
import { BackBar } from '@/components/Shell';
import PinGate from '@/components/PinGate';
import { Block, Loading, Pip, Tile } from '@/components/Ui';
import { SUBJECTS } from '@/lib/curriculum';
import { useProgress } from '@/lib/progress';
import { say } from '@/lib/audio';

const IDEAS = [
  { subject: 'phonics', topic: 'The oo sound as in moon', letters: 'oo' },
  { subject: 'phonics', topic: 'Blending st words like stop and star', letters: 'st' },
  { subject: 'sight-words', topic: 'First ten sight words: the, and, is, it, to', letters: '' },
  { subject: 'numbers', topic: 'Counting to ten with objects', letters: '' },
  { subject: 'nature', topic: 'Farm animals and the sounds they make', letters: '' },
];

export default function StudioPage() {
  const { state, loaded, addLibraryTopic, removeLibraryTopic } = useProgress();
  const [form, setForm] = useState({
    subject: 'phonics',
    topic: '',
    letters: '',
    age: '5-7',
    notes: '',
    count: 5,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [note, setNote] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);

  if (!loaded) return <Loading />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const generate = async () => {
    setBusy(true);
    setError(null);
    setNote(null);
    setDraft(null);
    setSaved(false);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again.');
      } else {
        setDraft(data.topic);
        if (data.note) setNote(data.note);
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    }
    setBusy(false);
  };

  const save = () => {
    addLibraryTopic(draft);
    setSaved(true);
  };

  return (
    <PinGate>
    <main>
      <BackBar title="Studio" subtitle="Write new lessons with AI" to="/grown-ups" />
      <div className="px-5 pb-10 pt-4">
        <div className="flex items-start gap-3">
          <Pip size={44} />
          <p className="text-sm text-inkSoft">
            Describe a topic in plain words. You will see the lesson and quiz before anything
            reaches your child&apos;s map.
          </p>
        </div>

        <Tile className="mt-5">
          <label className="text-sm font-semibold" htmlFor="subject">
            Subject
          </label>
          <select
            id="subject"
            value={form.subject}
            onChange={set('subject')}
            className="mt-1 w-full rounded-2xl border-2 border-sand bg-paper px-4 py-3 outline-none focus:border-sky"
          >
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.name}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-sm font-semibold" htmlFor="topic">
            What should the lesson teach?
          </label>
          <input
            id="topic"
            value={form.topic}
            onChange={set('topic')}
            placeholder="e.g. The oo sound as in moon"
            className="mt-1 w-full rounded-2xl border-2 border-sand bg-paper px-4 py-3 outline-none focus:border-sky"
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold" htmlFor="letters">
                Letters (optional)
              </label>
              <input
                id="letters"
                value={form.letters}
                onChange={set('letters')}
                placeholder="oo"
                className="mt-1 w-full rounded-2xl border-2 border-sand bg-paper px-4 py-3 outline-none focus:border-sky"
              />
            </div>
            <div>
              <label className="text-sm font-semibold" htmlFor="age">
                Age
              </label>
              <select
                id="age"
                value={form.age}
                onChange={set('age')}
                className="mt-1 w-full rounded-2xl border-2 border-sand bg-paper px-4 py-3 outline-none focus:border-sky"
              >
                <option value="3-4">3–4</option>
                <option value="5-7">5–7</option>
                <option value="8-10">8–10</option>
              </select>
            </div>
          </div>

          <label className="mt-4 block text-sm font-semibold" htmlFor="notes">
            Anything else? (optional)
          </label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={set('notes')}
            rows={2}
            placeholder="Use words from our reading book: shed, shop, shell"
            className="mt-1 w-full rounded-2xl border-2 border-sand bg-paper px-4 py-3 outline-none focus:border-sky"
          />

          <Block
            tone="grape"
            size="lg"
            className="mt-5"
            disabled={busy || !form.topic.trim()}
            onClick={generate}
          >
            {busy ? 'Writing the lesson…' : 'Write this lesson'}
          </Block>

          <div className="mt-4">
            <p className="text-xs font-semibold text-inkSoft">Need an idea?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {IDEAS.map((i) => (
                <button
                  key={i.topic}
                  onClick={() => setForm({ ...form, ...i })}
                  className="chip border-2 border-sand bg-white text-xs"
                >
                  {i.topic}
                </button>
              ))}
            </div>
          </div>
        </Tile>

        {error && (
          <Tile className="mt-4 border-coral">
            <p className="text-sm font-semibold text-coral">{error}</p>
            <p className="mt-1 text-sm text-inkSoft">
              If this keeps happening, check that ANTHROPIC_API_KEY is set in your Vercel project.
            </p>
          </Tile>
        )}

        {note && (
          <Tile className="mt-4 bg-mango/15">
            <p className="text-sm">{note}</p>
          </Tile>
        )}

        {draft && (
          <Tile className="mt-4">
            <p className="text-xs font-semibold text-inkSoft">Preview</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="letterface flex h-16 w-16 items-center justify-center rounded-blob border-2 border-sand text-3xl font-bold">
                {draft.display}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold">{draft.name}</h2>
                <p className="text-sm text-inkSoft">{draft.sound}</p>
              </div>
              {draft.say && (
                <button
                  onClick={() => say(draft.say, { rate: 0.6 })}
                  className="ml-auto rounded-full border-2 border-sand px-3 py-2 text-sm"
                >
                  🔊
                </button>
              )}
            </div>

            {draft.chant && <p className="mt-3 rounded-2xl bg-mango/20 p-3 text-sm">{draft.chant}</p>}

            {draft.words?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {draft.words.map((w) => (
                  <span key={w.word} className="chip border-2 border-sand bg-white text-sm">
                    {w.emoji} {w.word}
                  </span>
                ))}
              </div>
            )}

            {draft.questions?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold">{draft.questions.length} questions</p>
                <ol className="mt-2 space-y-2 text-sm">
                  {draft.questions.map((q, i) => (
                    <li key={i} className="rounded-2xl border-2 border-sand p-3">
                      <p className="font-semibold">{q.prompt}</p>
                      <p className="mt-1 text-inkSoft">
                        {(q.options || [])
                          .map((o) => (typeof o === 'string' ? o : o.label))
                          .join(' · ')}
                      </p>
                      <p className="mt-1 text-xs text-leaf">
                        Answer: {typeof q.answer === 'string' ? q.answer : q.answer?.label}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {saved ? (
              <div className="mt-5 text-center">
                <p className="font-semibold text-leaf">Added to the map 🎉</p>
                <Block tone="sky" size="lg" className="mt-3" href={`/topic/${draft.id}/lesson`}>
                  Try it now
                </Block>
              </div>
            ) : (
              <div className="mt-5 flex gap-3">
                <Block tone="leaf" onClick={save} className="flex-1">
                  Add to the map
                </Block>
                <Block tone="white" onClick={generate} className="flex-1">
                  Rewrite it
                </Block>
              </div>
            )}
          </Tile>
        )}

        {state.library.length > 0 && (
          <Tile className="mt-6">
            <p className="font-semibold">Your added topics</p>
            <ul className="mt-2 divide-y divide-sand">
              {state.library.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2">
                  <span className="letterface text-xl font-bold">{t.display}</span>
                  <span className="flex-1 truncate text-sm">{t.name}</span>
                  <button
                    onClick={() => removeLibraryTopic(t.id)}
                    className="text-xs font-semibold text-coral underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </Tile>
        )}
      </div>
    </main>
    </PinGate>
  );
}
