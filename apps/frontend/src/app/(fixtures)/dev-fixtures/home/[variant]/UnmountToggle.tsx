'use client';

import { useState } from 'react';

/** Unmounts its children in place so e2e can check client-island cleanup without a reload. */
export function UnmountToggle({ children }: { children: React.ReactNode }) {
  const [shown, setShown] = useState(true);
  return (
    <>
      <button type="button" id="unmount-toggle" onClick={() => setShown(false)}>
        Unmount {/* business-text-ok: fixture button */}
      </button>
      {shown && children}
    </>
  );
}
