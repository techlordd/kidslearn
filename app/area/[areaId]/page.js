'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { BackBar } from '@/components/Shell';
import { TopicRow } from '@/components/Curriculum';
import { Loading } from '@/components/Ui';
import { SUBJECT_AREAS, subjectsForArea } from '@/lib/curriculum';
import { useProgress } from '@/lib/progress';

export default function AreaPage() {
  const { areaId } = useParams();
  const { state, loaded } = useProgress();
  const area = SUBJECT_AREAS.find((a) => a.id === areaId);
  const topics = useMemo(() => subjectsForArea(areaId), [areaId]);

  if (!loaded) return <Loading />;

  if (!area) {
    return (
      <main>
        <BackBar title="Not found" to="/" />
      </main>
    );
  }

  return (
    <main>
      <BackBar title={area.name} subtitle={area.tagline} to="/" />
      <div className="px-5 pb-6 pt-4">
        <div className="space-y-3">
          {topics.map((t) => (
            <TopicRow key={t.id} topic={t} state={state} />
          ))}
        </div>
      </div>
    </main>
  );
}
