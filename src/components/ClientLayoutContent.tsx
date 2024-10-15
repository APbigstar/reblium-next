"use client";

import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import { UserContext } from "@/provider/UserContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export function ClientLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useContext(UserContext);
  const pathname = usePathname();

  if (loading) return null;

  const isAvatarRoute = pathname.includes("/avatarMode");
  const isSignupRoute = pathname.includes("/signup");

  if (!isAuthenticated || isAvatarRoute || isSignupRoute) {
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