import type { Metadata } from "next";
import { MembershipPlansProvider } from "@/provider/MembershipPlansProvider";
import { UserMembershipPlansProvider } from "@/provider/UserMembershipPlansProvider";
import "../styles/globals.css";
import ClientWrapper from "@/components/ClientWrapper";

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
        <MembershipPlansProvider>
          <UserMembershipPlansProvider>
            <ClientWrapper>{children}</ClientWrapper>
          </UserMembershipPlansProvider>
        </MembershipPlansProvider>
      </body>
    </html>
  );
}
