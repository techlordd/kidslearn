'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Stars } from './Ui';
import { orderedTopics, subjectsForArea } from '@/lib/curriculum';

/** One subject tile on the home screen: English, Mathematics, Science. */
export function AreaCard({ area, state }) {
  const contentTopics = useMemo(
    () => subjectsForArea(area.id).flatMap((s) => orderedTopics(s.id, state.library)),
    [area.id, state.library]
  );
  const done = contentTopics.filter((t) => (state.topics[t.id]?.stars || 0) > 0).length;

  return (
    <Link
      href={`/area/${area.id}`}
      className="flex items-center gap-4 rounded-blob border-2 border-sand bg-white p-4"
      style={{ boxShadow: '0 6px 0 0 #EADBC2' }}
    >
      <div className="text-4xl">{area.emoji}</div>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{area.name}</p>
        <p className="text-xs text-inkSoft">{area.tagline}</p>
        {contentTopics.length > 0 && (
          <p className="mt-1 text-xs font-semibold text-leaf">
            {done} of {contentTopics.length} mastered
          </p>
        )}
      </div>
      {contentTopics.length > 0 && (
        <Stars count={Math.min(3, Math.floor((done / Math.max(1, contentTopics.length)) * 3))} size="text-sm" />
      )}
    </Link>
  );
}

/** One topic row inside a subject: Phonics, Grammar, Counting & Numbers... */
export function TopicRow({ topic, state }) {
  const items = useMemo(() => orderedTopics(topic.id, state.library), [topic.id, state.library]);
  const hasContent = topic.ready || items.length > 0;
  const done = items.filter((t) => (state.topics[t.id]?.stars || 0) > 0).length;

  if (!hasContent) {
    return (
      <div className="flex items-center gap-4 rounded-blob border-2 border-dashed border-sand bg-white/50 p-4">
        <div className="text-3xl opacity-60">{topic.emoji}</div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-inkSoft">{topic.name}</p>
          <p className="text-xs text-inkSoft">{topic.tagline}</p>
        </div>
        <Link href="/grown-ups/studio" className="chip bg-sand text-xs">
          Add with AI
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={`/subject/${topic.id}`}
      className="flex items-center gap-4 rounded-blob border-2 border-sand bg-white p-4"
      style={{ boxShadow: '0 6px 0 0 #EADBC2' }}
    >
      <div className="text-4xl">{topic.emoji}</div>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{topic.name}</p>
        <p className="text-xs text-inkSoft">{topic.tagline}</p>
        <p className="mt-1 text-xs font-semibold text-leaf">
          {done} of {items.length} mastered
        </p>
      </div>
      <Stars count={Math.min(3, Math.floor((done / Math.max(1, items.length)) * 3))} size="text-sm" />
    </Link>
  );
}
