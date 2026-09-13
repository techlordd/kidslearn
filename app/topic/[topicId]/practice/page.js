'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BackBar } from '@/components/Shell';
import { Bar, Block, Loading, Pip, Tile } from '@/components/Ui';
import Question from '@/components/Question';
import { getTopic } from '@/lib/curriculum';
import { useProgress } from '@/lib/progress';
import { sfx, stopSpeaking } from '@/lib/audio';

export default function PracticePage() {
  const { topicId } = useParams();
  const router = useRouter();
  const { state, loaded, finishPractice } = useProgress();
  const topic = useMemo(() => getTopic(topicId, state.library), [topicId, state.library]);

  const [i, setI] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const [streak, setStreak] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => () => stopSpeaking(), []);

  if (!loaded) return <Loading />;
  if (!topic) return <Missing />;

  const questions = topic.practice;

  const handle = ({ correct }) => {
    if (correct) {
      setFirstTry((n) => n + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
    if (i + 1 < questions.length) {
      setI(i + 1);
    } else {
      sfx.win();
      finishPractice(topic.id, correct ? firstTry + 1 : firstTry);
      setDone(true);
    }
  };

  if (done) {
    return (
      <main>
        <BackBar title={topic.name} subtitle="Practice finished" />
        <div className="px-5 pt-10 text-center">
          <Pip size={80} mood="cheer" className="animate-pop" />
          <h1 className="mt-4 text-3xl font-bold">Practice done!</h1>
          <p className="mt-2 text-inkSoft">
            You got {firstTry} of {questions.length} on the first try.
          </p>
          <Tile className="mt-6 text-left">
            <p className="text-sm font-semibold">Ready for the quiz?</p>
            <p className="mt-1 text-sm text-inkSoft">
              The quiz gives one go per question and earns you stars.
            </p>
          </Tile>
          <Block tone="leaf" size="lg" className="mt-5" href={`/topic/${topic.id}/quiz`}>
            Start the quiz
          </Block>
          <Block
            tone="white"
            size="lg"
            className="mt-3"
            onClick={() => {
              setI(0);
              setFirstTry(0);
              setDone(false);
            }}
          >
            Practise again
          </Block>
        </div>
      </main>
    );
  }

  return (
    <main>
      <BackBar
        title={topic.name}
        subtitle={`Practice · ${i + 1} of ${questions.length}`}
        to={`/topic/${topic.id}/lesson`}
      />
      <div className="px-5 pb-10 pt-4">
        <Bar value={(i + 1) / questions.length} tone="sky" />
        <p className="mt-2 text-center text-xs text-inkSoft">
          No pressure here — you can try as many times as you like.
        </p>
        <div className="mt-5">
          <Question question={questions[i]} mode="practice" onDone={handle} streak={streak} />
        </div>
      </div>
    </main>
  );
}

function Missing() {
  return (
    <main>
      <BackBar title="Practice not found" to="/subject/phonics" />
      <p className="px-5 pt-10 text-center text-inkSoft">Pick another sound to practise.</p>
    </main>
  );
}
