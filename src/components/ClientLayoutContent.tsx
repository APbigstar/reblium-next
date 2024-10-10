"use client";

import React, { useContext } from "react";
import { usePathname } from "next/navigation";
import { UserContext } from "@/contexts/UserContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export function ClientLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useContext(UserContext);
  const pathname = usePathname();

  // Check if the current route includes "avatar/"
  const isAvatarRoute = pathname.includes("/avatar");

  if (!isAuthenticated || isAvatarRoute) {
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
