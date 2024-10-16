import NextAuth, { DefaultSession, NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/utils/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Extend the built-in session type
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      accessToken: string;
    } & DefaultSession["user"];
  }
}

// Define a type for the database user
interface DbUser {
  id: number;
  email: string;
  is_verified: boolean;
  password?: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const users = await query<DbUser[]>(
          "SELECT * FROM Users WHERE email = ?",
          [credentials.email]
        );

        if (users.length === 0) {
          return null;
        }

        const user = users[0];

        if (!user.is_verified) {
          throw new Error("Please verify your email before signing in");
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password!
        );

        if (!isMatch) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.accessToken = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET!,
          { expiresIn: "1h" }
        );
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "discord") {
        try {
          const dbUser = await socialLoginHandler(
            {
              id: user.id,
              email: user.email!,
              name: user.name!,
              picture: user.image!,
            },
            account.provider
          );
          user.id = dbUser.id.toString();
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/",
    error: "/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

async function socialLoginHandler(
  profile: { id: string; email: string; name: string; picture: string },
  provider: string
): Promise<DbUser> {
  console.log("socialLoginHandler - Profile:", profile);
  console.log("socialLoginHandler - Provider:", provider);

  try {
    const result = await query<DbUser[]>(
      "SELECT * FROM Users WHERE email = ?",
      [profile.email]
    );

    if (!Array.isArray(result)) {
      console.error(
        "Expected an array from database query, got:",
        typeof result
      );
      throw new Error("Unexpected database query result");
    }

    const existingUsers = result;

    let user: DbUser;
    if (existingUsers && existingUsers.length > 0) {
      user = existingUsers[0];
      // Update user logic...
      await query(
        `UPDATE Users SET ${provider}_id = ?, is_verified = 1 WHERE id = ?`,
        [profile.id, user.id]
      );
    } else {
      const insertResult = await query<{ insertId: number }>(
        `INSERT INTO Users (email, ${provider}_id, is_verified) VALUES (?, ?, ?, ?, 1)`,
        [profile.email, profile.id]
      );

      if (!("insertId" in insertResult)) {
        throw new Error("Insert operation did not return an insertId");
      }

      user = {
        id: insertResult.insertId,
        email: profile.email,
        is_verified: true,
      };
    }

    return user;
  } catch (error) {
    console.error("Error in socialLoginHandler:", error);
    throw error;
  }
}
