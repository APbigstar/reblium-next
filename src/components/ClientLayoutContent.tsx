'use client';

import React, { useContext } from 'react';
import { UserContext } from "@/contexts/UserContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useContext(UserContext);

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