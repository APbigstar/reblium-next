import type { Metadata } from "next";
import { UserProvider } from "@/contexts/UserContext";
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
        <UserProvider>
          <ClientSessionProvider>
            <ClientLayoutContent>{children}</ClientLayoutContent>
          </ClientSessionProvider>
        </UserProvider>
      </body>
    </html>
  );
}
