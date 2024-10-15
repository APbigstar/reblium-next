  import type { Metadata } from "next";
  import { UserProvider } from "@/provider/UserContext";
  import { ClientLayoutContent } from "@/components/ClientLayoutContent";
  import { MembershipPlansProvider } from "@/provider/MembershipPlansProvider";
  import { UserMembershipPlansProvider } from "@/provider/UserMembershipPlansProvider";
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
          <MembershipPlansProvider>
            <UserMembershipPlansProvider>
              <UserProvider>
                <ClientLayoutContent>{children}</ClientLayoutContent>
              </UserProvider>
            </UserMembershipPlansProvider>
          </MembershipPlansProvider>
        </body>
      </html>
    );
  }
