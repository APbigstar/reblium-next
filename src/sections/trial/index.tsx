'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrialView() {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row h-screen items-center">
      It's Trial
    </div>
  );
}