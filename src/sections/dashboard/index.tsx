'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/hooks/useAuth';

export default withAuth(function DashboardView() {
  const router = useRouter();
  const { logout } = useAuth();
  return (
    <div className="flex flex-col md:flex-row h-screen items-center">
      It's Dashboard
      <button className="bg-blue-standard text-white p-2 rounded" onClick={logout}>Logout</button>
    </div>
  );
});