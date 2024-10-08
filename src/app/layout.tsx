import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { SessionProvider } from "next-auth/react"
import ClientSessionProvider from "@/components/ClientSessionProvider";
import { ClientLayoutContent } from "@/components/ClientLayoutContent";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Reblium",
  description: "Reblium Avatar Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UserProvider>
            <ClientSessionProvider>
              <ClientLayoutContent>{children}</ClientLayoutContent>
            </ClientSessionProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}