'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ProfileProvider, useProfiles } from '@/lib/profiles';
import { ProgressProvider } from '@/lib/progress';
import { Celebrations } from '@/components/Shell';

/* A deep link (or a cleared device) with nobody picked yet should land on
   the "who's playing" screen, not spin forever waiting for progress data
   that has nowhere to load from. */
function RequireProfile({ children }) {
  const { ready, activeId } = useProfiles();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !activeId && pathname !== '/') router.replace('/');
  }, [ready, activeId, pathname, router]);

  return children;
}

export default function Providers({ children }) {
  return (
    <ProfileProvider>
      <RequireProfile>
        <ProgressProvider>
          {children}
          <Celebrations />
        </ProgressProvider>
      </RequireProfile>
    </ProfileProvider>
  );
}
