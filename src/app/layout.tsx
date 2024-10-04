import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientSessionProvider from "@/components/ClientSessionProvider";

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
          <ClientSessionProvider>{children}</ClientSessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
