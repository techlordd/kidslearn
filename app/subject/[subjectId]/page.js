'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { BackBar } from '@/components/Shell';
import { Loading, Stars, Tile } from '@/components/Ui';
import { SUBJECTS, trailsForSubject } from '@/lib/curriculum';
import { useProgress } from '@/lib/progress';

export default function SubjectPage() {
  const { subjectId } = useParams();
  const { state, loaded } = useProgress();
  const trails = useMemo(
    () => trailsForSubject(subjectId, state.library),
    [subjectId, state.library]
  );
  const subject = SUBJECTS.find((s) => s.id === subjectId);

  if (!loaded) return <Loading />;

  if (!subject || !trails.length) {
    return (
      <main>
        <BackBar title="Nothing here yet" to="/" />
        <div className="px-5 pt-10 text-center">
          <p className="text-inkSoft">
            This subject has no lessons yet. A grown-up can add some in the Studio.
          </p>
          <Link href="/grown-ups/studio" className="mt-4 inline-block font-semibold underline">
            Open the Studio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <BackBar title={subject.name} subtitle={subject.tagline} to="/" />
      <div className="px-5 pb-6 pt-4">
        {trails.map((trail) => {
          const done = trail.topics.filter((t) => (state.topics[t.id]?.stars || 0) > 0).length;
          return (
            <section key={trail.id} className="mb-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{trail.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold leading-tight">{trail.name}</h2>
                  <p className="text-xs text-inkSoft">{trail.blurb}</p>
                </div>
                <span className="chip bg-sand text-xs">
                  {done}/{trail.topics.length}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3">
                {trail.topics.map((t) => {
                  const p = state.topics[t.id];
                  const stars = p?.stars || 0;
                  return (
                    <Link
                      key={t.id}
                      href={`/topic/${t.id}/lesson`}
                      className={`flex flex-col items-center rounded-blob border-2 p-3 ${
                        stars > 0 ? 'border-leaf bg-leaf/10' : p?.lessonDone ? 'border-mango bg-mango/10' : 'border-sand bg-white'
                      }`}
                      style={{ boxShadow: '0 5px 0 0 #EADBC2' }}
                    >
                      <span className="letterface text-3xl font-bold">{t.display}</span>
                      <span className="mt-1 text-[11px] leading-tight text-inkSoft text-center">
                        {t.sound || t.name}
                      </span>
                      <span className="mt-1">
                        <Stars count={stars} size="text-[10px]" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        <Tile className="bg-white/70 text-center">
          <p className="text-sm font-semibold">Want more topics?</p>
          <p className="mt-1 text-sm text-inkSoft">
            A grown-up can write new lessons with AI in the Studio.
          </p>
          <Link href="/grown-ups/studio" className="mt-3 inline-block font-semibold underline">
            Open the Studio
          </Link>
        </Tile>
      </div>
    </main>
  );
}
