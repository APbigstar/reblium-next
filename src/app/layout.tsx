import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import ClientSessionProvider from "@/components/ClientSessionProvider";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
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
                {children}
            </ClientSessionProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}