'use client';

import React from 'react';
import { useAuthAndUser } from "@/hooks/useAuthAndUser";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthAndUser();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <Navbar />
      <div className="main-content">{children}</div>
    </>
  );
}