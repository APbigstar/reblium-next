'use client'

import { UserProvider } from "@/provider/UserContext";
import { ClientLayoutContent } from "@/components/ClientLayoutContent";
import { SessionProvider } from "next-auth/react";

export default function ClientWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <UserProvider>
        <ClientLayoutContent>{children}</ClientLayoutContent>
      </UserProvider>
    </SessionProvider>
  );
}