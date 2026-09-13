'use client';

import { useEffect, useRef, useState } from 'react';
import { Block } from './Ui';
import { say, sfx } from '@/lib/audio';
import { encourage, praise } from '@/lib/game';

/**
 * One question, any type. Practice lets a child try again; a quiz records the
 * first answer and moves on. Feedback is always immediate — waiting until the
 * end of a quiz to find out is no fun when you are five.
 */
export default function Question({ question: q, mode = 'practice', onDone, streak = 0 }) {
  const [chosen, setChosen] = useState(null);
  const [status, setStatus] = useState(null); // 'right' | 'wrong'
  const [tries, setTries] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const firstTry = useRef(true);

  useEffect(() => {
    setChosen(null);
    setStatus(null);
    setTries(0);
    setShowHint(false);
    firstTry.current = true;
    if (q.listen) {
      const t = setTimeout(() => say(q.listen, { rate: q.kind === 'letter' ? 0.6 : 0.72 }), 450);
      return () => clearTimeout(t);
    }
  }, [q]);

  const isLetterGrid = q.kind === 'letter' || q.kind === 'sound' || q.kind === 'gap';

  const choose = (opt) => {
    if (status === 'right') return;
    if (mode === 'quiz' && status) return;

    const right = opt.id === q.answer;
    setChosen(opt.id);
    setStatus(right ? 'right' : 'wrong');
    if (opt.say) say(opt.say, { rate: 0.75 });

    if (right) {
      sfx.correct();
      const wasFirstTry = firstTry.current;
      setTimeout(() => onDone({ correct: wasFirstTry, optionId: opt.id }), 900);
    } else {
      sfx.wrong();
      firstTry.current = false;
      const n = tries + 1;
      setTries(n);
      if (mode === 'quiz') {
        setTimeout(() => onDone({ correct: false, optionId: opt.id }), 1100);
      } else {
        if (n >= 2) setShowHint(true);
        setTimeout(() => {
          setStatus(null);
          setChosen(null);
        }, 700);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-xl font-semibold leading-snug">{q.prompt}</h2>

      {q.show && (
        <div className="text-center">
          <div className="text-7xl">{q.show}</div>
          {q.showWord && (
            <p className="mt-1 text-3xl font-bold letterface tracking-wide">{q.showWord}</p>
          )}
        </div>
      )}

      {q.listen && (
        <div className="flex justify-center">
          <Block
            tone="sky"
            onClick={() => say(q.listen, { rate: q.kind === 'letter' ? 0.6 : 0.72 })}
            className="px-8 py-4 text-lg"
            aria-label={q.listenLabel || 'Play the sound'}
          >
            🔊 {q.listenLabel || 'Play the sound'}
          </Block>
        </div>
      )}

      <div className={`grid gap-3 ${isLetterGrid ? 'grid-cols-2' : 'grid-cols-2'}`}>
        {q.options.map((opt) => {
          const picked = chosen === opt.id;
          const right = picked && status === 'right';
          const wrong = picked && status === 'wrong';
          const dim = status === 'right' && !picked;
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt)}
              className={[
                'block rounded-blob border-2 p-4 text-center transition',
                right ? 'border-leaf bg-leaf/15' : wrong ? 'border-coral bg-coral/15 animate-shake' : 'border-sand bg-white',
                dim ? 'opacity-40' : '',
              ].join(' ')}
              style={{ '--edge': right ? '#1E8B50' : wrong ? '#C93A3A' : '#EADBC2' }}
            >
              {opt.emoji && <div className="text-5xl">{opt.emoji}</div>}
              <div
                className={
                  isLetterGrid && !opt.emoji
                    ? 'letterface text-5xl font-bold'
                    : 'mt-1 text-xl font-semibold'
                }
              >
                {opt.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="min-h-[56px] text-center">
        {status === 'right' && (
          <p className="animate-pop text-lg font-bold text-leaf">{praise(streak)}</p>
        )}
        {status === 'wrong' && mode === 'practice' && (
          <p className="animate-pop text-lg font-semibold text-coral">{encourage()}</p>
        )}
        {status === 'wrong' && mode === 'quiz' && (
          <p className="animate-pop text-base font-semibold text-inkSoft">
            The answer is <span className="text-ink">{q.answer}</span>
          </p>
        )}
        {showHint && !status && q.hint && (
          <p className="rounded-blob bg-mango/20 px-4 py-2 text-sm">💡 {q.hint}</p>
        )}
        {!status && !showHint && q.hint && mode === 'practice' && (
          <button
            onClick={() => setShowHint(true)}
            className="text-sm font-semibold text-inkSoft underline underline-offset-4"
          >
            Need a hint?
          </button>
        )}
      </div>
    </div>
  );
}
