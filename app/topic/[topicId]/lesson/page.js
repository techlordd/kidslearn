'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BackBar } from '@/components/Shell';
import { Bar, Block, Loading, Pip, SpeechBubble, Tile } from '@/components/Ui';
import { getTopic } from '@/lib/curriculum';
import { useProgress } from '@/lib/progress';
import { say, sayBlended, sfx, stopSpeaking } from '@/lib/audio';

export default function LessonPage() {
  const { topicId } = useParams();
  const router = useRouter();
  const { state, loaded, finishLesson } = useProgress();
  const topic = useMemo(() => getTopic(topicId, state.library), [topicId, state.library]);
  const [step, setStep] = useState(0);
  const [heard, setHeard] = useState(new Set());

  useEffect(() => () => stopSpeaking(), []);

  if (!loaded) return <Loading />;
  if (!topic) return <NotFound />;
  if (topic.kind === 'maths') return <MathsLesson topic={topic} finishLesson={finishLesson} />;

  const steps = ['Meet the sound', 'Word wall', 'Blend it', 'Say it together'];
  const last = steps.length - 1;

  const next = () => {
    if (step < last) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      sfx.win();
      finishLesson(topic.id);
      router.push(`/topic/${topic.id}/practice`);
    }
  };

  return (
    <main>
      <BackBar title={topic.name} subtitle={`Lesson · ${steps[step]}`} />
      <div className="px-5 pb-8 pt-4">
        <Bar value={(step + 1) / steps.length} tone="sky" />

        {step === 0 && (
          <section className="mt-6 text-center">
            <p className="text-inkSoft">{topic.lesson.hello}</p>
            <button
              onClick={() => say(topic.say, { rate: 0.55, repeat: 2 })}
              className="relative mx-auto mt-6 flex h-56 w-56 items-center justify-center rounded-blob border-4 border-sand bg-white"
              style={{ boxShadow: '0 10px 0 0 #EADBC2' }}
              aria-label={`Play the ${topic.sound} sound`}
            >
              <span className="absolute inset-0 rounded-blob bg-mango/40 animate-pulseRing" />
              <span className="letterface relative text-8xl font-bold">{topic.display}</span>
            </button>
            <p className="mt-4 text-2xl font-bold">{topic.sound}</p>
            <p className="text-sm text-inkSoft">Tap the letter to hear it</p>

            <Tile className="mt-6 text-left">
              <p className="text-sm font-semibold">How your mouth moves</p>
              <p className="mt-1 text-inkSoft">{topic.lesson.mouth}</p>
            </Tile>
          </section>
        )}

        {step === 1 && (
          <section className="mt-6">
            <div className="flex items-end gap-3">
              <Pip size={48} />
              <SpeechBubble>
                <p className="text-sm">{topic.lesson.tip} Tap every word to hear it.</p>
              </SpeechBubble>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {topic.lesson.words.map((word) => {
                const done = heard.has(word.word);
                return (
                  <button
                    key={word.word}
                    onClick={() => {
                      say(word.word, { rate: 0.7 });
                      setHeard((h) => new Set(h).add(word.word));
                    }}
                    className={`rounded-blob border-2 p-4 text-center transition ${
                      done ? 'border-leaf bg-leaf/10' : 'border-sand bg-white'
                    }`}
                    style={{ boxShadow: '0 5px 0 0 #EADBC2' }}
                  >
                    <div className="text-5xl">{word.emoji}</div>
                    <div className="mt-1 text-xl font-semibold">{word.word}</div>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-inkSoft">
              {heard.size} of {topic.lesson.words.length} words heard
            </p>
          </section>
        )}

        {step === 2 && (
          <section className="mt-6 text-center">
            <p className="text-inkSoft">Slide the sounds together to build the word.</p>
            <div className="mt-6 text-7xl">{topic.lesson.blend.emoji}</div>
            <div className="mt-4 flex justify-center gap-2">
              {topic.lesson.blend.word.split('').map((ch, i) => (
                <button
                  key={i}
                  onClick={() => say(ch, { rate: 0.5 })}
                  className="letterface h-16 w-14 rounded-2xl border-2 border-sand bg-white text-3xl font-bold"
                  style={{ boxShadow: '0 5px 0 0 #EADBC2' }}
                >
                  {ch}
                </button>
              ))}
            </div>
            <Block
              tone="sky"
              size="lg"
              className="mt-6"
              onClick={() => sayBlended(topic.lesson.blend.word)}
            >
              🔊 Blend it slowly
            </Block>
            <p className="mt-3 text-sm text-inkSoft">
              Tap each letter on its own, then blend them together.
            </p>
          </section>
        )}

        {step === 3 && (
          <section className="mt-6 text-center">
            <Pip size={64} className="animate-wiggle" />
            <Tile className="mt-4 bg-mango/20">
              <p className="text-2xl font-bold leading-snug">{topic.lesson.chant}</p>
            </Tile>
            <Block
              tone="sky"
              size="lg"
              className="mt-5"
              onClick={() => say(topic.lesson.chant, { rate: 0.7 })}
            >
              🔊 Say it with Pip
            </Block>
            <p className="mt-4 text-sm text-inkSoft">
              Clap along three times, then try the practice round.
            </p>
          </section>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Block tone="white" onClick={() => setStep(step - 1)} className="px-5">
              Back
            </Block>
          )}
          <Block tone="leaf" size="lg" onClick={next} className="flex-1">
            {step === last ? "I'm ready to practise" : 'Next'}
          </Block>
        </div>
      </div>
    </main>
  );
}

function MathsLesson({ topic, finishLesson }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const steps = ['Learn it', 'Say it together'];
  const last = steps.length - 1;
  const example = topic.lesson.example;

  const next = () => {
    if (step < last) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      sfx.win();
      finishLesson(topic.id);
      router.push(`/topic/${topic.id}/practice`);
    }
  };

  return (
    <main>
      <BackBar title={topic.name} subtitle={`Lesson · ${steps[step]}`} />
      <div className="px-5 pb-8 pt-4">
        <Bar value={(step + 1) / steps.length} tone="sky" />

        {step === 0 && (
          <section className="mt-6 text-center">
            <p className="text-inkSoft">{topic.lesson.intro}</p>
            <button
              onClick={() => say(topic.lesson.intro, { rate: 0.75 })}
              className="relative mx-auto mt-6 flex h-40 w-40 items-center justify-center rounded-blob border-4 border-sand bg-white"
              style={{ boxShadow: '0 10px 0 0 #EADBC2' }}
              aria-label={`Hear about ${topic.name}`}
            >
              <span className="absolute inset-0 rounded-blob bg-mango/40 animate-pulseRing" />
              <span className="letterface relative text-6xl font-bold">{topic.display}</span>
            </button>
            <p className="mt-3 text-sm text-inkSoft">Tap to hear it again</p>

            {example && (
              <Tile className="mt-6 text-left">
                <p className="text-sm font-semibold">Worked example</p>
                <p className="mt-2 text-center text-inkSoft">{example.prompt}</p>
                {example.show && <div className="mt-2 text-center text-5xl">{example.show}</div>}
                {example.showWord && (
                  <p className="mt-1 text-center text-2xl font-bold letterface tracking-wide">
                    {example.showWord}
                  </p>
                )}
                {example.grid && (
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-3xl">
                    {example.grid.map((icon, i) => (
                      <span key={i}>{icon}</span>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-center text-lg font-bold text-leaf">
                  Answer: {example.answer}
                </p>
              </Tile>
            )}
          </section>
        )}

        {step === 1 && (
          <section className="mt-6 text-center">
            <Pip size={64} className="animate-wiggle" />
            <Tile className="mt-4 bg-mango/20">
              <p className="text-2xl font-bold leading-snug">{topic.lesson.chant}</p>
            </Tile>
            <Block
              tone="sky"
              size="lg"
              className="mt-5"
              onClick={() => say(topic.lesson.chant, { rate: 0.7 })}
            >
              🔊 Say it with Pip
            </Block>
            <p className="mt-4 text-sm text-inkSoft">
              Say it together, then try the practice round.
            </p>
          </section>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Block tone="white" onClick={() => setStep(step - 1)} className="px-5">
              Back
            </Block>
          )}
          <Block tone="leaf" size="lg" onClick={next} className="flex-1">
            {step === last ? "I'm ready to practise" : 'Next'}
          </Block>
        </div>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main>
      <BackBar title="Lesson not found" to="/" />
      <p className="px-5 pt-10 text-center text-inkSoft">
        This lesson is not on the map any more. Try picking another topic.
      </p>
    </main>
  );
}
