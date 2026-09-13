'use client';

import { ProgressProvider } from '@/lib/progress';
import { Celebrations } from '@/components/Shell';

export default function Providers({ children }) {
  return (
    <ProgressProvider>
      {children}
      <Celebrations />
    </ProgressProvider>
  );
}
