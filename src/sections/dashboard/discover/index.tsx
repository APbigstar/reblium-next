'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

export default withAuth(function DiscoverView() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  return (
    <>
      <Navbar />
    </>
  );
});