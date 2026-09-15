'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { BackBar } from '@/components/Shell';
import { Block, Confetti, Loading, Pip, Stars, Tile } from '@/components/Ui';
import Question from '@/components/Question';
import { getTopic, nextTopicAfter } from '@/lib/curriculum';
import { useProgress } from '@/lib/progress';
import { XP, starsFor } from '@/lib/game';
import { sfx, stopSpeaking } from '@/lib/audio';

export default function QuizPage() {
  const { topicId } = useParams();
  const { state, loaded, finishQuiz } = useProgress();
  const topic = useMemo(() => getTopic(topicId, state.library), [topicId, state.library]);
  const upNext = useMemo(() => nextTopicAfter(topicId, state.library), [topicId, state.library]);

  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => () => stopSpeaking(), []);

  if (!loaded) return <Loading />;
  if (!topic) return <Missing />;

  const questions = topic.quiz;

  const handle = ({ correct: ok }) => {
    const total = ok ? correct + 1 : correct;
    const missed = ok ? wrong : [...wrong, questions[i].id];
    setCorrect(total);
    setWrong(missed);
    setStreak(ok ? streak + 1 : 0);

    if (i + 1 < questions.length) {
      setI(i + 1);
    } else {
      finishQuiz(topic.id, total, questions.length, missed);
      if (total === questions.length) sfx.win();
      setFinished(true);
    }
  };

  if (finished) {
    const stars = starsFor(correct, questions.length);
    const earned = correct * XP.quizCorrect + (correct === questions.length ? XP.quizPerfect : 0);
    return (
      <main>
        {stars >= 2 && <Confetti />}
        <BackBar title={topic.name} subtitle="Quiz results" />
        <div className="px-5 pb-10 pt-8 text-center">
          <Pip size={80} mood={stars >= 2 ? 'cheer' : 'think'} className="animate-pop" />
          <h1 className="mt-3 text-3xl font-bold">
            {stars === 3 ? 'Perfect!' : stars === 2 ? 'Great job!' : stars === 1 ? 'Good work!' : 'Nice try!'}
          </h1>
          <div className="mt-3">
            <Stars count={stars} size="text-4xl" />
          </div>
          <p className="mt-3 text-lg">
            {correct} out of {questions.length} right
          </p>
          <p className="text-sm font-semibold text-leaf">+{earned} XP</p>

          {stars < 3 && (
            <Tile className="mt-6 text-left">
              <p className="text-sm font-semibold">Tip from Pip</p>
              <p className="mt-1 text-sm text-inkSoft">
                {stars === 0
                  ? topic.sound
                    ? `Let's hear ${topic.sound} again in the lesson, then try once more.`
                    : "Let's go through the lesson again, then try once more."
                  : 'Another practice round makes three stars much easier.'}
              </p>
            </Tile>
          )}

          <div className="mt-6 space-y-3">
            <Block
              tone="leaf"
              size="lg"
              onClick={() => {
                setI(0);
                setCorrect(0);
                setWrong([]);
                setFinished(false);
              }}
            >
              Try the quiz again
            </Block>
            {upNext && (
              <Block tone="sky" size="lg" href={`/topic/${upNext.id}/lesson`}>
                {topic.kind === 'maths' ? 'Next up' : 'Next sound'}: {upNext.name}
              </Block>
            )}
            <Block tone="white" size="lg" href={`/subject/${topic.subject}`}>
              Back to the map
            </Block>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <BackBar
        title={topic.name}
        subtitle={`Quiz · ${i + 1} of ${questions.length}`}
        to={`/topic/${topic.id}/practice`}
      />
      <div className="px-5 pb-10 pt-4">
        <div className="flex justify-center gap-2">
          {questions.map((q, n) => (
            <span
              key={q.id}
              className={`h-3 w-3 rounded-full ${
                n < i ? 'bg-leaf' : n === i ? 'bg-mango' : 'bg-sand'
              }`}
            />
          ))}
        </div>
        <div className="mt-6">
          <Question question={questions[i]} mode="quiz" onDone={handle} streak={streak} />
        </div>
      </div>
    </main>
  );
}

function Missing() {
  return (
    <main>
      <BackBar title="Quiz not found" to="/" />
      <p className="px-5 pt-10 text-center text-inkSoft">Pick another topic to try.</p>
    </main>
  );
}
